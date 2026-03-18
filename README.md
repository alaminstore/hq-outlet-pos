## HQ Outlet POS

#### Scenario

A company runs a centralized HQ system to manage multiple F&B outlets.
The HQ controls the master menu, assigns items to each outlet, and tracks overall sales performance. Each outlet handles its own sales and inventory, deducting stock as transactions happen.

###### Flow: One company → Multiple outlets → HQ assigns menu → Outlets process sales → HQ monitors reports.

### Setup Instructions

1. Requirements

- Docker + Docker Compose
- Node.js (if running without Docker)

2. Run with Docker (recommended)

- Copy environment files:
  - `cd backend && cp .env.example .env`
  - `cd ../frontend && cp .env.example .env`
- Start services:
  - `docker network create hq_outlet_net` (if the network was not already created)
  - `docker-compose up --build`
- This will start backend, frontend, and database.

3. Run without Docker (manual)

- Backend:
  - `cd backend`
  - `cp .env.example .env`
  - `npm install`
  - `npm run dev`
- Frontend:
  - `cd frontend`
  - `cp .env.example .env`
  - `npm install`
  - `npm run dev`
- Database:
  - Create a PostgreSQL database and set env vars in `backend/.env`

  #### Note: 
  ###### I intentionally did not remove the sample values from .env.example to keep setup quick and easy. In this project, those example values are not sensitive and are only provided for convenience.

## API Endpoints

Base URL: `/api`

Master Menu

- `GET /master-menu` list master menu items
- `POST /master-menu` create master menu item

Outlets

- `GET /outlets` list all outlets

Outlet Menu Configuration

- `GET /outlets/:outletId/menu-configs` get menu configs for outlet
- `POST /outlets/:outletId/menu-configs` assign item to outlet (with price and stock)
- `POST /outlets/:outletId/menu-configs/batch` batch assign items to outlet
- `PUT /outlets/:outletId/menu-configs/:configId` update menu config for outlet
- `PUT /outlets/:outletId/menu-configs` batch update menu configs for outlet

Sales

- `POST /outlets/:outletId/sales` create a sale (multi-item)

Reports

- `GET /reports/revenue-by-outlet` total revenue by outlet with pagination
- `GET /reports/top-items-by-outlet` top 5 items per outlet

## Schema Explanation

Main tables:

- `outlets` outlet list
- `master_menu` master menu items
- `outlet_menu_configs` items assigned to outlet with price override and stock level
- `sales` sale header per outlet
- `sale_items` line items for each sale

Key relationships:

- Menu items are assigned to outlets via `outlet_menu_configs`
- Stock and outlet-specific pricing is managed in `outlet_menu_configs`
- Sales belong to outlet; Sale_Items belong to sale (Just like, Order and Order_Details and Products)

Constraints:

- Unique (outlet_id, menu_item_id) for `outlet_menu_configs`
- Foreign keys to keep data consistent
- Stock cannot go negative (checked in transaction + constraints)
- Outlet price and stock level must be >= 0

## Architecture Explanation

Layered structure:

- Routes: HTTP endpoints
- Controllers: request/response handling
- Services: business logic (validation, stock deduction, receipt number)
- Repositories: database queries

Important behavior:

- Sales creation runs inside a DB transaction
- Receipt numbers are sequential per outlet
- Stock deduction is checked and enforced per outlet

## Scaling Strategy

If scaled to 10 outlets and ~100k transactions/month:

Database

- Use proper indexes on `outlet_id`, `menu_item_id`, `created_at`
- Partition sales tables by month if needed
- Read replicas for reporting queries

Reporting

- Will Implement stored procedure for regular reports.
- Pre-aggregate daily revenue per outlet
- Cache top-selling items in a summary table

Infrastructure

- Run backend with multiple instances behind a load balancer
- Use connection pooling for Postgres
- Separate reporting worker if reports become heavy

Architecture Evolution

- Split into services: Menu Service, Sales Service, Reporting Service
- Use async events for reporting updates
