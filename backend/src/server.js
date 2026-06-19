require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { errorHandler, notFound } = require('./middlewares/error.middleware');
const initStockAlertJob = require('./jobs/stockAlert.job');
const initLotExpiryJob = require('./jobs/lotExpiry.job');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Good Shop API is running' });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/products', require('./routes/products.route'));
app.use('/api/brands', require('./routes/brands.route'));
app.use('/api/categories', require('./routes/categories.route'));
app.use('/api/kits', require('./routes/kits.route'));
app.use('/api/combos', require('./routes/combos.route'));
app.use('/api/orders', require('./routes/orders.route'));
app.use('/api/reports', require('./routes/reports.route'));
app.use('/api/settings', require('./routes/settings.route'));
app.use('/api/alerts', require('./routes/alerts.route'));

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Cron Jobs
if (process.env.NODE_ENV !== 'test') {
  initStockAlertJob();
  initLotExpiryJob();
  console.log('Cron jobs inicializados');
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
