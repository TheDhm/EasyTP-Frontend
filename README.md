# EasyTP Frontend

[![React](https://img.shields.io/badge/React-19.1.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.6-646CFF)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.13-38B2AC)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://easytp.melekabderrahmane.com)

Modern React frontend for **EasyTP Server** - A cloud-native labs and storage management platform deployed on Hetzner Cloud with Kubernetes (k3s).

## Overview

EasyTP Frontend provides the web interface for the EasyTP platform. An updated and enhanced version of the original [EasyTP](https://github.com/TheDhm/EasyTP) project, deployed on Kubernetes with a full CI/CD pipeline.

## Key Features

- **Authentication & Authorization** - Secure user login with role-based access control
- **Dashboard** - Real-time overview of system status and resources
- **Application Management** - Deploy, start, stop, and monitor containerized applications
- **File Management** - Upload, download, and organize files with cloud storage
- **Admin Panel** - User activity monitoring and system administration
- **Responsive Design** - Optimized for desktop and mobile devices
- **Modern UI** - Clean interface with Tailwind CSS and Radix UI components

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.1.6
- **Styling**: TailwindCSS 4.1.13 with Radix UI components
- **State Management**: Zustand + React Query (TanStack)
- **Routing**: React Router DOM 7.9.1
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Development**: ESLint, TypeScript strict mode

## Infrastructure

- **Cloud Provider**: Hetzner Cloud
- **Orchestration**: Kubernetes (k3s)
- **Backend**: Django REST Framework
- **Security**: TLS encryption, network policies, automated updates
- **Performance**: High-availability setup with load balancing

## Related Repositories

- **Backend**: [EasyTP-Backend](https://github.com/TheDhm/EasyTP-Backend)
- **Infrastructure**: [EasyTP-Infra](https://github.com/TheDhm/EasyTP-Infra)
- **Original Monolith**: [EasyTP](https://github.com/TheDhm/EasyTP) (legacy)

## Prerequisites

- **Node.js** 18+
- **npm** 9+ or **yarn** 3+
- **Git**

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/TheDhm/EasyTP-Frontend.git
cd EasyTP-Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

```bash
# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Header, Layout)
│   └── ui/             # Base UI components (Button, Card, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and API client
├── pages/              # Page components
│   ├── admin/          # Admin panel pages
│   ├── Apps.tsx        # Application management
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Files.tsx       # File management
│   ├── Landing.tsx     # Landing page
│   └── Login.tsx       # Authentication
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point
```

## Configuration

The application connects to the EasyTP Django backend API. Ensure the backend is running and accessible for full functionality.

### Environment Variables

Create a `.env` file for local development:

```env
VITE_API_URL=http://localhost:8000/api
```

## Deployment

The application is designed for deployment on Kubernetes with:

- **Container orchestration** via k3s
- **Automated scaling** and health checks
- **Rolling updates** with zero downtime
- **Persistent storage** for user data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of the EasyTP platform. See the main repository for license information.

## Author

**MELEK Abderrahmane**

