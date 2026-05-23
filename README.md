# Serene Stay — Hotel Booking App

![CI/CD](https://github.com/your-username/hotel-booking-app/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![AWS](https://img.shields.io/badge/AWS-Deployed-orange?logo=amazon-aws)
![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)

A full-stack hotel booking web application for a Sri Lankan boutique hotel chain with locations in Galle, Colombo, and Matara.

🌐 **Live:** https://imperialchrysalis.online

---

## Tech Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL 18 (Amazon RDS)
- **ORM:** Prisma v7
- **Auth:** Custom JWT (jose) + bcryptjs
- **Storage:** Amazon S3
- **Deployment:** AWS EC2 + ALB + Route 53

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 22+
- PostgreSQL running locally

### Setup

```bash
git clone https://github.com/your-org/hotel-booking-app.git
cd hotel-booking-app
npm install
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/serenestay?sslmode=disable"
SESSION_SECRET="your-secret-min-32-chars"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
NODE_ENV="development"
```

Then run:

```bash
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

App runs at http://localhost:3000

---

## Demo Credentials

| Role  | Email                    | Password    |
|-------|--------------------------|-------------|
| Admin | admin@serenestay.com     | password123 |
| Guest | guest@example.com        | password123 |

---

## Project Structure

```
src/
├── app/          # Next.js pages and API routes
├── components/   # Shared UI components
├── lib/          # DB, auth, S3, validation utilities
├── actions/      # Server actions (login, signup, logout)
└── types/        # TypeScript types
prisma/
├── schema.prisma # Data models (User, Room, Booking, Review)
└── seed.ts       # Demo data seeder
```

---

## AWS Infrastructure

| Service | Purpose |
|---------|---------|
| EC2 (t4g.micro) | Hosts the Next.js app via PM2 |
| RDS PostgreSQL 18 | Managed database in private subnet |
| S3 | Room image storage |
| ALB | HTTPS termination + health checks |
| ACM | Free SSL certificate |
| Route 53 | DNS management |
| CloudWatch | Monitoring and alarms |
| IAM | EC2 instance profile for S3 access |

---

## CI/CD

GitHub Actions runs on every push to `main`:

1. **Lint & Build** — validates code and builds Next.js
2. **Deploy** — SSH into EC2, pull latest, migrate, rebuild, reload PM2

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | JWT signing secret (min 32 chars) |
| `AWS_REGION` | AWS region (e.g. us-east-1) |
| `AWS_S3_BUCKET` | S3 bucket name for images |
| `NODE_ENV` | `development` or `production` |
