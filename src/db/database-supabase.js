import { supabase } from '../config/supabase.js';

/**
 * Supabase Database Operations
 * Replaces better-sqlite3 with cloud PostgreSQL database
 */

/**
 * Initialize database schema (not needed for Supabase - run schema manually)
 */
export async function initializeDatabase() {
  try {
    // Test connection
    const { data, error } = await supabase.from('products').select('count').limit(1);
    if (error) throw error;

    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
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
    const productsToInsert = products.map(product => ({
      rank: product.rank,
      category: product.category || '전체',
      product_name: product.name,
      original_price: product.originalPrice,
      sale_price: product.salePrice,
      discount_rate: product.discountRate,
      oliveyoung_url: product.url,
      image_url: product.imageUrl || null,
      review_count: product.reviewCount || null,
      review_score: product.reviewScore || null,
      ranking_date: rankingDate,
      crawled_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('products')
      .upsert(productsToInsert, {
        onConflict: 'ranking_date,category,rank',
        ignoreDuplicates: false
      });

    if (error) throw error;
    return products.length;
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

    if (dateError) throw dateError;
    if (!maxDateData) return [];

    const maxDate = maxDateData.ranking_date;

    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .eq('ranking_date', maxDate);

    if (category) {
      query = query.eq('category', category);
    }

    query = query.order('category').order('rank');

    const { data, error } = await query;
    if (error) throw error;

    // Transform to match expected format
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
      reviewCount: p.review_count || null,
      reviewScore: p.review_score || null,
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
      throw error;
    }

    if (!data) return null;

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
      reviewCount: data.review_count || null,
      reviewScore: data.review_score || null,
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
    if (error) throw error;

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
      reviewCount: p.review_count || null,
      reviewScore: p.review_score || null,
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
  upsertUser: async (googleId, email, name, avatarUrl) => {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        google_id: googleId,
        email: email,
        name: name,
        avatar_url: avatarUrl,
        auth_method: 'google'
      }, {
        onConflict: 'google_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) throw error;
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
      throw error;
    }
    return data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
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
      throw error;
    }
    return data;
  },

  /**
   * Create email user (for email-based signup)
   */
  createEmailUser: async (email, passwordHash, name = null) => {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: email,
        password_hash: passwordHash,
        name: name,
        auth_method: 'email',
        role: 'user',
        email_verified: false
      })
      .select()
      .single();

    if (error) throw error;
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

    if (error) throw error;
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

    if (error) throw error;

    // Transform to match expected format
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
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Update existing item
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);

      if (error) throw error;
      return true;
    } else {
      // Insert new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity: quantity
        });

      if (error) throw error;
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

    if (error) throw error;
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

    if (error) throw error;
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

    if (error) throw error;
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

    if (error) throw error;
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

    if (error) throw error;
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

    if (error) throw error;
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

    if (error) throw error;
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

    if (tokenError || !tokenData) {
      return null;
    }

    // Mark token as used
    const { error: updateTokenError } = await supabase
      .from('email_verification_tokens')
      .update({
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', tokenData.id);

    if (updateTokenError) throw updateTokenError;

    // Mark user as verified
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('id', tokenData.user_id);

    if (updateUserError) throw updateUserError;

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

    if (error) throw error;
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

    const { data, error } = await supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: false })
      .eq('email', email)
      .eq('successful', false)
      .gt('attempted_at', fifteenMinutesAgo.toISOString());

    if (error) throw error;
    return { count: (data || []).length };
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

    if (error) throw error;
  },

  /**
   * Clear all login attempts for an email (after successful login or timeout)
   */
  clearLoginAttempts: async (email) => {
    const { error } = await supabase
      .from('login_attempts')
      .delete()
      .eq('email', email);

    if (error) throw error;
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

    if (error) throw error;
    return (data || []).length;
  }
};

// Note: adminDB, orderDB, shipmentDB, returnDB, csDB are not included
// as these tables don't exist in the current Supabase schema
// If needed, they can be added later

export default supabase;
