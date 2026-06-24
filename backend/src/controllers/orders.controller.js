const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getOrders = async (req, res, next) => {
  try {
    const { fecha, desde, hasta } = req.query; // hoy, semana, mes, custom
    const where = {};

    if (fecha) {
      const now = new Date();
      if (fecha === 'hoy') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        where.createdAt = { gte: startOfDay };
      } else if (fecha === 'semana') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        where.createdAt = { gte: startOfWeek };
      } else if (fecha === 'mes') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        where.createdAt = { gte: startOfMonth };
      } else if (fecha === 'custom' && desde && hasta) {
        const startDate = new Date(desde);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(hasta);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt = { gte: startDate, lte: endDate };
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true, kit: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { customerName, customerPhone, notes, total, items } = req.body;

    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Descontar y validar stock de cada item
      for (const item of items) {
        const qty = Number(item.quantity);
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: Number(item.productId) }});
          if (!product || product.stock < qty) {
            throw new Error(`Stock insuficiente para el producto: ${product?.name || 'ID '+item.productId}`);
          }
          await tx.product.update({
            where: { id: Number(item.productId) },
            data: { stock: { decrement: qty } }
          });
        } else if (item.kitId) {
          const kitItems = await tx.kitItem.findMany({ where: { kitId: Number(item.kitId) }, include: { product: true } });
          for (const kItem of kitItems) {
            const requiredQty = kItem.quantity * qty;
            if (kItem.product.stock < requiredQty) {
              throw new Error(`Stock insuficiente para el producto dentro del combo: ${kItem.product.name}`);
            }
            await tx.product.update({
              where: { id: kItem.productId },
              data: { stock: { decrement: requiredQty } }
            });
          }
        }
      }

      // 2. Crear la orden
      const order = await tx.order.create({
        data: {
          customerName, customerPhone, notes, total: Number(total),
          items: {
            create: items.map(item => ({
              productId: item.productId ? Number(item.productId) : null,
              kitId: item.kitId ? Number(item.kitId) : null,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              subtotal: Number(item.subtotal)
            }))
          }
        },
        include: { items: true }
      });

      return order;
    });

    res.status(201).json(newOrder);
  } catch (error) {
    if (error.message.includes('Stock insuficiente')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const adjustStockInTx = async (tx, orderId, operation) => {
  const order = await tx.order.findUnique({
    where: { id: Number(orderId) },
    include: { items: true }
  });

  if (!order) return;

  for (const item of order.items) {
    if (item.productId) {
      if (operation === 'decrement') {
        const p = await tx.product.findUnique({ where: { id: item.productId }});
        if (p.stock < item.quantity) throw new Error(`Stock insuficiente para el producto ID ${item.productId}`);
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { [operation]: item.quantity } }
      });
    } else if (item.kitId) {
      const kitItems = await tx.kitItem.findMany({ where: { kitId: item.kitId } });
      for (const kItem of kitItems) {
        const qtyToAdjust = kItem.quantity * item.quantity;
        if (operation === 'decrement') {
          const p = await tx.product.findUnique({ where: { id: kItem.productId }});
          if (p.stock < qtyToAdjust) throw new Error(`Stock insuficiente para el producto ID ${kItem.productId}`);
        }
        await tx.product.update({
          where: { id: kItem.productId },
          data: { stock: { [operation]: qtyToAdjust } }
        });
      }
    }
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pendiente', 'en_camino', 'entregado', 'cancelado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado de pedido inválido' });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({ where: { id: Number(id) } });
      if (!currentOrder) throw new Error('Pedido no encontrado');

      const oldStatus = currentOrder.status;
      const newStatus = status;

      if (oldStatus !== newStatus) {
        if (newStatus === 'cancelado') {
          // Devuelve stock
          await adjustStockInTx(tx, id, 'increment');
        } else if (oldStatus === 'cancelado' && newStatus !== 'cancelado') {
          // Vuelve a descontar stock
          await adjustStockInTx(tx, id, 'decrement');
        }
      }

      return await tx.order.update({
        where: { id: Number(id) },
        data: { status }
      });
    });

    res.json(updatedOrder);
  } catch (error) {
    if (error.message.includes('Stock insuficiente') || error.message === 'Pedido no encontrado') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({ where: { id: Number(id) } });
      if (!currentOrder) throw new Error('Pedido no encontrado');

      // Si no estaba cancelado, devuelve el stock retenido
      if (currentOrder.status !== 'cancelado') {
        await adjustStockInTx(tx, id, 'increment');
      }

      await tx.order.delete({
        where: { id: Number(id) }
      });
    });

    res.json({ message: 'Pedido eliminado' });
  } catch (error) {
    if (error.message === 'Pedido no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

module.exports = { getOrders, createOrder, updateOrderStatus, deleteOrder };
