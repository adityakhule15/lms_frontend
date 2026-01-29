# 🎓 E-Learning Platform – React Frontend

A **React-based frontend** for a Learning Management System (LMS) supporting **Students** and **Instructors**, integrated with a **Django REST API backend**. This project focuses on clean architecture, scalability, and role-based access.

---

## 🚀 Features

### 👨‍🎓 Student Features

* User registration and authentication
* Browse and enroll in courses
* View lessons and learning content
* Track course-wise learning progress
* Attempt quizzes
* Earn and view certificates
* Personal dashboard with progress statistics

### 👨‍🏫 Instructor Features

* Create and manage courses
* Add lessons and quizzes
* Monitor enrolled students
* Track student progress
* View analytics dashboards
* Manage certificates

---

## 🔗 API Integration

This frontend consumes a **Django REST Framework backend** secured using **JWT authentication**.

### API Categories

* Authentication APIs
* Course APIs
* Lesson APIs
* Quiz APIs
* Progress Tracking APIs
* Certificate APIs
* Dashboard APIs
* Analytics APIs

Backend Base URL:

```
http://localhost:8000/api/
```

---

## 🛠 Tech Stack

### Frontend

* React.js
* React Router
* Axios
* Context API
* JWT Authentication
* Chart libraries for analytics
* CSS / Bootstrap / Tailwind

### Backend (Integrated)

* Django
* Django REST Framework
* Simple JWT

---

## 📁 Project Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/
│   ├── courses/
│   ├── lessons/
│   ├── quizzes/
│   ├── progress/
│   ├── certificates/
│   ├── dashboard/
│   ├── common/
│   └── layout/
│
├── pages/               # Page-level components
│   ├── Auth/
│   ├── Courses/
│   ├── Dashboard/
│   ├── Progress/
│   ├── Certificates/
│   └── Admin/
│
├── services/            # API service layer
├── context/             # Global state management
├── hooks/               # Custom React hooks
├── utils/               # Utility helpers
└── styles/              # Global styles
```

---

## ⚙️ Setup Instructions

### Prerequisites

* Node.js (v14 or higher)
* npm or yarn
* Django backend running locally

### Installation

1. Clone the repository

```bash
git clone https://github.com/adityakhule15/lms_frontend.git
cd lms_frontend
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Configure environment variables

Create a `.env` file:

```
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

4. Start the development server

```bash
npm start
# or
yarn start
```

Frontend will be available at:

```
http://localhost:3000
```

---

## 🔐 Authentication Flow

* JWT token-based authentication
* Protected routes for students and instructors
* Role-based UI rendering
* Secure API communication via Axios interceptors

---

## 📊 Dashboards

### Student Dashboard

* Enrolled courses
* Progress tracking
* Quiz results
* Certificates

### Instructor Dashboard

* Courses overview
* Student enrollment statistics
* Course completion metrics
* Analytics insights

---

## 🚀 Deployment

The frontend can be deployed on:

* Vercel
* Netlify
* AWS S3 + CloudFront

---

## 👨‍💻 Author

**Aditya Sanjayrao Khule**
Full Stack Python / Django Developer

GitHub:

* Backend: [https://github.com/adityakhule15/lms](https://github.com/adityakhule15/lms)
* Frontend: [https://github.com/adityakhule15/lms_frontend](https://github.com/adityakhule15/lms_frontend)

---

## 📜 License

MIT License
