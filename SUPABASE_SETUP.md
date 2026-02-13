# 🚀 Supabase Integration Guide

## Why Supabase?

**Benefits over SQLite:**
- ✅ Cloud-hosted PostgreSQL database
- ✅ Real-time subscriptions
- ✅ Built-in authentication (optional)
- ✅ Auto-generated REST API
- ✅ Row Level Security (RLS)
- ✅ No server file system needed
- ✅ Easy scaling
- ✅ Free tier available

---

## 📋 Setup Steps

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** (or **"New Project"**)
3. Sign in with GitHub
4. Create a new organization (if needed)
5. Click **"New project"**
6. Fill in:
   - **Name:** `oliveyoung-ranking` (or your choice)
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose closest to you (e.g., `Northeast Asia (Seoul)`)
   - **Pricing Plan:** Free tier is fine for development
7. Click **"Create new project"**
8. Wait 2-3 minutes for database to provision

---

### 2. Get Your Credentials

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy the following:
   - **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   - **anon/public key** (for frontend)
   - **service_role key** (for backend - **keep secret!**)

4. Add to your `.env` file:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here  # Keep secret!
```

---

### 3. Create Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Copy the entire contents of `src/db/schema-postgres.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press `Ctrl/Cmd + Enter`)
6. Verify tables are created: Go to **Table Editor** → You should see:
   - products
   - users
   - cart_items
   - crawl_logs
   - login_attempts
   - email_verification_tokens

---

### 4. Configure Row Level Security (Optional)

**Option A: Disable RLS for Backend (Easier)**

If you want the backend to have full access:

```sql
-- Run this in SQL Editor
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens DISABLE ROW LEVEL SECURITY;
```

**Option B: Use Service Role Key (Recommended)**

The service role key bypasses RLS, so you can keep RLS enabled for security.
Make sure you're using `SUPABASE_SERVICE_KEY` in the backend (already configured).

---

### 5. Update Backend to Use Supabase

**Current Status:**
- ✅ `@supabase/supabase-js` installed
- ✅ `src/config/supabase.js` created
- ✅ PostgreSQL schema ready
- ⏳ Database operations need to be updated

**What needs to be done:**

1. **Update `src/db/database.js`** to use Supabase instead of SQLite
2. **Update all database queries** to use Supabase syntax
3. **Test the migration**

---

## 🔄 Migration Strategy

### Approach 1: Dual Database Support (Recommended for testing)

Keep both SQLite and Supabase, switch via environment variable:

```bash
# .env
DATABASE_TYPE=supabase  # or 'sqlite'
```

### Approach 2: Full Migration (Clean switch)

Replace SQLite completely with Supabase.

---

## 📊 Database Query Comparison

### SQLite (better-sqlite3)
```javascript
const db = new Database('./data/oliveyoung.db');
const products = db.prepare('SELECT * FROM products WHERE category = ?').all('전체');
```

### Supabase (PostgreSQL)
```javascript
import { supabase } from './config/supabase.js';
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('category', '전체');
```

---

## 🎯 Next Steps

### Automatic Migration (I can do this for you)

Would you like me to:

1. ✅ **Create a new Supabase-compatible database.js**
2. ✅ **Update all database operations** (productDB, userDB, cartDB, etc.)
3. ✅ **Add migration script** to copy data from SQLite → Supabase
4. ✅ **Test everything** with your new Supabase database

### Manual Testing (Do this first)

Before full migration:

1. **Set up Supabase project** (Steps 1-3 above)
2. **Add credentials to .env**
3. **Test connection:**
   ```bash
   node src/config/supabase.js
   ```
4. **Let me know when ready**, and I'll migrate the code!

---

## 🔒 Security Notes

⚠️ **Important:**
- **Never commit** `.env` file to Git
- **Never expose** `SUPABASE_SERVICE_KEY` in frontend code
- Use `SUPABASE_ANON_KEY` for frontend (if needed)
- Keep `SUPABASE_SERVICE_KEY` only in backend

---

## 📞 Need Help?

Just say:
- **"Migrate to Supabase now"** → I'll update all the code
- **"Test Supabase connection"** → I'll verify your setup
- **"Show me the differences"** → I'll explain the changes

Ready to proceed? 🚀
