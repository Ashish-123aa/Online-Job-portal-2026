# Full-Stack React + Cloudflare Workers Template

A modern, production-ready template for building full-stack applications with React, TypeScript, and Cloudflare Workers. Features authentication, database integration, and a beautiful UI component library.

[cloudflarebutton]

## ✨ Features

- **Modern Frontend Stack**: React 18, TypeScript, Vite with HMR
- **Cloudflare Workers Backend**: Edge-first deployment with Hono framework
- **Authentication System**: JWT-based auth with session management
- **Database Integration**: Cloudflare D1 (SQLite) with Drizzle ORM
- **UI Components**: 46+ pre-built components using shadcn/ui and Radix UI
- **Type-Safe API Client**: End-to-end type safety from frontend to backend
- **Dark Mode**: Built-in theme switching with system preference detection
- **Rate Limiting**: Protect your API endpoints from abuse
- **Security Headers**: Production-ready security configuration
- **Error Handling**: Comprehensive error boundaries and reporting

## 🛠️ Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for blazing-fast development
- TailwindCSS for styling
- React Router for navigation
- TanStack Query for data fetching
- Framer Motion for animations
- shadcn/ui component library

### Backend
- Cloudflare Workers with Hono framework
- Cloudflare D1 (serverless SQL database)
- Drizzle ORM for type-safe database queries
- JWT authentication with bcrypt
- KV storage for sessions and caching

## 📋 Prerequisites

- [Bun](https://bun.sh) v1.0 or higher
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier available)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed globally

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd <project-name>

# Install dependencies (bootstrap script runs automatically)
bun install
```

### 2. Database Setup

Create a D1 database:

```bash
# Create database
bunx wrangler d1 create your-db-name

# Update wrangler.jsonc with the database_id from the output
```

Create KV namespaces:

```bash
# Create KV namespaces
bunx wrangler kv namespace create SESSIONS
bunx wrangler kv namespace create CACHE

# Update wrangler.jsonc with the namespace IDs
```

Run database migrations:

```bash
# Generate migration files
bun run db:generate

# Apply migrations to local database
bunx wrangler d1 execute your-db-name --local --file=./drizzle/0000_*.sql

# Apply migrations to production
bunx wrangler d1 execute your-db-name --remote --file=./drizzle/0000_*.sql
```

### 3. Development

```bash
# Start development server
bun run dev
```

Visit `http://localhost:3000` to see your application.

## 📁 Project Structure

```
├── src/                      # Frontend source code
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── layout/         # Layout components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API client
│   ├── pages/              # Page components
│   └── main.tsx            # Application entry point
├── worker/                  # Backend source code
│   ├── database/           # Database schema and services
│   │   ├── schema.ts       # Drizzle schema definitions
│   │   └── services/       # Business logic services
│   ├── auth.ts             # Authentication utilities
│   ├── index.ts            # Worker entry point
│   └── userRoutes.ts       # API route handlers
├── drizzle/                # Database migrations
├── wrangler.jsonc          # Cloudflare Workers configuration
└── package.json            # Project dependencies
```

## 🗄️ Database Schema

The template includes a production-ready database schema with:

- **Users**: Authentication and profile management
- **Sessions**: JWT session tracking
- **Items**: Example CRUD entity
- **API Keys**: Programmatic access control

Customize the schema in `worker/database/schema.ts` and generate migrations with:

```bash
bun run db:generate
```

## 🔐 Authentication

The template includes a complete authentication system:

### Register a New User

```typescript
import { api } from '@/lib/api-client';

const { data, error } = await api.register(
  'user@example.com',
  'secure-password',
  'Display Name',
  'username'
);
```

### Login

```typescript
const { data, error } = await api.login(
  'user@example.com',
  'secure-password'
);
```

### Protected Routes

```typescript
import { useAuth } from '@/hooks/use-auth';

function ProtectedPage() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <div>Protected content</div>;
}
```

## 🌐 API Routes

The backend provides RESTful API endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout current session
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Items (Example CRUD)
- `GET /api/items` - List items (with pagination)
- `POST /api/items` - Create item
- `GET /api/items/:id` - Get single item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Health
- `GET /api/health` - API health check
- `GET /api/db/health` - Database health check

Add your custom routes in `worker/userRoutes.ts`.

## 🚢 Deployment

### Deploy to Cloudflare Workers

[cloudflarebutton]

Or deploy manually:

```bash
# Build and deploy
bun run deploy
```

### Environment Variables

Update production secrets in `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "JWT_SECRET": "your-secure-secret-here",
    "SESSION_TTL": "604800"
  }
}
```

For sensitive values, use Wrangler secrets:

```bash
bunx wrangler secret put JWT_SECRET
```

### Production Checklist

- [ ] Update `JWT_SECRET` in production
- [ ] Configure custom domain in Cloudflare dashboard
- [ ] Set up D1 database in production
- [ ] Create KV namespaces for production
- [ ] Run database migrations on production database
- [ ] Configure CORS settings if needed
- [ ] Set up monitoring and alerts
- [ ] Review security headers in `worker/index.ts`

## 🧪 Testing

```bash
# Run tests
bun test

# Run tests in watch mode
bun run test:watch

# Generate coverage report
bun run test:coverage
```

## 🎨 Customization

### Styling

- Modify theme colors in `src/index.css`
- Update Tailwind configuration in `tailwind.config.js`
- Add custom fonts in `src/index.css`

### Components

All UI components are located in `src/components/ui/` and can be customized to match your brand.

### Database

1. Modify schema in `worker/database/schema.ts`
2. Generate migration: `bun run db:generate`
3. Apply migration: `bunx wrangler d1 execute your-db-name --local --file=./drizzle/XXXX_*.sql`

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Hono Framework Documentation](https://hono.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Router Documentation](https://reactrouter.com/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ using React, TypeScript, and Cloudflare Workers