require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { errorHandler, notFound } = require('./middlewares/error.middleware');
const initStockAlertJob = require('./jobs/stockAlert.job');
const initLotExpiryJob = require('./jobs/lotExpiry.job');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  /^https:\/\/goodshop-premium.*\.vercel\.app$/, // previews
].filter(Boolean);

// Middlewares
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // curl/postman
    const ok = allowedOrigins.some(o =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    callback(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Good Shop API is running' });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/brands', require('./routes/brands.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/kits', require('./routes/kits.routes'));
app.use('/api/combos', require('./routes/combos.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/alerts', require('./routes/alerts.routes'));
app.use('/api/lots', require('./routes/lots.routes')); // Added lots since it exists
app.use('/api/remove-bg', require('./routes/removebg.routes'));

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
