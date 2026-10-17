# 🚘 Ecommerce Car Detailing (GoodShop Premium)

## 📖 Descripción del Proyecto
Plataforma completa de comercio electrónico y sistema de gestión (CRM/Admin) para productos y servicios de Car Detailing. El proyecto está dividido en dos aplicaciones principales: un **Frontend** (Tienda y Panel de Administración) y un **Backend** (API RESTFUL y base de datos).

## 🚀 Tecnologías Principales

### 💻 Frontend (Tienda & Panel Admin)
- **Framework**: React 19 + Vite
- **Estilos**: Tailwind CSS + PostCSS + Autoprefixer
- **Estado Global**: Zustand
- **Fetching de Datos**: @tanstack/react-query + Axios
- **Formularios & Validación**: React Hook Form + Zod
- **Enrutamiento**: React Router DOM (v7)
- **Otras herramientas**: Recharts (para gráficos), html2pdf.js, lucide-react

### ⚙️ Backend (API RESTful)
- **Entorno**: Node.js + Express
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: JWT + Passport (Google OAuth 2.0)
- **Almacenamiento de Archivos**: Cloudinary (con Multer)
- **Seguridad**: Helmet, CORS, bcrypt
- **Tareas Programadas (Cron Jobs)**: Alertas de stock y vencimiento de lotes (node-cron)
- **Integraciones IA**: @google/generative-ai (Gemini) - *Configurado en dependencias*
- **Otras herramientas**: @imgly/background-removal-node (deshabilitado temporalmente en este entorno)

## 📁 Arquitectura del Proyecto

El proyecto sigue una estructura monorepo (carpetas separadas para backend y frontend):

```text
ecommerce-car-detailing/
├── backend/                # API Node.js/Express
│   ├── prisma/             # Esquema de DB y migraciones (schema.prisma)
│   ├── src/
│   │   ├── config/         # Configuración (Passport, etc)
│   │   ├── controllers/    # Lógica de negocio de la API
│   │   ├── jobs/           # Tareas programadas (Alertas de stock/lotes)
│   │   ├── middlewares/    # Manejo de errores, Auth, etc
│   │   ├── routes/         # Definición de endpoints (auth, products, orders, etc)
│   │   └── utils/          # Funciones utilitarias
│   └── package.json
│
└── frontend/               # SPA React
    ├── public/
    ├── src/
    │   ├── assets/         # Imágenes y recursos estáticos
    │   ├── components/     # Componentes reutilizables de UI
    │   ├── hooks/          # Custom hooks
    │   ├── lib/            # Configuraciones (ej. instancia de Axios)
    │   ├── pages/          # Vistas
    │   │   ├── admin/      # Panel de administración (CRM, Gestión de inventario)
    │   │   ├── shop/       # Vistas de la tienda para el cliente
    │   │   └── home/       # Landing pages
    │   ├── store/          # Zustand stores
    │   └── utils/          # Utilidades
    └── package.json
```

## ✨ Funcionalidades Destacadas

1. **Gestión de Inventario Avanzada**:
   - Trazabilidad por **Lotes** y **Alertas de Vencimiento**.
   - Control de Stock en tiempo real y **Kits/Combos** de productos.
   - Categorías y Marcas.

2. **Panel de Administración Completo**:
   - Dashboard con gráficos e informes de ventas (Recharts).
   - Gestión de Gastos y reportes financieros.
   - Configuración de alertas automáticas.

3. **Autenticación y Seguridad**:
   - Login tradicional y Google OAuth.
   - Sistema de roles.
   - Middleware de seguridad con Helmet.

4. **Integración en la Nube y Optimizaciones**:
   - Subida y optimización de imágenes delegada a **Cloudinary**.
   - Conexión optimizada (keep-alive) con **Neon Database**.

## 🛠️ Instalación y Uso Local

### Requisitos Previos
- Node.js (v18+)
- PostgreSQL (Base de datos local o en la nube como Neon/Supabase)
- Cuenta en Cloudinary y Google Cloud Console (OAuth)


*Desarrollado para GoodShop Premium.*
