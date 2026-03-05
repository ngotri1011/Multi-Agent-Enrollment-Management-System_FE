# Multi-Agent Enrollment Management System with LLM Assistance

### Hệ thống đa tác tử hỗ trợ quản lý tuyển sinh với sự hỗ trợ của LLM

## Project Overview

**MAEMS** (Multi-Agent Enrollment Management System) is a web-based platform designed to streamline and automate the university admission process. The system leverages a multi-agent architecture combined with Large Language Models (LLMs) to reduce administrative overhead, ensure consistency in enrollment decisions, and provide transparent, natural language explanations to applicants.

This repository contains the **Frontend** application of the system.

---

## Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Build Tool       | Vite 7                              |
| Language         | TypeScript 5.9                      |
| UI Library       | React 19                            |
| UI Framework     | Ant Design + TailwindCSS            |
| Routing          | React Router DOM v7                 |
| State Management | Zustand                             |
| HTTP Client      | Axios                               |
| Authentication   | Firebase Auth (Google Sign-In) + JWT |
| Icons            | Lucide React                        |

---

## Key Features

### Multi-Agent Coordination

The system utilizes specialized agents to handle distinct stages of the enrollment lifecycle:

- **Intake Agent** — Application submission and data normalization
- **Verification Agent** — Automated document checks for format, completeness, and validity
- **Eligibility Agent** — Rule-based evaluation against predefined admission criteria
- **Communication Agent** — LLM-powered inquiry handling and response generation

### LLM Integration

- Interpretation of enrollment regulations and policy documents
- Natural language responses to applicant inquiries
- Transparent explanations for eligibility decisions and missing requirements

### User Roles

| Role                 | Primary Functions                                                              |
| -------------------- | ------------------------------------------------------------------------------ |
| **System Admin**     | Manage enrollment configurations, admission rules, articles, and system reports |
| **Admission Officer**| Review applicant records, handle escalated cases, monitor agent performance     |
| **QA Officer**       | Review agent-generated evaluations, validate eligibility logic                 |
| **Applicant**        | Submit applications, upload documents, track status, receive notifications     |
| **Guest**            | Browse homepage, view admission information and articles                       |

### Admission Methods Supported

- Xét kết quả học tập cấp THPT (Học bạ)
- Xét kết quả thi tốt nghiệp THPT
- Xét kết quả kỳ thi đánh giá năng lực (ĐHQG Hà Nội / ĐHQG TP.HCM)
- Phương thức khác (xét tuyển thẳng, văn bằng, chứng chỉ)

---

## Project Structure

```
MAEMS_FE/
├── public/
├── src/
│   ├── api/                  # API service modules (auth, applicant, application, programs, campuses, admission_types)
│   ├── app/                  # Root App component & providers
│   ├── auth/                 # Auth initialization
│   ├── components/
│   │   ├── layouts/          # ApplicantLayout, GuestLayout, StaffLayout
│   │   └── ...               # Shared components (Header, Sidebar, ExportPanel, GoogleLoginButton)
│   ├── hooks/                # Custom hooks (useAuth, useRoleGuard)
│   ├── pages/
│   │   ├── admin/            # Admin dashboard, reports, eligibility rules, articles
│   │   ├── admission/        # Admission info page
│   │   ├── agents/           # Agent dashboard & performance monitoring
│   │   ├── applicant/        # Applicant dashboard & profile
│   │   ├── application/      # Application submission forms (Học bạ, ĐGNL, THPT, Khác)
│   │   ├── articles/         # Article management (list, detail, editor)
│   │   ├── auth/             # Authentication page
│   │   ├── eligibility/      # Rule configuration
│   │   ├── homepage/         # Public homepage
│   │   ├── qa/               # QA dashboard & review evaluation
│   │   ├── reports/          # Report dashboard
│   │   └── staff/            # Staff dashboard
│   ├── routes/               # AppRouter & RoleGuard
│   ├── services/             # Auth service
│   ├── stores/               # Zustand auth store
│   ├── types/                # TypeScript type definitions
│   ├── firebase.ts           # Firebase configuration
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── .env                      # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.*
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/your-org/Multi-Agent-Enrollment-Management-System_FE.git
cd Multi-Agent-Enrollment-Management-System_FE/MAEMS_FE
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment variables:**

Create a `.env` file in the `MAEMS_FE/` directory:

```env
VITE_MAEMS_API_URL=<your-backend-api-url>
```
Create firebase.ts file in src directory

4. **Start the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Available Scripts

| Script          | Command             | Description                    |
| --------------- | ------------------- | ------------------------------ |
| `npm run dev`   | `vite`              | Start development server       |
| `npm run build` | `tsc -b && vite build` | Type-check and build for production |
| `npm run lint`  | `eslint .`          | Run ESLint                     |
| `npm run preview` | `vite preview`    | Preview production build       |

---

## Route Overview

### Public Routes

| Path           | Page            |
| -------------- | --------------- |
| `/`            | Homepage        |
| `/tuyen-sinh`  | Admission Info  |
| `/auth`        | Authentication  |

### Applicant Routes (requires `applicant` role)

| Path                                       | Page                    |
| ------------------------------------------ | ----------------------- |
| `/applicant/dashboard`                     | Applicant Dashboard     |
| `/applicant/profile`                       | Applicant Profile       |
| `/applicant/applications`                  | Application List        |
| `/applicant/applications/:id`              | Application Detail      |
| `/applicant/submit-application`            | Submit Application      |
| `/applicant/submit-application/hoc-ba`     | Submit via Học bạ       |
| `/applicant/submit-application/danh-gia-nang-luc` | Submit via ĐGNL  |
| `/applicant/submit-application/tot-nghiep-thpt`   | Submit via THPT  |
| `/applicant/submit-application/phuong-thuc-khac`  | Submit via Other  |

### Staff Routes (requires `staff` role)

| Path                         | Page                  |
| ---------------------------- | --------------------- |
| `/staff/dashboard`           | Staff Dashboard       |
| `/staff/agents/dashboard`    | Agent Dashboard       |
| `/staff/agents/performance`  | Agent Performance     |

### Admin Routes (requires `admin` role)

| Path                        | Page               |
| --------------------------- | ------------------ |
| `/admin/dashboard`          | Admin Dashboard    |
| `/admin/reports`            | Report Dashboard   |
| `/admin/eligibility/rules`  | Rule Configuration |
| `/admin/articles`           | Article Management |
| `/admin/articles/new`       | Create Article     |
| `/admin/articles/:id`       | Edit Article       |

### QA Routes (requires `qa` role)

| Path                     | Page                |
| ------------------------ | ------------------- |
| `/qa/dashboard`          | QA Dashboard        |
| `/qa/review-evaluation`  | Review Evaluations  |

---

## Backend API

The frontend communicates with the MAEMS Backend API hosted on Azure. API modules include:

- **Auth** — Authentication and token management
- **Applicant** — Applicant profile management
- **Application** — Application CRUD and submission
- **Programs** — Academic program data
- **Campuses** — Campus information
- **Admission Types** — Admission method configurations

---

## Documentation

- `Requirements.md` — Functional and non-functional requirements
- `Tech.md` — Technology stack decisions
- `Regist_File.md` — Required enrollment documents reference
