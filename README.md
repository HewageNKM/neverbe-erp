# NEVERBE ERP System

A comprehensive Enterprise Resource Planning (ERP) application built with React, TypeScript, and Vite, designed to streamline business operations including product inventory, order processing, purchase orders, sales orders, and more. 

The system leverages Firebase for robust backend operations and offers a modern, responsive UI experience powered by Tailwind CSS and Ant Design.

## 🌟 Key Features

- **Product & Inventory Management:** Complete product lifecycle management with advanced filtering capabilities (category, brand, size, in-stock status, gender), and seamless stock monitoring.
- **AI-Powered Product Descriptions:** Integrated AI chat interface to assist administrators with store management and generating rich text, optimized product narratives with markdown support.
- **Order Processing System:** End-to-end order management including order tracking viewing, inventory restocking, and automated cleanup of failed orders (older than 45 minutes with logging).
- **Document Generation:** Automated, tailored PDF generation for Sales Orders and Purchase Orders using `@react-pdf/renderer`.
- **Dashboard & Analytics:** Detailed visual insights, reporting, and interactive charts using Recharts and ApexCharts.
- **Data Export & Processing:** Support for exporting tabular data to Excel (`xlsx`), plus integrated barcode and QR code generation (`bwip-js`).
- **High-Performance Search:** High-speed, relevant lookups utilizing Algolia Search indexing.

## 🛠 Tech Stack

- **Frontend Framework:** React 19, Vite
- **Language:** TypeScript
- **State Management:** Redux Toolkit (`react-redux`)
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4, Ant Design
- **Icons:** Tabler Icons, React Icons, Ant Design Icons
- **Backend & Auth:** Firebase Platform (Firestore, Auth, Functions)
- **Data Visualization:** Recharts, ApexCharts
- **Date Utilities:** Day.js, date-fns

## 📁 Project Structure

```
src/
├── actions/      # Redux async actions and external API integrations
├── assets/       # Static static assets (images, logos, fonts)
├── components/   # Reusable UI components (Layout, Spinners, Modals, etc.)
├── constant/     # System-wide constants, enumerations, and configurations
├── contexts/     # React Context providers for localized UI global state
├── firebase/     # Firebase configuration, initialization, and core utilities
├── hooks/        # Custom reusable React hooks
├── lib/          # Third-party library integrations and client wrappers
├── model/        # TypeScript interfaces, schemas, and type definitions
├── pages/        # Route-level components (Orders, Products, Dashboard, etc.)
└── utils/        # Generic utility functions, formatters, and helpers
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn or pnpm
- Valid Firebase Project setup

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd neverbe-erp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the project directory root and add your environment-specific configurations (such as Firebase connection keys):
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   # Add other required environment variables matching your setup
   ```

### Running the Application Locally

Start the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will typically be accessible at `http://localhost:5173`.

## 📜 Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Type-checks the TypeScript code and bundles the application for production deployment.
- `npm run lint` - Lints the existing codebase using ESLint to ensure code quality.
- `npm run preview` - Spins up a local web server to preview the production build.

## 📦 Deployment

This project is configured for deployment on **Firebase Hosting**. 
Before deploying, verify that your local build successfully compiles without type errors:

```bash
# 1. Build the production application
npm run build

# 2. Deploy to Firebase
firebase deploy
```

## 🤝 Code Quality & Maintenance

- **Type Safety & Linting:** Please ensure `npm run build` and `npm run lint` pass smoothly before committing or opening any Pull Requests.
- **Automated Tasks:** Several scheduled cleanup processes operate in the background (e.g., removing unfulfilled or failed orders, continuous logging to `cleanup_logs` collections, executing twice daily). Make sure to align updates logically if you modify related collections.
