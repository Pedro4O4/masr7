# 🎟️ Event Tickets - Online Event Ticketing System

A full-stack event ticketing platform built with **Next.js** (frontend) and **NestJS** (backend), featuring interactive theater seat selection, real-time booking, and comprehensive event management.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Framer Motion** - Smooth animations
- **React Icons** - Icon library

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type-safe development
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Nodemailer** - Email notifications

## 👥 User Roles

| Role | Capabilities |
|------|--------------|
| **Standard User** | Browse events, book tickets, view booking history |
| **Organizer** | Create/update/delete events, manage seat pricing, view analytics |
| **Admin** | Full platform control, manage users, theaters, and all events |

## ✨ Features

### 🎭 Theater Designer
- Interactive seat layout builder
- **Section Switcher** - Toggle between Main Floor and Balcony views
- Drag-and-drop label placement (ENTRY, EXIT, SOUND, etc.)
- Vertical and horizontal corridor support
- Seat categories (Standard, VIP, Premium, Wheelchair)
- Undo/Redo functionality
- Zoom controls

### 🎫 Seat Selection
- Real-time seat availability
- Visual seat map matching theater layout
- Section-specific labels
- Price display per seat type
- Multi-seat selection with summary

### 📅 Event Management
- Event creation with image upload
- Flexible seat pricing configuration
- Category assignment per seat/row
- Event analytics dashboard

### 🔐 Authentication
- JWT-based authentication
- Role-based access control
- Secure password handling

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pedro4O4/masr7.git
   cd masr7
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend-nest
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend-next
   npm install
   ```

4. **Configure Environment Variables**
   
   Create `.env` in `backend-nest/`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/event-tickets
   JWT_SECRET=your-secret-key
   MAIL_HOST=smtp.example.com
   MAIL_USER=your-email
   MAIL_PASS=your-password
   ```

5. **Run the Application**
   
   Backend:
   ```bash
   cd backend-nest
   npm run start:dev
   ```
   
   Frontend:
   ```bash
   cd frontend-next
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
├── backend-nest/          # NestJS backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── bookings/      # Booking management
│   │   ├── events/        # Event management
│   │   ├── theaters/      # Theater management
│   │   ├── users/         # User management
│   │   └── mail/          # Email service
│   └── uploads/           # Uploaded files
│
├── frontend-next/         # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   │   ├── AdminComponent/
│   │   │   ├── Booking component/
│   │   │   ├── Event Components/
│   │   │   ├── Theater/
│   │   │   └── UserComponent/
│   │   ├── auth/          # Auth context
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
```

## 🎨 UI Features

- **Dark Theme** - Modern, eye-relaxing purple/blue palette
- **Glassmorphism** - Beautiful frosted glass effects
- **Animations** - Smooth transitions with Framer Motion
- **Responsive Design** - Works on all screen sizes

## 📝 License

This project is for educational purposes.

---

Built with ❤️ using Next.js and NestJS
