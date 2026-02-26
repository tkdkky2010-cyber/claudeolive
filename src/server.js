// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import helmet from 'helmet';
import { initializeDatabase } from './db/database.js';
import { crawlWithRetry } from './crawler/oliveyoung.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { AUTH_CONFIG } from './config/auth.js';

// Import routes
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import cartRouter from './routes/cart.js';
import adminAuthRouter from './routes/admin-auth.js';
import sellerRouter from './routes/seller.js';


// Configuration
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize Express app
const app = express();

// Security middleware - must be applied early
app.use(helmet({
  contentSecurityPolicy: {
    directives: AUTH_CONFIG.SECURITY_HEADERS.CSP_DIRECTIVES
  },
  hsts: {
    maxAge: AUTH_CONFIG.SECURITY_HEADERS.HSTS_MAX_AGE,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny' // Prevent clickjacking
  },
  noSniff: true, // Prevent MIME type sniffing
  xssFilter: true // Enable XSS filter
}));

// CORS middleware - Allow all origins in development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware with size limits
app.use(express.json({ limit: AUTH_CONFIG.REQUEST_LIMITS.JSON_PAYLOAD }));
app.use(express.urlencoded({ extended: true, limit: AUTH_CONFIG.REQUEST_LIMITS.URLENCODED_PAYLOAD }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/admin-auth', adminAuthRouter);
app.use('/api/seller', sellerRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'OliveYoung Ranking Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/api/products',
      auth: '/api/auth',
      cart: '/api/cart',
      adminAuth: '/api/admin-auth',
      seller: '/api/seller'
    }
  });
});

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
(async () => {
  try {
    console.log('🔧 Initializing database...');
    await initializeDatabase();

    // Schedule daily crawling at 3 AM KST (6 PM UTC for KST = UTC+9)
    // Cron format: second minute hour day month weekday
    // '0 18 * * *' = daily at 6 PM UTC = 3 AM KST next day
    cron.schedule('0 3 * * *', async () => {
      console.log('\n⏰ Scheduled crawl started at 3 AM KST');
      try {
        // Crawl all 6 categories
        const result = await crawlWithRetry(['전체', '스킨케어', '마스크팩', '클렌징', '선케어', '헤어케어']);
        console.log('✅ Scheduled crawl completed:', result);
      } catch (error) {
        console.error('❌ Scheduled crawl failed:', error);
      }
    }, {
      timezone: 'Asia/Seoul'
    });

    console.log('📅 Scheduled daily crawling at 3:00 AM KST (1일 1회 - 법적 안전성 강화)');

    // Removed afternoon crawl - 1일 1회로 축소하여 법적 리스크 최소화
    // Optional: Schedule afternoon crawl at 3 PM KST (6 AM UTC)
    // cron.schedule('0 15 * * *', async () => {
    //   console.log('\n⏰ Scheduled crawl started at 3 PM KST');
    //   try {
    //     const result = await crawlWithRetry();
    //     console.log('✅ Scheduled crawl completed:', result);
    //   } catch (error) {
    //     console.error('❌ Scheduled crawl failed:', error);
    //   }
    // }, {
    //   timezone: 'Asia/Seoul'
    // });

    // console.log('📅 Scheduled daily crawling at 3:00 PM KST');

    // Start server
    app.listen(PORT, () => {
      console.log('\n🚀 Server is running!');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API endpoints: http://localhost:${PORT}/api`);
      console.log('\n✨ Ready to serve requests!\n');
    });
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
