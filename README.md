# 🚘 GoodShop Premium — Automotive Detailing E-Commerce & CRM Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://goodshop-premium.vercel.app/)
[![React 19](https://img.shields.io/badge/Frontend-React_19_%7C_Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_%7C_Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_%7C_Neon-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)

An end-to-end, full-stack digital commerce and administrative management suite (CRM/ERP) designed specifically for premium automotive detailing businesses. 

The platform bridges customer-facing digital sales with real-world shop operations: featuring dynamic product catalogs, bundle builders, automated invoice/delivery note (*Remito*) generation, batch expiration control, financial reporting, and Google OAuth 2.0 security.

---

## 🌟 Live Demo

- **Storefront URL**: [https://goodshop-premium.vercel.app/](https://goodshop-premium.vercel.app/)
- **Catalog**: [https://goodshop-premium.vercel.app/catalog](https://goodshop-premium.vercel.app/catalog)
- **Admin Portal**: Accessible via `/admin` with Google OAuth 2.0 whitelist protection.

---

## ⚡ Key Highlights & Features

### 🛒 Client-Facing Storefront
- **Modern Dark-Mode Aesthetics**: Sleek automotive-themed UI built with Tailwind CSS, custom animations, and responsive layouts for mobile and desktop.
- **Dynamic Catalog & Filtering**: Instant faceted search by category, brand, surface compatibility, and application method.
- **Product Bundles & Combos**: Interactive showcase of multi-item detailing kits with automatic savings calculations.
- **Shopping Cart & Checkout Flow**: Persistent client-side cart powered by Zustand, order summary, and one-click WhatsApp order dispatch.

### 🛡️ Administrative CRM & Back-Office
- **Executive Dashboard**: Real-time KPI cards and visual trend charts (sales, revenue, inventory alerts) built with **Recharts**.
- **Batch & Expiry Traceability (*Lotes*)**: Tracking of sensitive detailing chemicals (sealants, coatings, compounds) with automated background cron jobs detecting upcoming or expired batches.
- **Automated Delivery Note (*Remito*) & Quote Engine**: Client-side PDF generator using `html2pdf.js` that outputs professional printable delivery notes with QR verification and WhatsApp dispatch.
- **Visual Combo Banner Studio**: Integrated HTML5 Canvas studio allowing admins to compose and export branded combo promo banners directly to Cloudinary.
- **Expense & Margin Tracking**: Operating expenses ledger categorized by type, computing net profit against product sales.
- **Security & Authorization**: JWT token lifecycle with Google OAuth 2.0, protected administrative routes, and helmet-enforced Content Security Policy (CSP).

---

## 🏗️ Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  React 19 SPA (Vite) + Tailwind CSS + Zustand + React Query │
└──────────────┬──────────────────────────────┬───────────────┘
               │ HTTPS (REST API)             │ CDN Assets
               ▼                              ▼
┌───────────────────────────────┐     ┌───────────────────────┐
│         Backend API           │     │     Cloudinary CDN    │
│ Node.js + Express REST API    │     │ Optimized images,     │
│ Helmet CSP, CORS, JWT Auth    │     │ promotional banners   │
└──────────────┬────────────────┘     └───────────────────────┘
               │ Prisma ORM
               ▼
┌───────────────────────────────┐
│     Neon Serverless DB        │
│ PostgreSQL database instance  │
│ Connection pooling & jobs     │
└───────────────────────────────┘
```

---

## 📁 Repository Structure

```text
ecommerce-car-detailing/
├── backend/                        # RESTful API Backend
│   ├── prisma/                     # Database schema & migrations
│   │   ├── schema.prisma           # Prisma data models
│   │   └── seed.js                 # Initial database seeding script
│   ├── src/
│   │   ├── config/                 # Passport & OAuth strategies
│   │   ├── controllers/            # Business logic handlers
│   │   ├── jobs/                   # Automated cron jobs (stock & expiry)
│   │   ├── middlewares/            # Auth verification, error handler, multer
│   │   ├── routes/                 # Express API endpoints
│   │   ├── utils/                  # Cloudinary, JWT & helper utilities
│   │   └── server.js               # Application entry point
│   ├── .env.example                # Backend environment template
│   └── package.json
│
├── frontend/                       # Client SPA Application
│   ├── public/                     # Static assets, sitemap & icons
│   ├── src/
│   │   ├── assets/                 # Brand logos, SVGs & vectors
│   │   ├── components/             # Reusable UI & layout components
│   │   │   ├── admin/              # Admin sidebar, shell & panels
│   │   │   ├── shop/               # Storefront navigation, cart, footer
│   │   │   └── ui/                 # Modals, skeletons, buttons
│   │   ├── hooks/                  # Custom React hooks (canvas, cutouts)
│   │   ├── lib/                    # Axios instance & React Query client
│   │   ├── pages/
│   │   │   ├── admin/              # CRM & Management views (12 modules)
│   │   │   └── home/ & shop/       # Customer-facing shopping views
│   │   ├── store/                  # Zustand stores (cart, auth, alerts)
│   │   └── utils/                  # Formatters, canvas & PDF helpers
│   ├── .env.example                # Frontend environment template
│   └── package.json
│
├── .gitignore                      # Monorepo root ignore rules
└── README.md                       # Project documentation
```

---

## 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Zustand, @tanstack/react-query, React Router v7, React Hook Form, Zod, Lucide React, Recharts, html2pdf.js |
| **Backend** | Node.js, Express, Prisma ORM, JSON Web Tokens (JWT), Passport.js (Google OAuth 2.0), node-cron, Multer, Helmet, CORS |
| **Database** | PostgreSQL (hosted on Neon Serverless) |
| **Media & Storage** | Cloudinary CDN (Direct uploads, transformations & asset hosting) |
| **Deployment** | Vercel (Frontend SPA), Cloud-ready Node.js container/service |

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **PostgreSQL**: Local instance or free serverless instance at [Neon.tech](https://neon.tech/)
- **Cloudinary Account**: For image management
- **Google Cloud Console**: Credentials for Google OAuth 2.0

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your PostgreSQL URL, JWT secret, and Google OAuth credentials in `backend/.env`.

3. Synchronize database schema and generate Prisma client:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. *(Optional)* Seed initial data:
   ```bash
   npm run seed
   ```

5. Launch the backend API:
   ```bash
   npm run dev
   ```
   Server will start on `http://localhost:5000`.

---

### 2. Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Verify `VITE_API_URL` points to `http://localhost:5000/api`.

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 👨‍💻 Author

**Pablo Ezequiel Harrod**  
Full-Stack Developer

- **GitHub**: [@HarrodPablo](https://github.com/HarrodPablo)
- **LinkedIn**: [linkedin.com/in/pablo-ezequiel-harrod-b172423ab](https://www.linkedin.com/in/pablo-ezequiel-harrod-b172423ab/)
