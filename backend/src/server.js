process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'ALLOWED_ADMIN_EMAILS',
  'FRONTEND_URL'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ FATAL: Variable de entorno ${varName} no definida`);
    process.exit(1);
  }
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middlewares/error.middleware');
const initStockAlertJob = require('./jobs/stockAlert.job');
const initLotExpiryJob = require('./jobs/lotExpiry.job');
const cron = require('node-cron');
const prisma = require('./prisma/client');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  /^https:\/\/goodshop-premium.*\.vercel\.app$/,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const ok = allowedOrigins.some(o =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    callback(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://images.unsplash.com", "https://i.ibb.co", "https://*.ibb.co"],
      mediaSrc: ["'self'", "blob:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
    },
  },
}));
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const passport = require('./config/passport');
app.use(passport.initialize());

app.use('/api/health', require('./routes/health.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/brands', require('./routes/brands.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/kits', require('./routes/kits.routes'));
app.use('/api/combos', require('./routes/combos.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/gastos', require('./routes/gastos.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/alerts', require('./routes/alerts.routes'));
app.use('/api/lots', require('./routes/lots.routes'));
// app.use('/api/remove-bg', require('./routes/removebg.routes'));
app.use('/api/remove-bg', (req, res) => {
  res.status(503).json({
    message: 'Función de remoción de fondo temporalmente deshabilitada en este entorno.'
  });
});

app.use((req, res) => {
  res.status(404).json({ message: `Ruta no encontrada - ${req.path}` });
});
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  initStockAlertJob();
  initLotExpiryJob();

  cron.schedule('*/4 * * * *', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('[keep-alive] Neon ping OK');
    } catch (e) {
      console.error('[keep-alive] Neon ping failed:', e.message);
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
