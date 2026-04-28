# Mini Class Scheduler - Frontend

A modern React application for managing class scheduling with role-based access for teachers and students. Built with Vite, React Router, Tailwind CSS, and daisyUI.

## 🎯 Features Implemented

### Authentication
- ✅ User registration with name, email, password, and role selection
- ✅ User login with email and password
- ✅ Role-based access control (Teacher/Student)
- ✅ Logout functionality

### Teacher Features
- ✅ Create 15-minute classroom time slots with date and time selection
- ✅ Automatic overlap prevention (cannot create overlapping slots)
- ✅ View all created slots in an organized list
- ✅ See booking status for each slot (Available/Booked)
- ✅ View student email who booked each slot
- ✅ Dashboard with two-column layout (form on left, slots list on right)

### Student Features
- ✅ Browse all available slots from all teachers
- ✅ See teacher names for each available slot
- ✅ Book available 15-minute slots with one click
- ✅ View all personal booked slots in a dedicated column
- ✅ See date, time, and teacher info for booked slots
- ✅ Dashboard with two-column layout (available on left, booked on right)

### User Interface
- ✅ Responsive two-column card layout (teachers & students)
- ✅ Professional styling with Tailwind CSS and daisyUI
- ✅ Real-time success/error notifications
- ✅ Formatted date/time display (e.g., "Tue, Jan 28, 2:30 PM")
- ✅ Form validation with helpful error messages
- ✅ Mobile-responsive design

### Data Management
- ✅ Email normalization (lowercase, trimmed)
- ✅ Real-time slot availability updates
- ✅ Automatic data refresh after operations
- ✅ Safe API communication with proper error handling

---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js** v14 or higher
- **npm** (comes with Node.js)
- **Backend Server** running on `http://localhost:3000`

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The app will be available at: **http://localhost:5173**

3. **Build for Production**
   ```bash
   npm run build
   ```
   
   Output goes to: `dist/` folder

---

## 🧪 Test Credentials

### Teacher Account
```
Email:    teacher@example.com
Password: password123
Role:     Teacher
```

### Student Account
```
Email:    student@example.com
Password: password123
Role:     Student
```

### How to Test
1. Start both backend and frontend servers
2. Open **http://localhost:5173** in your browser
3. Click "Login" on the landing page
4. Use one of the test credentials above
5. Create an account if these don't exist yet by using "Register"
6. Test the features:
   - **As Teacher**: Create slots, view created slots
   - **As Student**: Browse available slots, book slots, view booked slots

---

## 📁 Project Structure

```
mini-class-scheduler/
├── src/
│   ├── App.jsx                    Main dashboard component (role-based)
│   ├── Landing.jsx                Landing/home page with navigation
│   ├── main.jsx                   React Router configuration
│   ├── index.css                  Global styling (Tailwind + daisyUI)
│   ├── componenet/                (Note: folder name has typo, kept for compatibility)
│   │   ├── Login.jsx              Login form component
│   │   └── Register.jsx           Registration form component
│   └── lib/
│       └── appState.js            Auth utilities and constants
├── public/                        Static assets
├── dist/                          Production build (generated)
├── index.html                     Main HTML entry point
├── vite.config.js                 Vite configuration
├── eslint.config.js               ESLint rules
└── package.json                   Dependencies and scripts
```

---

## 📝 Available Scripts

### Development
```bash
npm run dev
```
Starts development server with hot module replacement (HMR).

### Production Build
```bash
npm run build
```
Creates optimized production build in `dist/` folder.

### Preview Build
```bash
npm run preview
```
Preview the production build locally.

### Lint Check
```bash
npm run lint
```
Check code for linting errors.

---

## 🔌 API Configuration

The frontend communicates with the backend API at:
```
http://localhost:3000
```

This can be configured in `vite.config.js` via the `VITE_API_BASE_URL` environment variable.

### API Endpoints Used
- `POST /api/register` - Create new user account
- `POST /api/login` - Authenticate user
- `GET /slots` - Get all available slots
- `GET /slots/booked?email=...` - Get student's booked slots
- `GET /slots/created?email=...` - Get teacher's created slots
- `POST /slots` - Create new slot (teacher only)
- `PUT /slots/:id/book` - Book a slot (student only)

---

## 🎨 Technology Stack

- **React 18+** - UI framework
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **daisyUI** - Tailwind-based component library
- **ES6 Modules** - Modern JavaScript

---

## 🔒 Security Features

- ✅ Secure password handling (passwords hashed on backend)
- ✅ Email validation
- ✅ Role-based access control
- ✅ CORS enabled for API communication
- ✅ XSS protection via React's built-in escaping

---

## 📊 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🐛 Troubleshooting

### Port 5173 Already in Use
```bash
# Change port in vite.config.js or use:
npm run dev -- --port 3001
```

### Backend Connection Error
- Verify backend is running on `http://localhost:3000`
- Check VITE_API_BASE_URL in environment
- Look for CORS errors in browser console

### Slots Not Loading
- Check browser console for API errors
- Verify backend server is running
- Try logging out and back in

### Form Validation Errors
- Ensure date/time are in the future (for slot creation)
- Check for overlapping 15-minute slots
- Verify email format is valid
- Password should be at least 6 characters

---

## 📱 Features by Role

### 👨‍🏫 Teacher Dashboard
```
┌─────────────────────────────────────┐
│  Welcome, Teacher! | [Logout]       │
├──────────────────┬──────────────────┤
│  Slot Creation   │  All Created     │
│  ─────────────   │  Slots           │
│  Date: [___]     │  ─────────────   │
│  Time: [___]     │  • Slot 1 (Avail)│
│  [Add Slot]      │  • Slot 2 (Book) │
│                  │  • Slot 3 (Avail)│
│                  │                  │
│                  │  Total: 3 slots  │
└──────────────────┴──────────────────┘
```

### 👨‍🎓 Student Dashboard
```
┌─────────────────────────────────────┐
│  Welcome, Student! | [Logout]       │
├──────────────────┬──────────────────┤
│  Available Slots │  My Booked Slots │
│  ─────────────   │  ─────────────   │
│  • Slot 1 (Ms H) │  • Slot 2 (Ms H) │
│    [Book]        │    Date: ...     │
│  • Slot 3 (Mr J) │                  │
│    [Book]        │  Total: 1 booked │
│                  │                  │
│  Total: 5 avail  │                  │
└──────────────────┴──────────────────┘
```

---

## 🚀 Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel
```

### Deploy to GitHub Pages
```bash
npm run build
# Configure your repository for GitHub Pages
# Push dist/ folder to gh-pages branch
```

### Deploy to Traditional Web Server
```bash
npm run build
# Upload contents of dist/ folder to your web server
```

---

## 📖 Additional Documentation

For more detailed information, see:
- Backend README: `../mini-class-scheduler-server/README.md`
- API Documentation: `../mini-class-scheduler-server/API_DOCUMENTATION.md`
- Database Schema: `../mini-class-scheduler-server/DATABASE_SCHEMA.md`
- Testing Guide: `../mini-class-scheduler-server/TESTING_GUIDE.md`
- Deployment Guide: `../mini-class-scheduler-server/DEPLOYMENT_GUIDE.md`

---

## 📝 Notes

- Slot duration is fixed at **15 minutes**
- All timestamps use **ISO 8601 format**
- Emails are **normalized to lowercase**
- Users cannot book the same slot twice
- Teachers can create multiple slots but cannot book them

---

## ✅ Tested & Validated

- ✅ Development mode (npm run dev) working
- ✅ Production build (npm run build) successful
- ✅ All API endpoints functional
- ✅ Authentication flow complete
- ✅ Role-based routing working
- ✅ Responsive design tested
- ✅ Error handling verified

---

## 💡 Tips

1. **Quick Test**: Register two accounts (one teacher, one student) and test the complete flow
2. **Check Console**: Browser DevTools console shows helpful debug messages
3. **Check Network**: DevTools Network tab shows all API requests
4. **Database**: Use MongoDB Compass to view database contents while testing

---

## 📞 Support

For issues or questions:
1. Check the Testing Guide for troubleshooting steps
2. Review browser console for error messages
3. Verify backend server is running
4. Check that all dependencies are installed (`npm install`)
5. Clear browser cache if experiencing issues
