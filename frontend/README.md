# ✨ Frontend Client (React & Tailwind v4)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?logo=redux)
![License](https://img.shields.io/badge/license-MIT-green.svg)

This is the user-facing layer of the Agentic Blogging SaaS platform. It provides a vibrant community feed, a secure dashboard for managing blog drafts, a Tier 3 Master Admin control panel, and a complex multi-modal form for triggering AI blog generation, communicating strictly with the Spring Boot API Gateway.

## 🏗️ Architecture & State Flow

The following flowchart outlines the frontend structure and data flow, accurately reflecting the codebase's use of Redux Toolkit (RTK) instead of Zustand/Axios.

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

*Note: The frontend leverages **Redux Toolkit** for global state and **RTK Query** (`fetchBaseQuery`) for network requests and caching, automatically attaching JWT tokens to API calls.*

## 🎨 Design System & "Anti-Slop" Principles

We adhere to strict UI/UX guidelines to maintain a premium, tactile, and professional feel:

- **Typography**: Clean legibility using standard sans-serif system fonts.
- **Palette**: Neutral base (Zinc) with carefully chosen accent colors. Pure black (`#000000`) is avoided in favor of softer darks.
- **Hard Bans**: No em-dashes (—), no fake UIs, no decorative colored status dots, and no wrapped CTAs.
- **Motion**: Tactile feedback on buttons (e.g., `active:scale-95` via Framer Motion and Tailwind) ensures the interface feels responsive and alive.

## 🛠️ Prerequisites & Setup

- **Node.js**: v18+
- **npm** (or yarn/pnpm)

## 🔐 Environment Variables

Create a `.env` file in the root of the `frontend` directory.

```env
# Point this to your deployed or local Gateway Service
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

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

## 📂 Project Structure

- `src/store`: Redux Toolkit store configuration, state slices (e.g., auth), and RTK Query API endpoints.
- `src/components`: Reusable UI elements, layout components, and complex forms built with Tailwind and Framer Motion.
- `src/pages`: Top-level route views (Home, Dashboard, Generate, Admin, Auth).
- `src/utils`: Helper functions, constants, and logging utilities.
