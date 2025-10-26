# E-commerce Dashboard

A comprehensive SvelteKit dashboard application for managing an online shop, built with Svelte 5 and TypeScript.

## Features

### Authentication
- Simple login system with email/password authentication
- Session management with localStorage
- Protected routes and admin access control

### User Management
- View all users with filtering by name, email, or role
- Create new users with role assignment (admin, employee, customer)
- Edit existing user information
- Delete users with confirmation
- Role-based access control

### Product Management
- Complete product catalog management
- Add products with name, description, price, category, stock, and image
- Edit product information
- Delete products
- Stock level indicators (In Stock, Low Stock, Out of Stock)
- Search and filter products

### Order Management
- View all orders with customer information
- Edit order status (pending, processing, shipped, delivered, cancelled)
- Delete orders
- Search orders by customer name, email, order ID, or status
- Order details with product information and shipping address

### Dashboard Overview
- Statistics overview showing total users, products, orders, and revenue
- Quick navigation to different management sections
- Responsive design for mobile and desktop

## Technical Specifications

- **Framework**: SvelteKit 2.0 with Svelte 5
- **Language**: JavaScript (TypeScript support available)
- **Styling**: Plain CSS with custom design system
- **Data Storage**: localStorage for persistent client-side storage
- **Authentication**: Simple email/password with session management

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Credentials

Use these credentials to log in:
- **Email**: admin@shop.com
- **Password**: password123

## Project Structure

```
src/
├── app.html              # Main HTML template
├── app.css               # Global styles and design system
├── lib/
│   ├── auth.ts           # Authentication service
│   └── data.ts           # Data store and types
└── routes/
    ├── +page.svelte      # Root redirect
    ├── login/
    │   └── +page.svelte  # Login page
    ├── dashboard/
    │   └── +page.svelte  # Dashboard overview
    ├── users/
    │   └── +page.svelte  # User management
    ├── products/
    │   └── +page.svelte  # Product management
    └── orders/
        └── +page.svelte  # Order management
```

## Features Implemented

### ✅ Authentication System
- Login form with validation
- Session persistence
- Protected routes
- Logout functionality

### ✅ User Management (CRUD)
- Create new users
- Read/View user list with filtering
- Update user information
- Delete users
- Role-based access

### ✅ Product Management (CRUD)
- Create new products
- Read/View product catalog with filtering
- Update product information
- Delete products
- Stock management

### ✅ Order Management (CRUD)
- Create new orders (simplified)
- Read/View order list with filtering
- Update order status
- Delete orders
- Order details

### ✅ UI/UX Features
- Responsive design
- Modal dialogs for forms
- Search and filtering
- Status badges and indicators
- Error handling and user feedback
- Loading states

### ✅ Technical Requirements
- SvelteKit framework
- Svelte 5 with new runes syntax
- TypeScript for type safety
- Plain CSS styling (no frameworks)
- Proper HTML structure
- Form handling and validation

## Development Notes

- The application uses Svelte 5 with SvelteKit 2.0
- Data is stored in localStorage and persists across sessions
- Authentication is simplified for demo purposes
- All styling is plain CSS following modern design principles
- The application is fully responsive and accessible

## Future Enhancements

- Database integration (PostgreSQL, MongoDB)
- Real authentication with JWT tokens
- File upload for product images
- Advanced order creation with product selection
- Email notifications
- Analytics and reporting
- API endpoints for external integrations
