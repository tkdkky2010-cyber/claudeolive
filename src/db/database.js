import { supabase } from '../config/supabase.js';

/**
 * Supabase Database Operations
 * This file replaces better-sqlite3 with cloud PostgreSQL database using Supabase.
 * All database interaction logic is centralized here.
 */

/**
 * Initialize database schema (for Supabase, this means creating tables if they don't exist)
 * This function will be called on server startup to ensure schema is ready.
 */
export async function initializeDatabase() {
  try {
    // Check if the products table exists. If not, attempt to create schema.
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') { // 42P01 is "undefined_table"
      console.log('⚠️ Products table not found. Attempting to create schema...');
      // In a real application, you'd run your schema-postgres.sql here
      // For this setup, we assume the user has run it manually in Supabase.
      // This is a placeholder for potential future auto-schema migration.
      console.log('Please ensure src/db/schema-postgres.sql has been run in your Supabase SQL Editor.');
      throw new Error('Supabase schema not initialized. Please run src/db/schema-postgres.sql.');
    } else if (error) {
      throw error; // Other Supabase errors
    }

    console.log('✅ Supabase connection and schema check successful');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize/check Supabase schema:', error.message);
    throw error;
  }
}

/**
 * Product-related database operations
 */
export const productDB = {
  /**
   * Insert or update products for a specific ranking date
   * Uses UPSERT logic to handle re-crawled data
   */
  upsertProducts: async (products, rankingDate) => {
    // Map product objects to match the Supabase 'products' table schema (snake_case)
    const productsToInsert = products.map(product => ({
      rank: product.rank,
      category: product.category || '전체',
      product_name: product.name,
      original_price: product.originalPrice,
      sale_price: product.salePrice,
      discount_rate: product.discountRate,
      oliveyoung_url: product.url,
      image_url: product.imageUrl || null, // Ensure imageUrl is mapped to image_url
      ranking_date: rankingDate,
      crawled_at: new Date().toISOString()
    }));

    // Perform the upsert operation
    const { data, error } = await supabase
      .from('products')
      .upsert(productsToInsert, {
        onConflict: 'ranking_date,category,rank', // Conflict resolution columns
        ignoreDuplicates: false // Ensure updates happen on conflict
      });

    if (error) {
      console.error('Supabase upsertProducts error:', error);
      throw error;
    }
    return products.length; // Return count of processed products
  },

  /**
   * Get all products for the most recent ranking date
   * Filter by category (including '전체')
   */
  getLatestProducts: async (category = null) => {
    // Get the most recent ranking date
    const { data: maxDateData, error: dateError } = await supabase
      .from('products')
      .select('ranking_date')
      .order('ranking_date', { ascending: false })
      .limit(1)
      .single();

    if (dateError) {
      console.error('Supabase getLatestProducts (maxDate) error:', dateError);
      throw dateError;
    }
    if (!maxDateData) return [];

    const maxDate = maxDateData.ranking_date;

    // Build query to get products for the max date, optionally filtered by category
    let query = supabase
      .from('products')
      .select('*') // Select all columns, including image_url
      .eq('ranking_date', maxDate);

    if (category) {
      query = query.eq('category', category);
    }

    query = query.order('category').order('rank');

    const { data, error } = await query;
    if (error) {
      console.error('Supabase getLatestProducts error:', error);
      throw error;
    }

    // Transform data from snake_case to camelCase for consistency with frontend
    return (data || []).map(p => ({
      id: p.id,
      rank: p.rank,
      category: p.category,
      name: p.product_name, // Map product_name to name
      originalPrice: p.original_price, // Map original_price to originalPrice
      salePrice: p.sale_price, // Map sale_price to salePrice
      discountRate: p.discount_rate, // Map discount_rate to discountRate
      url: p.oliveyoung_url, // Map oliveyoung_url to url
      imageUrl: p.image_url, // Map image_url to imageUrl
      rankingDate: p.ranking_date,
      crawledAt: p.crawled_at
    }));
  },

  /**
   * Get a single product by ID
   */
  getProductById: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Supabase getProductById error:', error);
      throw error;
    }

    if (!data) return null;

    // Transform data from snake_case to camelCase
    return {
      id: data.id,
      rank: data.rank,
      category: data.category,
      name: data.product_name,
      originalPrice: data.original_price,
      salePrice: data.sale_price,
      discountRate: data.discount_rate,
      url: data.oliveyoung_url,
      imageUrl: data.image_url,
      rankingDate: data.ranking_date,
      crawledAt: data.crawled_at
    };
  },

  /**
   * Get products by ranking date
   * Filter by category (including '전체')
   */
  getProductsByDate: async (rankingDate, category = null) => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('ranking_date', rankingDate);

    if (category) {
      query = query.eq('category', category);
    }

    query = query.order('category').order('rank');

    const { data, error } = await query;
    if (error) {
      console.error('Supabase getProductsByDate error:', error);
      throw error;
    }

    // Transform data from snake_case to camelCase
    return (data || []).map(p => ({
      id: p.id,
      rank: p.rank,
      category: p.category,
      name: p.product_name,
      originalPrice: p.original_price,
      salePrice: p.sale_price,
      discountRate: p.discount_rate,
      url: p.oliveyoung_url,
      imageUrl: p.image_url,
      rankingDate: p.ranking_date,
      crawledAt: p.crawled_at
    }));
  }
};

/**
 * User-related database operations
 */
export const userDB = {
  /**
   * Create or update user from Google OAuth
   */
  upsertUser: async (supabaseId, email, name, avatarUrl) => {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        supabase_id: supabaseId,
        google_id: supabaseId, // For Google users, use same ID
        email: email,
        name: name,
        avatar_url: avatarUrl,
        auth_method: 'google'
      }, {
        onConflict: 'supabase_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase upsertUser error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get user by Google ID
   */
  getUserByGoogleId: async (googleId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Supabase getUserByGoogleId error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get user by ID (Internal Integer ID or Supabase UUID)
   */
  getUserById: async (id) => {
    let query = supabase.from('users').select('*');

    // Check if id is a UUID (Supabase string ID) or a BIGINT (our internal ID)
    if (typeof id === 'string' && id.includes('-')) {
      query = query.eq('supabase_id', id);
    } else {
      query = query.eq('id', id);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Supabase getUserById error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get user by Supabase UUID
   */
  getUserBySupabaseId: async (supabaseId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('supabase_id', supabaseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Supabase getUserBySupabaseId error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get user by email
   */
  getUserByEmail: async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Supabase getUserByEmail error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Create email user (for email-based signup)
   */
  createEmailUser: async (email, passwordHash, name = null, supabaseId = null) => {
    const { data, error } = await supabase
      .from('users')
      .insert({
        supabase_id: supabaseId,
        email: email,
        password_hash: passwordHash,
        name: name,
        auth_method: 'email',
        role: 'user',
        email_verified: false
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase createEmailUser error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Update user role (admin management)
   */
  updateUserRole: async (userId, role) => {
    const { error } = await supabase
      .from('users')
      .update({ role: role })
      .eq('id', userId);

    if (error) {
      console.error('Supabase updateUserRole error:', error);
      throw error;
    }
    return true;
  },

  /**
   * Update email verification status
   */
  updateEmailVerification: async (userId, verified) => {
    const { error } = await supabase
      .from('users')
      .update({ email_verified: verified })
      .eq('id', userId);

    if (error) {
      console.error('Supabase updateEmailVerification error:', error);
      throw error;
    }
    return true;
  }
};

/**
 * Cart-related database operations
 */
export const cartDB = {
  /**
   * Get all cart items for a user
   */
  getCartItems: async (userId) => {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        created_at,
        products (
          id,
          rank,
          category,
          product_name,
          original_price,
          sale_price,
          discount_rate,
          oliveyoung_url,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getCartItems error:', error);
      throw error;
    }

    // Transform to match expected format (camelCase for product details)
    return (data || []).map(item => ({
      id: item.id,
      quantity: item.quantity,
      createdAt: item.created_at,
      productId: item.products.id,
      rank: item.products.rank,
      category: item.products.category,
      name: item.products.product_name,
      originalPrice: item.products.original_price,
      salePrice: item.products.sale_price,
      discountRate: item.products.discount_rate,
      url: item.products.oliveyoung_url,
      imageUrl: item.products.image_url
    }));
  },

  /**
   * Add item to cart (or update quantity if already exists)
   */
  addToCart: async (userId, productId, quantity = 1) => {
    // Check if item already exists
    const { data: existing, error: selectError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Supabase addToCart (select) error:', selectError);
      throw selectError;
    }

    if (existing) {
      // Update existing item
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Supabase addToCart (update) error:', updateError);
        throw updateError;
      }
      return true;
    } else {
      // Insert new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity: quantity
        });

      if (insertError) {
        console.error('Supabase addToCart (insert) error:', insertError);
        throw insertError;
      }
      return true;
    }
  },

  /**
   * Update cart item quantity
   */
  updateQuantity: async (cartItemId, userId, quantity) => {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: quantity })
      .eq('id', cartItemId)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase updateQuantity error:', error);
      throw error;
    }
    return true;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (cartItemId, userId) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase removeFromCart error:', error);
      throw error;
    }
    return true;
  },

  /**
   * Clear all cart items for a user
   */
  clearCart: async (userId) => {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Supabase clearCart error:', error);
      throw error;
    }
    return (data || []).length;
  }
};

/**
 * Crawl log-related database operations
 */
export const crawlLogDB = {
  /**
   * Create a new crawl log entry
   */
  createLog: async () => {
    const { data, error } = await supabase
      .from('crawl_logs')
      .insert({
        started_at: new Date().toISOString(),
        status: 'running'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase createLog error:', error);
      throw error;
    }
    return data.id;
  },

  /**
   * Update crawl log on completion
   */
  completeLog: async (logId, status, productsCount = 0, errorMessage = null) => {
    const { error } = await supabase
      .from('crawl_logs')
      .update({
        completed_at: new Date().toISOString(),
        status: status,
        products_count: productsCount,
        error_message: errorMessage
      })
      .eq('id', logId);

    if (error) {
      console.error('Supabase completeLog error:', error);
      throw error;
    }
  },

  /**
   * Get recent crawl logs
   */
  getRecentLogs: async (limit = 10) => {
    const { data, error } = await supabase
      .from('crawl_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase getRecentLogs error:', error);
      throw error;
    }
    return data || [];
  }
};

/**
 * Email Verification database operations
 */
export const emailVerificationDB = {
  /**
   * Create a new email verification token
   */
  createToken: async (userId, token) => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    const { error } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: userId,
        token: token,
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      console.error('Supabase createToken error:', error);
      throw error;
    }
  },

  /**
   * Get token details by token string
   */
  getToken: async (token) => {
    const { data, error } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Supabase getToken error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Verify and use a token
   */
  useToken: async (token) => {
    // Get token data
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError) {
      if (tokenError.code !== 'PGRST116') {
        console.error('Supabase useToken (select) error:', tokenError);
        throw tokenError;
      }
      return null; // Token not found or already used/expired
    }
    if (!tokenData) return null;

    // Mark token as used
    const { error: updateTokenError } = await supabase
      .from('email_verification_tokens')
      .update({
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', tokenData.id);

    if (updateTokenError) {
      console.error('Supabase useToken (update token) error:', updateTokenError);
      throw updateTokenError;
    }

    // Mark user as verified
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('id', tokenData.user_id);

    if (updateUserError) {
      console.error('Supabase useToken (update user) error:', updateUserError);
      throw updateUserError;
    }

    return tokenData;
  },

  /**
   * Clean up expired tokens (older than 7 days)
   */
  cleanupExpiredTokens: async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('email_verification_tokens')
      .delete()
      .lt('expires_at', sevenDaysAgo.toISOString())
      .select();

    if (error) {
      console.error('Supabase cleanupExpiredTokens error:', error);
      throw error;
    }
    return (data || []).length;
  }
};

/**
 * Authentication-related database operations (login attempts, account lockout)
 */
export const authDB = {
  /**
   * Get count of recent failed login attempts for an email
   */
  getRecentFailedAttempts: async (email) => {
    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

    const { count, error } = await supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: false })
      .eq('email', email)
      .eq('successful', false)
      .gt('attempted_at', fifteenMinutesAgo.toISOString());

    if (error) {
      console.error('Supabase getRecentFailedAttempts error:', error);
      throw error;
    }
    return { count: count || 0 };
  },

  /**
   * Record a login attempt (successful or failed)
   */
  recordLoginAttempt: async (email, ipAddress, successful) => {
    const { error } = await supabase
      .from('login_attempts')
      .insert({
        email: email,
        ip_address: ipAddress,
        successful: successful,
        attempted_at: new Date().toISOString()
      });

    if (error) {
      console.error('Supabase recordLoginAttempt error:', error);
      throw error;
    }
  },

  /**
   * Clear all login attempts for an email (after successful login or timeout)
   */
  clearLoginAttempts: async (email) => {
    const { error } = await supabase
      .from('login_attempts')
      .delete()
      .eq('email', email);

    if (error) {
      console.error('Supabase clearLoginAttempts error:', error);
      throw error;
    }
  },

  /**
   * Clean up old login attempts (older than 24 hours)
   */
  cleanupOldAttempts: async () => {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data, error } = await supabase
      .from('login_attempts')
      .delete()
      .lt('attempted_at', twentyFourHoursAgo.toISOString())
      .select();

    if (error) {
      console.error('Supabase cleanupOldAttempts error:', error);
      throw error;
    }
    return (data || []).length;
  }
};

// Stub exports for tables not yet implemented in Supabase (if needed, ensure they are in schema)
export const adminDB = {
  getAdminByEmail: async (email) => {
    const { data, error } = await supabase
      .from('admins') // Assuming an 'admins' table exists
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Supabase getAdminByEmail error:', error);
      throw error;
    }
    return data;
  },
  getAdminById: async (id) => {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Supabase getAdminById error:', error);
      throw error;
    }
    return data;
  },
  updateLastLogin: async (adminId) => {
    const { error } = await supabase
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', adminId);

    if (error) {
      console.error('Supabase updateLastLogin error:', error);
      throw error;
    }
    return true;
  }
};

export const orderDB = {
  getAllOrders: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*');

    if (error) {
      console.error('Supabase getAllOrders error:', error);
      throw error;
    }
    return data || [];
  },
  getOrderById: async (id) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Supabase getOrderById error:', error);
      throw error;
    }
    return data;
  },
  updateOrderStatus: async (id, status) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: status })
      .eq('id', id);

    if (error) {
      console.error('Supabase updateOrderStatus error:', error);
      throw error;
    }
    return true;
  },
  getOrderCountByStatus: async () => {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: false })
      .is('status', null); // Adjust based on actual status column and desired filter

    if (error) {
      console.error('Supabase getOrderCountByStatus error:', error);
      throw error;
    }
    return count || 0;
  }
};

export const shipmentDB = {
  upsertShipment: async (shipmentData) => {
    const { data, error } = await supabase
      .from('shipments')
      .upsert(shipmentData, { onConflict: 'order_id' }); // Assuming order_id is unique and primary for upsert

    if (error) {
      console.error('Supabase upsertShipment error:', error);
      throw error;
    }
    return data;
  },
  getByOrderId: async (orderId) => {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Supabase getByOrderId error:', error);
      throw error;
    }
    return data;
  },
  markAsDelivered: async (shipmentId) => {
    const { error } = await supabase
      .from('shipments')
      .update({ status: 'delivered', delivered_at: new Date().toISOString() })
      .eq('id', shipmentId);

    if (error) {
      console.error('Supabase markAsDelivered error:', error);
      throw error;
    }
    return true;
  }
};

export const returnDB = {
  getAllReturns: async () => {
    const { data, error } = await supabase
      .from('returns')
      .select('*');

    if (error) {
      console.error('Supabase getAllReturns error:', error);
      throw error;
    }
    return data || [];
  },
  updateReturnStatus: async (returnId, status) => {
    const { error } = await supabase
      .from('returns')
      .update({ status: status })
      .eq('id', returnId);

    if (error) {
      console.error('Supabase updateReturnStatus error:', error);
      throw error;
    }
    return true;
  }
};

export const csDB = {
  getAllInquiries: async () => {
    const { data, error } = await supabase
      .from('cs_inquiries')
      .select('*');

    if (error) {
      console.error('Supabase getAllInquiries error:', error);
      throw error;
    }
    return data || [];
  },
  getInquiryById: async (id) => {
    const { data, error } = await supabase
      .from('cs_inquiries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Supabase getInquiryById error:', error);
      throw error;
    }
    return data;
  },
  replyToInquiry: async (inquiryId, replyText) => {
    const { error } = await supabase
      .from('cs_inquiries')
      .update({ reply_text: replyText, status: 'replied', replied_at: new Date().toISOString() })
      .eq('id', inquiryId);

    if (error) {
      console.error('Supabase replyToInquiry error:', error);
      throw error;
    }
    return true;
  },
  getPendingCount: async () => {
    const { count, error } = await supabase
      .from('cs_inquiries')
      .select('*', { count: 'exact', head: false })
      .eq('status', 'pending');

    if (error) {
      console.error('Supabase getPendingCount error:', error);
      throw error;
    }
    return count || 0;
  }
};


export default supabase;