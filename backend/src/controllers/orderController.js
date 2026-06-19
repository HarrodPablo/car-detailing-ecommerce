const prisma = require('../prisma/client');

const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true, kit: true }
        }
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo pedidos', error });
  }
};

const createOrder = async (req, res) => {
  try {
    const { customerName, customerPhone, notes, items } = req.body;
    
    // Calculate total from items
    const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const order = await prisma.order.create({
      data: {
        customerName, customerPhone, notes, total,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            kitId: item.kitId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice
          }))
        }
      },
      include: { items: true }
    });

    // Discount stock for products (not handled fully here, just an example of what would be needed)
    for (const item of items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
      if (item.kitId) {
        const kit = await prisma.kit.findUnique({ where: { id: item.kitId }, include: { items: true } });
        if (kit) {
          for (const kitItem of kit.items) {
            await prisma.product.update({
              where: { id: kitItem.productId },
              data: { stock: { decrement: item.quantity * kitItem.quantity } }
            });
          }
        }
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creando pedido', error });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando pedido', error });
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  updateOrderStatus
};
