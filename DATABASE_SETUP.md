# CreatorSecure - Database Setup Guide

## 🗄️ **Neon Postgres Database Integration**

### **Step 1: Database Connection**

Your Neon database connection string:
```
postgresql://neondb_owner:npg_dEFB80rRZwje@ep-small-bread-ah9xipxw-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

### **Step 2: Update .env.local**

Open `.env.local` and add your real keys:

```env
# Groq API Key for AI features  
GROQ_API_KEY=your_actual_groq_api_key_here

# Neon Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_dEFB80rRZwje@ep-small-bread-ah9xipxw-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

### **Step 3: Install Database Dependencies**

```bash
cd c:\Users\vanjarirajeshwari\Desktop\CreatorSecure-Standalone
npm install @neondatabase/serverless
```

### **Step 4: Apply Database Schema**

#### Option A: Via Neon Console (Recommended)
1. Go to https://console.neon.tech
2. Select your project: `winter-dawn-80196570`
3. Click "SQL Editor"
4. Copy and paste the contents of `database/schema.sql`
5. Click "Run" to execute

#### Option B: Via psql (if you have PostgreSQL installed)
```bash
psql "postgresql://neondb_owner:npg_dEFB80rRZwje@ep-small-bread-ah9xipxw-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" -f database/schema.sql
```

### **Step 5: Get Groq API Key**

1. Go to https://console.groq.com
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new API key
5. Copy the key and paste it in `.env.local`

### **Step 6: Restart Development Server**

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## ✅ **Features Now Available**

### **With Groq AI Integration:**
- ✨ Click "Generate with AI" button in Edit Profile modal
- 🤖 Auto-generates professional summary based on your profile
- 🎯 Uses Mixtral-8x7B model for high-quality text

### **With Neon Database:**
- 💾 Replace localStorage with real PostgreSQL database
- 🔄 Data persists across devices
- 👥 Multi-user support ready
- 📊 Scalable and production-ready

---

## 🔧 **Next Steps to Replace localStorage with Database**

After setup is complete, you'll need to:

1. Create database utility functions in `lib/db.ts`
2. Update API routes to use Neon instead of localStorage
3. Implement user authentication (optional but recommended)
4. Migrate any existing localStorage data to database

Would you like me to implement the database integration now?

---

## 📋 **Database Schema Overview**

The database includes the following tables:
- **users** - User profiles and information
- **social_links** - Social media connections
- **posts** - User posts with images
- **post_likes** - Track post likes
- **certificates** - User certificates
- **badges** - User achievement badges
- **teams** - Team management
- **team_members** - Team membership
- **followers** - Follow system

All tables have proper indexes and foreign key constraints for performance and data integrity.
