# MEDCARE Backend

A comprehensive backend system for the MEDCARE healthcare platform, built with TypeScript and modern web technologies. This monorepo contains multiple services managing admin operations, pharmacy management, and user/pharmacy interactions.

## 📋 Overview

MEDCARE is a healthcare management system tailored for Ethiopia, providing integrated solutions for:
- **Admin Management**: Centralized administrative backend with role-based access control
- **Pharmacy Operations**: Complete pharmacy management system with inventory, orders, and delivery tracking
- **User & Pharmacy Frontend**: Next.js-based interface for users and pharmacy interactions

## 🏗️ Project Structure

This monorepo contains three main modules:

### 1. **Admin-Backend** (`/Admin-Backend`)
Administrative backend service handling core business logic and user management.

**Tech Stack:**
- Node.js with Express.js
- TypeScript
- MongoDB (Mongoose ORM)
- JWT for authentication
- Bcrypt for password hashing

**Key Features:**
- User authentication and management
- Role-based access control
- Rate limiting and security headers (Helmet)
- Email notifications (Nodemailer)
- Two-factor authentication (OTP)
- CSV export functionality
- Scheduled tasks (node-cron)

### 2. **Pharmacy Backend** (`/pharmacy-delivery-payment`)
Specialized backend for pharmacy management and order processing.

**Tech Stack:**
- Express.js with TypeScript
- MongoDB (Mongoose)
- Socket.io for real-time updates
- Cloudinary for file management
- JWT authentication

**Key Features:**
- Pharmacy inventory management
- Order processing and tracking
- PDF generation for receipts
- Real-time order notifications via WebSockets
- CSV import/export for data management
- Payment processing integration
- Cloudinary integration for image storage

### 3. **User/Pharmacy Frontend** (`/User-Pharmacy-Front`)
Modern Next.js frontend application for user and pharmacy interactions.

**Tech Stack:**
- Next.js (v15.4.9)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI components
- Google Maps integration
- Recharts for data visualization

**Key Features:**
- Responsive user interface
- Map-based pharmacy location services
- Real-time data visualization
- File upload with dropzone
- Accessible UI components

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (TypeScript development)
- npm or pnpm package manager
- MongoDB instance
- Environment variables configured

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/teklumt/MEDCARE-backend.git
cd MEDCARE-backend
