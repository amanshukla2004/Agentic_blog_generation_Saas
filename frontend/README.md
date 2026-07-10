# ✨ Frontend Client (React & Tailwind v4)

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?logo=redux" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter" alt="React Router" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
</p>

This is the user-facing layer of the **Agentic Blogging SaaS** platform. It provides a vibrant community feed, a secure dashboard for managing blog drafts, a Tier 3 Master Admin control panel, and a complex multi-modal form for triggering AI blog generation, communicating strictly with the Spring Boot API Gateway.

---

## 🏗️ Architecture & State Flow

The frontend follows a highly modular architecture focused on performance, predictability, and beautiful UX.

### High-Level Flow

```mermaid
flowchart TD
    User([User]) --> UI[React UI Components]
    
    subgraph Frontend Client
        UI --> Router[React Router v7]
        Router -->|RBAC Validation| Views(Pages: Feed, Dashboard, Generator)
        
        Views <--> Store[Redux Store (State)]
        Views <--> RTK[RTK Query API Slices]
    end
    
    RTK -->|HTTP Requests + Auth Headers| Gateway[(Spring Boot API Gateway)]
```

### Core Technologies

- **Global State**: We leverage **Redux Toolkit** for centralized, predictable global state management.
- **Data Fetching & Caching**: **RTK Query** (`fetchBaseQuery`) handles all network requests and caching, automatically attaching JWT tokens to API calls and invalidating cache on mutations. No raw Axios calls are used.
- **Routing**: **React Router v7** handles layout nesting, lazy loading of views, and Route-Based Access Control (RBAC) to ensure users only see what they have permission for.
- **Styling**: **Tailwind CSS v4** powers the utility-first design system.
- **Animations**: **Framer Motion** delivers smooth layout transitions, micro-interactions, and complex orchestrated animations.

---

## 🎨 Design System & "Anti-Slop" Principles

We adhere to strict UI/UX guidelines to maintain a premium, tactile, and professional feel:

- **Typography**: Clean legibility using standard sans-serif system fonts (e.g., Inter or Roboto).
- **Palette**: Neutral base (Zinc) with carefully chosen accent colors. Pure black (`#000000`) is avoided in favor of softer darks (e.g., `#09090b`).
- **Hard Bans**: No em-dashes (—), no fake UIs, no decorative colored status dots, and no wrapped CTAs.
- **Motion**: Tactile feedback on buttons (e.g., `active:scale-95` via Framer Motion and Tailwind) ensures the interface feels responsive and alive without being overwhelming.

---

## 🛠️ Prerequisites & Setup

- **Node.js**: v18+
- **npm** (or yarn/pnpm)

## 🔐 Environment Variables

Create a `.env` file in the root of the `frontend` directory:

```env
# Point this to your deployed or local Gateway Service
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 🚀 Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```text
src/
├── components/   # Reusable UI elements, layout components, and complex forms
├── pages/        # Top-level route views (Home, Dashboard, Generate, Admin, Auth)
├── store/        # Redux Toolkit store configuration, state slices, and RTK Query endpoints
├── assets/       # Static assets like images and global CSS
├── hooks/        # Custom React hooks (e.g., useAuth)
└── utils/        # Helper functions, constants, and logging utilities
```
