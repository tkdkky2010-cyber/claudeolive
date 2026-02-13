import express from 'express';
import { cartDB } from '../db/database.js';
import { authenticateToken, requireEmailVerification } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// Cart operations require email verification (security measure)
// Users can browse without verification, but must verify to add items
router.use(requireEmailVerification);

/**
 * GET /api/cart
 * Get all items in user's cart
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await cartDB.getCartItems(userId);

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => {
      return sum + (item.salePrice * item.quantity);
    }, 0);

    const totalOriginalPrice = cartItems.reduce((sum, item) => {
      return sum + (item.originalPrice * item.quantity);
    }, 0);

    const totalSavings = totalOriginalPrice - totalPrice;

    res.json({
      success: true,
      data: {
        items: cartItems,
        summary: {
          itemCount: cartItems.length,
          totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          totalOriginalPrice,
          totalPrice,
          totalSavings
        }
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart'
    });
  }
});

/**
 * POST /api/cart
 * Add item to cart
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    if (quantity && (isNaN(quantity) || quantity < 1)) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive number'
      });
    }

    const success = await cartDB.addToCart(userId, productId, quantity || 1);

    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to add item to cart'
      });
    }

    // Get updated cart
    const cartItems = await cartDB.getCartItems(userId);

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        items: cartItems
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);

    // Handle foreign key constraint error (product doesn't exist)
    if (error.message.includes('FOREIGN KEY constraint failed')) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart'
    });
  }
});

/**
 * PATCH /api/cart/:id
 * Update cart item quantity
 */
router.patch('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.id);
    const { quantity } = req.body;

    // Validation
    if (isNaN(cartItemId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cart item ID'
      });
    }

    if (!quantity || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive number'
      });
    }

    const success = await cartDB.updateQuantity(cartItemId, userId, quantity);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found or unauthorized'
      });
    }

    // Get updated cart
    const cartItems = await cartDB.getCartItems(userId);

    res.json({
      success: true,
      message: 'Cart item updated',
      data: {
        items: cartItems
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart item'
    });
  }
});

/**
 * DELETE /api/cart/:id
 * Remove item from cart
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.id);

    // Validation
    if (isNaN(cartItemId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cart item ID'
      });
    }

    const success = await cartDB.removeFromCart(cartItemId, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found or unauthorized'
      });
    }

    // Get updated cart
    const cartItems = await cartDB.getCartItems(userId);

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        items: cartItems
      }
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove cart item'
    });
  }
});

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const deletedCount = await cartDB.clearCart(userId);

    res.json({
      success: true,
      message: `Removed ${deletedCount} items from cart`,
      data: {
        deletedCount
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
});

export default router;
