# 🚀 Vercel Deployment Guide for Glass Billing SaaS

This guide walks you through taking your Glass Billing & Plant Management SaaS live on **Vercel** in under 5 minutes.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:
1. A **MongoDB Atlas** account (free cloud database).
2. A **GitHub** account (to host your repository).
3. A **Vercel** account ([vercel.com](https://vercel.com)).

---

## Step 1: Set Up MongoDB Atlas (Cloud Database)

Since Vercel runs in the cloud, it cannot connect to your local `localhost:27017` database.

1. Sign up or log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Build a Database** and select the **M0 Free (Shared)** tier.
3. Under **Security Quickstart**:
   - Create a database user (e.g. username: `glassadmin`, password: `yourSecurePassword123`).
   - Under **Where would you like to connect from?**, choose **Allow Access from Anywhere (`0.0.0.0/0`)** — this is essential for cloud serverless functions.
4. Click **Create User** and **Finish and Close**.
5. On your cluster dashboard, click **Connect** → **Drivers**.
6. Copy the connection string. It will look like this:
   ```text
   mongodb+srv://glassadmin:<password>@cluster0.xxxx.mongodb.net/glass_billing?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your actual password and ensure the database name is `glass_billing`)*.

---

## Step 2: Push Your Code to GitHub

If your project is not yet on GitHub:

```bash
# In your project folder:
git init
git add .
git commit -m "Configure project for unified Vercel deployment"
git branch -M main

# Link to your new GitHub repository:
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## Step 3: Deploy on Vercel (Recommended: Web Dashboard)

1. Open [vercel.com/dashboard](https://vercel.com/dashboard) and click **"Add New..."** → **"Project"**.
2. Select your GitHub repository from the list and click **"Import"**.
3. In the project configuration:
   - **Framework Preset**: Leave as **Other** (our `vercel.json` automatically handles both the React frontend and serverless API).
   - **Root Directory**: `./` (default).
4. Expand the **"Environment Variables"** section and add the following keys:

| Key | Value | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://glassadmin:***@cluster0...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `glass_billing_super_secret_jwt_key_2026_xyz` | Secret key for login authentication |
| `JWT_REFRESH_SECRET` | `glass_billing_refresh_secret_key_2026_abc` | Secret key for refresh tokens |
| `NODE_ENV` | `production` | Production mode |

5. Click **"Deploy"**.
6. In about 40–60 seconds, your site will be live at `https://<your-project>.vercel.app`! 🎉

---

## Alternative: Deploy via Vercel CLI

If you prefer deploying directly from your terminal:

```bash
# 1. Log in to Vercel
npx vercel login

# 2. Link & Deploy
npx vercel

# 3. Add your production environment variables when prompted or via:
npx vercel env add MONGODB_URI production
npx vercel env add JWT_SECRET production
npx vercel env add JWT_REFRESH_SECRET production
npx vercel env add NODE_ENV production

# 4. Trigger production deployment
npx vercel --prod
```

---

## Step 4: Verify Your Deployment

Once deployed:
1. **Health Check**: Open `https://<your-project>.vercel.app/api/health` in your browser.
   - You should see: `{"success": true, "data": {"status": "ok", "database": "connected"}}`.
2. **App Dashboard**: Open `https://<your-project>.vercel.app/`
   - Sign up or log into your account.
   - Customize your Glass Plant details (Name, GSTIN, Address, Bank info).
   - Verify creating Tax Invoices, Delivery Challans, and Receipts with your business branding!
3. **Optional Seed Data**: If you want initial demo data loaded into your new cloud database, call:
   `https://<your-project>.vercel.app/api/seed` (POST) or click **"Reset Demo Data"** on the topbar.

---

## 🛠️ Architecture Overview on Vercel

```
┌─────────────────────────────────────────────────────────────┐
│                   your-app.vercel.app                       │
├──────────────────────────────┬──────────────────────────────┤
│ Frontend (React + Vite SPA)  │ Backend (Vercel Serverless)  │
│ Static build: client/dist    │ Entrypoint: /api/index.js    │
│ Handles UI, Print Modals,    │ Handles /api/invoices,       │
│ Navigation & Routing         │ /api/payments, MongoDB ops   │
└──────────────────────────────┴──────────────────────────────┘
```

- **Zero CORS issues**: Frontend and Backend run under the same origin.
- **Auto SSL**: Free automatic HTTPS certificates.
- **Serverless Scaling**: Backend spins up on demand and connects efficiently to MongoDB Atlas.
