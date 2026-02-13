# CareerConnect - Online Job Portal
A full-featured job portal built with React, TypeScript, Cloudflare Workers, and D1 SQLite database.
## Features
### For Job Seekers
- 🔍 Browse and search jobs with advanced filters
- 📝 Create and manage profile with skills and experience
- 💼 Apply to jobs with cover letters
- 📊 Track application status in dashboard
- 🔔 View application history
### For Recruiters
- 🏢 Create and manage company profile
- 📢 Post, edit, and delete job listings
- 👥 View and manage job applicants
- ✅ Update application status (Accept/Reject/Pending)
- 📈 Dashboard with job statistics
### General Features
- 🔐 JWT-based authentication
- 👤 Role-based access control
- 🎨 Beautiful, responsive UI with Tailwind CSS
- 🌙 Dark mode support
- ⚡ Fast edge deployment with Cloudflare Workers
- 💾 Serverless D1 SQLite database
## Tech Stack
**Frontend:**
- React 18 with TypeScript
- Zustand for state management
- React Hook Form + Zod for form validation
- Tailwind CSS for styling
- Axios for API requests
- React Router for navigation
- shadcn/ui components
**Backend:**
- Cloudflare Workers with Hono framework
- D1 SQLite database
- JWT authentication with Web Crypto API
- RESTful API architecture
## Getting Started
### Prerequisites
- [Bun](https://bun.sh) v1.0 or higher
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
### Installation
1. Clone the repository:
```bash
git clone <repo-url>
cd careerconnect
```
2. Install dependencies:
```bash
bun install
```
3. Set up D1 database:
```bash
# Create D1 database
bunx wrangler d1 create job-portal-db
# Note the database_id and update wrangler.jsonc
```
4. Create KV namespaces:
```bash
# Create KV namespaces
bunx wrangler kv namespace create SESSIONS
bunx wrangler kv namespace create CACHE
# Update wrangler.jsonc with the namespace IDs
```
5. Apply database schema:
```bash
# Apply the schema to local database
bunx wrangler d1 execute job-portal-db --local --file=worker/db-schema.sql
# Apply the schema to production database
bunx wrangler d1 execute job-portal-db --remote --file=worker/db-schema.sql
```
6. Update `wrangler.jsonc`:
```jsonc
{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "job-portal-db",
    "database_id": "your-database-id-here"
  }],
  "kv_namespaces": [
    {
      "binding": "SESSIONS",
      "id": "your-sessions-kv-id"
    },
    {
      "binding": "CACHE",
      "id": "your-cache-kv-id"
    }
  ]
}
```
### Development
Start the development server:
```bash
bun run dev
```
Visit `http://localhost:3000`
### Deployment
Deploy to Cloudflare Workers:
```bash
bun run deploy
```
### Mock Data
The database schema includes mock data:
- 2 job seekers (password: any 6+ chars for demo)
- 2 recruiters (password: any 6+ chars for demo)
- 2 companies
- 4 sample jobs
- 2 sample applications
## API Documentation
### Authentication
**POST /api/auth/register**
- Register a new user
- Body: `{ email, password, displayName, role }`
- Returns: `{ user, token }`
**POST /api/auth/login**
- Login user
- Body: `{ email, password }`
- Returns: `{ user, token }`
**GET /api/auth/me**
- Get current user
- Headers: `Authorization: Bearer <token>`
- Returns: `{ user }`
### Jobs
**GET /api/jobs**
- Get all active jobs with filters
- Query params: `search, location, jobType, experienceLevel, salaryMin, page, limit`
- Returns: `{ jobs[], pagination }`
**GET /api/jobs/:id**
- Get job details
- Returns: `{ job }`
**POST /api/jobs** (Recruiter only)
- Create new job
- Headers: `Authorization: Bearer <token>`
- Body: `{ title, description, requirements, location, jobType, experienceLevel, salaryMin, salaryMax, skills, status }`
- Returns: `{ job }`
**PUT /api/jobs/:id** (Recruiter only)
- Update job
- Headers: `Authorization: Bearer <token>`
- Body: Job fields to update
- Returns: `{ job }`
**DELETE /api/jobs/:id** (Recruiter only)
- Delete job
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success: true }`
**GET /api/jobs/my/all** (Recruiter only)
- Get recruiter's jobs
- Headers: `Authorization: Bearer <token>`
- Returns: `{ jobs[] }`
### Applications
**POST /api/applications** (Job Seeker only)
- Apply to a job
- Headers: `Authorization: Bearer <token>`
- Body: `{ jobId, coverLetter }`
- Returns: `{ application }`
**GET /api/applications/my** (Job Seeker only)
- Get user's applications
- Headers: `Authorization: Bearer <token>`
- Returns: `{ applications[] }`
**GET /api/applications/job/:jobId** (Recruiter only)
- Get applicants for a job
- Headers: `Authorization: Bearer <token>`
- Returns: `{ applications[] }`
**PUT /api/applications/:id/status** (Recruiter only)
- Update application status
- Headers: `Authorization: Bearer <token>`
- Body: `{ status: 'pending' | 'accepted' | 'rejected' }`
- Returns: `{ application }`
### Profile (Job Seeker)
**GET /api/profile**
- Get user profile
- Headers: `Authorization: Bearer <token>`
- Returns: `{ profile }`
**PUT /api/profile** (Job Seeker only)
- Update profile
- Headers: `Authorization: Bearer <token>`
- Body: `{ phone, location, bio, skills, experience, education }`
- Returns: `{ profile }`
### Company (Recruiter)
**GET /api/company**
- Get company profile
- Headers: `Authorization: Bearer <token>`
- Returns: `{ company }`
**POST /api/company** (Recruiter only)
- Create company profile
- Headers: `Authorization: Bearer <token>`
- Body: `{ name, description, industry, location, website, size }`
- Returns: `{ company }`
**PUT /api/company** (Recruiter only)
- Update company profile
- Headers: `Authorization: Bearer <token>`
- Body: Company fields to update
- Returns: `{ company }`
## Project Structure
```
├── src/                      # Frontend source
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Navbar.tsx
│   │   ├── JobCard.tsx
│   │   ├── ApplicationCard.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── JobsPage.tsx
│   │   ├── JobDetailsPage.tsx
│   │   ├── JobSeekerDashboard.tsx
│   │   ├── RecruiterDashboard.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── CompanyProfilePage.tsx
│   │   ├── PostJobPage.tsx
│   │   ├── ApplicantsPage.tsx
│   │   └── MyJobsPage.tsx
│   ├── store/              # Zustand stores
│   │   ├── authStore.ts
│   │   └── jobStore.ts
│   ├── lib/                # Utilities
│   │   └── api.ts
│   └── main.tsx            # Entry point
├── worker/                  # Backend source
│   ├── auth.ts             # Authentication utilities
│   ├── db.ts               # Database operations
│   ├── db-schema.sql       # Database schema with mock data
│   └── userRoutes.ts       # API routes
├── shared/                 # Shared types
│   └── types.ts
└── wrangler.jsonc          # Cloudflare configuration
```
## Environment Variables
Create a `.env` file based on `.env.example`:
```env
JWT_SECRET=your-secure-jwt-secret
SESSION_TTL=604800
```
For production, use Wrangler secrets:
```bash
bunx wrangler secret put JWT_SECRET
```
## License
MIT License
## Support
For issues and questions, please open an issue on GitHub.