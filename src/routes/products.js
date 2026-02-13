import express from 'express';
import { productDB } from '../db/database.js';

const router = express.Router();

/**
 * GET /api/products
 * Get all products from the latest ranking
 * Query params:
 *   - category: Filter by category (e.g., 스킨케어, 마스크팩)
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const products = await productDB.getLatestProducts(category);

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        error: category
          ? `No products found for category: ${category}`
          : 'No products found. Database may be empty.'
      });
    }

    // Get the ranking date from the first product
    const rankingDate = products[0]?.rankingDate;
    const updatedAt = products[0]?.crawledAt;

    res.json({
      success: true,
      data: {
        products,
        total: products.length,
        category: category || '전체',
        rankingDate,
        updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }

    const product = await productDB.getProductById(parseInt(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

/**
 * GET /api/products/date/:date
 * Get products by specific ranking date (YYYY-MM-DD)
 * Query params:
 *   - category: Filter by category
 */
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { category } = req.query;

    // Basic date format validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const products = await productDB.getProductsByDate(date, category);

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No products found for date: ${date}` + (category ? ` and category: ${category}` : '')
      });
    }

    res.json({
      success: true,
      data: {
        products,
        total: products.length,
        category: category || '전체',
        rankingDate: date,
        updatedAt: products[0]?.crawledAt
      }
    });
  } catch (error) {
    console.error('Error fetching products by date:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

export default router;
