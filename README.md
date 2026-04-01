# 🏥 Healthcare Appointment Management System

Welcome to the **Healthcare Appointment Management System** (Healthbook). This is a comprehensive, modern, and highly responsive web application built to streamline the scheduling and management of medical appointments. It bridges the gap between patients, healthcare professionals, and hospital administrators through three specialized portals.

## 🚀 Features

### 🧑‍⚕️ For Patients (Patient Portal)
- **Intuitive Booking Wizard:** A step-by-step interactive wizard to select departments, doctors, dates, and times for new appointments.
- **Appointment Dashboard:** A clear overview of upcoming, completed, and cancelled appointments with status tracking.
- **Department Browsing:** Explore hospital departments with beautiful icon-driven UI and learn about available specialties.
- **Doctor Directory:** View doctor profiles, specialties, and their availability.
- **AI Chatbot Assistant:** Integrated intelligent chatbot support to help answer general medical or platform-related queries.
- **Notifications:** Receive instant email confirmations and updates regarding appointment statuses.

### ⚕️ For Doctors (Doctor Portal)
- **Doctor Dashboard:** Real-time analytics and statistics on today's patients, pending requests, and upcoming appointments.
- **Schedule Management:** A comprehensive weekly calendar view to effortlessly manage availability and review daily schedules.
- **Appointment Processing:** Quick actions to accept, reject, or mark appointments as complete directly from the dashboard.
- **Patient History:** Access to patient details and reasons for visits to better prepare for consultations.

### 🛡️ For Administrators (Admin Portal)
- **Master Control Dashboard:** High-level metrics showing total patients, doctors, and appointment trends.
- **Department Management:** Add, edit, or remove medical departments globally.
- **Staff & Patient Management:** View all registered patients and doctors, manage their statuses, and track system usage.
- **Global Appointment Tracking:** Monitor and moderate all appointments across the system with advanced filtering and mobile-friendly accordion views.

### 💻 Technical & UI/UX Features
- **Role-Based Access Control (RBAC):** Secure authentication and automatic routing ensuring users only access their designated portals via Supabase Auth.
- **Responsive & Mobile-First Design:** Fully optimized for mobile, tablet, and desktop viewing. Features mobile slide-out navigation with glassmorphism effects, horizontal scrolling tables, and tap-friendly expandable cards.
- **Modern Aesthetics:** Tailored UI with smooth micro-interactions, `framer-motion` animations, and a polished, accessible component system built with Tailwind CSS & Radix UI.
- **Automated Email Workflows:** Trigger-based email notifications powered by Supabase Edge Functions, `pg_net`, and Resend to keep users informed at every step.
- **Robust Security:** Row Level Security (RLS) policies implemented at the database tier ensuring data privacy and integrity.

## 🛠️ Technology Stack
- **Frontend:** React (v18), Vite, Tailwind CSS, Framer Motion, Radix UI Primitives, React Router, Lucide React (Icons).
- **Backend & Database:** Supabase (PostgreSQL, Auth, Edge Functions, pg_cron, pg_net).
- **Testing:** Vitest, React Testing Library.

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Supabase Project & CLI (for local backend development)

### Installation
1. Clone the repository and navigate into the project directory.
2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```
3. Copy the environment variables template and configure your local settings:
   ```bash
   cp .env.example .env.local
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Backend Setup (Supabase)
To set up the Supabase local environment:
1. Initialize and start the Supabase local stack:
   ```bash
   npx supabase init
   npx supabase start
   ```
2. Apply database migrations to seed tables and Row Level Security (RLS) policies:
   ```bash
   npx supabase db push
   ```
3. Deploy the Edge Functions for email notifications:
   ```bash
   npx supabase functions deploy send-email
   ```

## 🧪 Testing
The frontend includes a suite of unit and component tests. To run them:
```bash
cd client
npm run test
```
To run tests with a coverage report:
```bash
npm run test:coverage
```

---
*Built to make healthcare scheduling effortless, reliable, and accessible for everyone.*
