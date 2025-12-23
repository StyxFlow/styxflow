```
  _____ _                   _____ _
 / ____| |                 |  ___| |
| (___ | |_ _   _  __   __ | |_  | |  ___  __    __    __
 \___ \| __| | | | \ \ / / |  _| | | / _ \ \  \ /  \ /  /
 ____) | |_| |_| |  \ \ /  | |   | || (_) | \    /\    /
|_____/ \__|\__,_| /_/ \_\ |_|   |_| \___/   \__/  \__/
             __| |        StyxFlow
            |__ /
```

> A modern turborepo-based interview platform with AI-powered features, real-time communication, and comprehensive job management.

## 📋 Database ER Diagram

> [Add your database ER diagram image here]
>
> To generate an ER diagram, you can use tools like:
>
> - [dbdiagram.io](https://dbdiagram.io)
> - [Drizzle Studio](https://drizzle.studio/) (since the project uses Drizzle ORM)
> - [Lucidchart](https://www.lucidchart.com)

## ✨ Features

- **AI-Powered Interviews**: Intelligent interview generation and evaluation using Google Gemini and Groq AI
- **Real-Time Communication**: Voice and video capabilities with VAPI integration
- **Interview Recording**: Built-in recording functionality using RecordRTC
- **Job Management**: Create, manage, and track job postings and candidate applications
- **User Authentication**: Secure authentication with Better Auth supporting multiple OAuth providers (Google, Twitter, Microsoft)
- **Vector Search**: Semantic search capabilities powered by Qdrant vector database
- **File Uploads**: Cloudinary integration for resume and profile picture uploads
- **Task Queue System**: Background job processing with Redis-backed queues
- **Monorepo Structure**: Turborepo-based architecture for efficient development and building

## 📦 What's Inside?

### Apps

- **`api`**: Express.js REST API backend with TypeScript
  - Database: PostgreSQL with Drizzle ORM
  - Vector DB: Qdrant for semantic search
  - Cache: Redis for caching and queues
  - AI Agents: Google Gemini and Groq integration
  - worker: Background job processing service with BullMQ

- **`web`**: Next.js 15+ frontend application
  - Interview attempt interface
  - Job posting and management
  - User profile management
  - Real-time AI powered voice communication with VAPI

### Packages

- **`typescript-config`**: Shared TypeScript configurations

### Development Tools

- [TypeScript](https://www.typescriptlang.org/) - Static type checking
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting
- [Turborepo](https://turborepo.com/) - Monorepo build system

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- Yarn 1.22.22 (or npm/pnpm)
- Docker & Docker Compose (for backend with containers)
- PostgreSQL (if running on local database)
- Redis (if running on local redis)

### 1️⃣ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/styxflow.git
cd styxflow

# Install dependencies
yarn install
# or
npm install
```

### 2️⃣ Environment Configuration

Create environment files for each app using the provided examples:

```bash
# API configuration
cp apps/api/.env.example apps/api/.env

# Web configuration
cp apps/web/.env.example apps/web/.env
```

Refer to each `.env.example` file for detailed parameter descriptions.

## 🏃 Running the Application

### Option A: Full Stack with Yarn/NPM (Recommended for Development)

Run all apps simultaneously using Turborepo:

```bash
# Start development servers for all apps
yarn dev
# or
npm run dev

# This starts:
# - API server on http://localhost:8000
# - Web app on http://localhost:3000
```

Run specific apps:

```bash
# Start only the web app
yarn workspace web dev
# or
npm run dev -- --filter=web

# Start only the API
yarn workspace api dev
# or
npm run dev -- --filter=api

# Start only the worker
yarn workspace api worker
# or
npm run worker -- --filter=api
```

### Option B: Backend+Worker with Docker Compose (API Only)

Run the API backend services using Docker Compose:

```bash
# Development setup
docker-compose -f docker-compose.dev.yml up -d

# Production setup
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

After the backend is running, start the web app in a separate terminal:

```bash
cd apps/web
yarn dev
# or
npm run dev
```

### Option C: Full Application with Docker Compose

Run the complete application stack using Docker:

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# For development with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View all running services
docker-compose ps

# Stop all services
docker-compose down
```

## 🏗️ Building

Build all packages and apps:

```bash
yarn build
# or
npm run build
```

Build specific packages:

```bash
yarn build --filter=web
# or
npm run build -- --filter=web
```

## 🧹 Linting & Formatting

Run linting across the monorepo:

```bash
yarn lint
# or
npm run lint
```

Format code with Prettier:

```bash
yarn format
# or
npm run format
```

Check types:

```bash
yarn check-types
# or
npm run check-types
```

## 🗄️ Database Management

### Drizzle ORM

Generate migrations:

```bash
cd apps/api
yarn drizzle-kit generate
```

Apply migrations:

```bash
cd apps/api
yarn drizzle-kit migrate
```

### Viewing Data with Drizzle Studio

Open Drizzle Studio to inspect database:

```bash
cd apps/api
yarn drizzle-kit studio
```

## 📚 API Documentation

The API is available at `http://localhost:8000` in development.

Key endpoints:

- `/api/v1/auth/*` - Authentication endpoints
- `/api/v1/interviews/*` - Interview management
- `/api/v1/jobs/*` - Job postings
- `/api/v1/users/*` - User profiles

## 🧪 Testing

Run tests across the monorepo:

```bash
yarn test
```

Run tests for specific apps:

```bash
yarn workspace api test
```

## 📖 Project Structure

```
styxflow/
├── apps/
│   ├── api/              # Express.js backend API+Background Worker
│   ├── web/              # Next.js frontend application
├── packages/
│   └── typescript-config/  # Shared TypeScript configs
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── turbo.json            # Turborepo configuration
```

## 🔐 Environment Variables

Each application requires specific environment variables. See the respective `.env.example` files:

- **API**: [apps/api/.env.example](apps/api/.env.example)
- **Web**: [apps/web/.env.example](apps/web/.env.example)

## 🚢 Deployment

### Vercel (Next.js Web App)

```bash
# Push to GitHub and connect your repository to Vercel
# Vercel will automatically detect the Next.js app and deploy
```

### Backend Hosting

Deploy the API backend using:

- Docker containers on any cloud platform (AWS, GCP, Azure, DigitalOcean)
- Railway, Render, or other Node.js-friendly platforms

## 📚 Learn More

- [Turborepo Documentation](https://turborepo.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth Documentation](https://better-auth.vercel.app/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, open an issue on GitHub or contact the maintainers.
