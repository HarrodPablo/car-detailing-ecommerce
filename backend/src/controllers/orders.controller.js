const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getOrders = async (req, res, next) => {
  try {
    const { fecha } = req.query; // hoy, semana, mes
    const where = {};
    
    if (fecha) {
      const now = new Date();
      if (fecha === 'hoy') {
        const startOfDay = new Date(now.setHours(0,0,0,0));
        where.createdAt = { gte: startOfDay };
      } else if (fecha === 'semana') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        where.createdAt = { gte: startOfWeek };
      } else if (fecha === 'mes') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        where.createdAt = { gte: startOfMonth };
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
    
    // items is an array of { productId?, kitId?, quantity, unitPrice, subtotal }
    const newOrder = await prisma.order.create({
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

    // Descuento automático de stock para productos
    for (const item of items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: Number(item.productId) },
          data: { stock: { decrement: Number(item.quantity) } }
        });
      } else if (item.kitId) {
        // Find kit items and decrement product stocks
        const kitItems = await prisma.kitItem.findMany({ where: { kitId: Number(item.kitId) }});
        for (const kItem of kitItems) {
          await prisma.product.update({
            where: { id: kItem.productId },
            data: { stock: { decrement: kItem.quantity * Number(item.quantity) } }
          });
        }
      }
    }

    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrders, createOrder, updateOrderStatus };
