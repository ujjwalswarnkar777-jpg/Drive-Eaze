# 🚗 Drive-Eaze — Self-Drive Car Rental Workspace

**Drive-Eaze** is a full-stack, responsive self-drive car rental portal tailored for modern vehicle rental platforms (engineered to Lucknow, UP settings). Built using the robust **React + TypeScript + Tailwind CSS** architecture with a real-time, hybrid **Supabase / Offline LocalStorage** database engine.

> **Tagline:** *"Drive Smart. Pay Less."*  
> **Brand Location:** Shop K 02, Kisan Bazar, Vibhuti Khand, Gomti Nagar, Lucknow, Uttar Pradesh 226010  
> **Support Line:** +91-8960695050 (WhatsApp enabled: https://wa.me/918960695050)

---

## 🛠️ Technology Stack & Architectures

1. **Frontend:** React 19 + TypeScript 5
2. **Styling:** Tailwind CSS 4 (Fluid responsive grids, high-contrast dark Bloomberg themes)
3. **Animations:** Motion (smooth staggered fade-in entrances, interactive ripple feedbacks)
4. **Icons:** Lucide React
5. **Database Engine:** Dual-Layer Client Engine (Auto-connects to live Supabase Postgres when keys exist; falls back gracefully to a fully reactive Offline LocalStorage with zero-setup seed data)
6. **Real-time Synchronization:** Built-in automatic pub/sub event listeners mirroring Supabase Realtime subscriptions within 2 seconds.

---

## ⚙️ Quick Installation & Setup

### 1. Offline Mode (Zero Setup)
By default, the application runs in a fully functional **Offline Demo Mode**. No database setup is required.
- Infinite bookings can be submitted.
- Full Admin Dashboards, statistics, and tables will render mock metrics.
- Submitting reviews, creating cars, toggling availability, and adding coupon codes takes effect instantly inside your browser session and persists across page reloads.

### 2. Connect to Live Supabase Postgres
To transition to live database storage:
1. Register/Login to [Supabase](https://supabase.com).
2. Create a new PostgreSQL Project.
3. Open the **SQL Editor**, paste the SQL Schema (obtained by clicking the orange "🔌 Connection instructions" alert inside the Navbar header), and execute.
4. Populate your Workspace Secrets with these environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. Reload the application preview. The system will auto-detect the parameters and start storing production rentals directly!

---

## 🔐 Administrator login credentials

You can access the Staff terminal by entering `/admin` in the browser path, or navigation shortcuts. Use these preconfigured credentials for testing:

* **Staff Email:** `admin@driveeaze.in`
* **Secure Pin:** `admin123`

---

## 💼 Workspace Features

- **Dynamic Homepage:** 13 visual sections framing active fleets, Lucknow customer reviews, pricing grids, and active count summaries.
- **Filtering System:** Responsive query nodes to filter by Category (SUV, Sedan, Hatchback, MUV), Transmission (Manual, Automatic), Fuel Type, or search directly.
- **Detailed Car Spec Sheets:** Rich visual tabs for Specs, features list, terms, and stickied calculators.
- **Flexible Pricing Calculator:** Computes and previews exact tariffs live based on selection of Hourly vs. Daily vs. Weekly vs. Monthly rent tiers.
- **Complete Booking Workflow:** Gathers driver license, email, name, location, calculates net pricing, writes inquiry to database, and structures an automatic pre-filled WhatsApp dispatch text to Lucknow customer support!
- **Staff Control panels:**
  - **Overview Metrics:** Staggers total fleet load stats, income cards, and recent booking logs.
  - **Cars Coordinator:** Full CRUD form overlays to insert vehicles, tags, features, and flag vehicles for maintenance or active showcase.
  - **Bookings Desk:** Filters all submitted bookings, updates statuses (Upcoming, Active, Completed, Cancelled), matches payments, and links to cars.
  - **Reviews Moderator:** Real-time approvals, rating recalculators, and deletion controllers.
  - **Promotional Coupons Engine:** Create, edit, and toggle active states of user coupon codes.
  - **Global Specs Control:** Refreshes brand taglines, support emails, location coordinates, and policy notices instantly across navigation nodes.
