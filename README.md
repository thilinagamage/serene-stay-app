# 🏨 Serene Stay — Hotel Booking Platform

> Full-stack hotel booking application with production AWS deployment — built as a cloud infrastructure assignment demonstrating real-world DevOps practices.

![CI/CD](https://github.com/thilinagamage/doctor-channelling-system/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue?logo=postgresql)
![AWS](https://img.shields.io/badge/AWS-Deployed-orange?logo=amazon-aws)
![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [AWS Architecture](#aws-architecture)
- [Infrastructure](#infrastructure)
- [CI/CD Pipeline](#cicd-pipeline)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Deployment](#deployment)
- [Lessons Learned](#lessons-learned)

---

## Overview

Serene Stay is a boutique hotel booking platform for a Sri Lankan hotel chain with properties in **Galle**, **Colombo**, and **Matara**. It supports two user roles:

- **Guest** — browse rooms, make bookings, leave reviews
- **Admin** — manage rooms, confirm/cancel bookings, view dashboard stats, upload room images

This project was deployed end-to-end on AWS using EC2, RDS, S3, ALB, Route 53, ACM, IAM, VPC, and CloudWatch — all configured via the AWS Console and automated with GitHub Actions CI/CD.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| ORM | Prisma v7 (with `@prisma/adapter-pg`) |
| Database | PostgreSQL 18 (Amazon RDS) |
| Auth | Custom JWT (`jose`) + `bcryptjs` + httpOnly cookies |
| Validation | Zod v4 |
| File Storage | AWS S3 (presigned URLs) |
| Runtime | Node.js 22 |
| Process Manager | PM2 |

---

## AWS Architecture

```
User
 │  HTTPS
 ▼
Route 53 (DNS) ──► ACM (SSL Certificate)
 │
 ▼
Internet Gateway
 │
 ▼
Application Load Balancer (port 443)
 │  HTTP → HTTPS redirect
 │  Forwards to port 3000
 ▼
EC2 t4g.micro (Ubuntu, ARM64)          ┌─────────────────┐
├── Next.js App (PM2)          ──────► │   Amazon RDS     │
└── IAM Role → S3 access               │  PostgreSQL 18   │
                                        │  Private Subnet  │
         S3 Bucket                      └─────────────────┘
   (Room images via
    presigned URLs)

DevOps & Monitoring
├── GitHub Actions (CI/CD)
├── CloudWatch (Metrics + Alarms)
└── IAM (Roles + Policies)
```

### Network Layout

| Resource | Subnet | CIDR |
|----------|--------|------|
| EC2 + ALB | Public (us-east-1a) | 10.0.1.0/24 |
| ALB (2nd AZ) | Public (us-east-1b) | 10.0.2.0/24 |
| RDS Primary | Private (us-east-1a) | 10.0.10.0/24 |
| RDS Standby | Private (us-east-1b) | 10.0.11.0/24 |

### Security Groups

| Group | Inbound |
|-------|---------|
| `serene-alb-sg` | HTTP 80 + HTTPS 443 from `0.0.0.0/0` |
| `serene-ec2-sg` | Port 3000 from ALB · SSH 22 from admin IP only |
| `serene-rds-sg` | PostgreSQL 5432 from EC2 security group only |

---

## Infrastructure

### Services Used & Why

| Service | Purpose |
|---------|---------|
| **VPC** | Isolated private network — EC2 and RDS are not directly internet-exposed |
| **EC2 (t4g.micro)** | ARM Graviton instance running the Next.js app via PM2 |
| **RDS PostgreSQL 18** | Managed database in a private subnet — AWS handles backups and patching |
| **S3** | Stores room images; block public access enabled, presigned URLs for uploads |
| **ALB** | HTTPS termination, HTTP→HTTPS redirect, health checks on `/api/rooms` |
| **ACM** | Free auto-renewed SSL certificate for the domain |
| **Route 53** | DNS — Alias A record pointing domain to ALB |
| **IAM Role** | EC2 instance profile for S3 access — no hardcoded AWS credentials |
| **CloudWatch** | CPU/status alarms, dashboard monitoring EC2 + RDS + ALB |
| **Elastic IP** | Static IP so EC2 address does not change on restart |

---

## CI/CD Pipeline

Every push to `main` triggers the GitHub Actions workflow:

```
push to main
     │
     ▼
┌─────────────┐     fail → stops here
│ lint-build  │ ──────────────────────────►  ✗
│  npm ci     │
│  npm lint   │
│  npm build  │
└─────┬───────┘
      │ pass
      ▼
┌─────────────────────────────┐
│         deploy              │
│  SSH into EC2               │
│  git pull origin main       │
│  npm ci                     │
│  npx prisma migrate deploy  │
│  npm run build              │
│  pm2 reload --update-env    │  ◄── zero downtime
└─────────────────────────────┘
```

**GitHub Secrets required:**

| Secret | Description |
|--------|-------------|
| `EC2_HOST` | EC2 Elastic IP address |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of `.pem` private key file |

---

## Local Development

### Prerequisites

- Node.js 22+
- PostgreSQL 16 running locally
- AWS account (for S3 — optional in dev)

### Setup

```bash
# Clone the repo
git clone https://github.com/<your-username>/hotel-booking-app.git
cd hotel-booking-app

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed demo data
npx prisma db seed

# Start dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@serenestay.com | password123 |
| Guest | guest@example.com | password123 |

> Change these immediately in any real environment.

---

## Environment Variables

```env
# Database
# Local:      ?sslmode=disable
# RDS/AWS:    ?sslmode=no-verify
DATABASE_URL="postgresql://user:password@host:5432/serenestay?sslmode=disable"

# JWT signing key — minimum 32 characters
# Generate with: openssl rand -base64 32
SESSION_SECRET="your-secret-here"

# AWS S3 (optional locally — skip image uploads in dev)
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"

NODE_ENV="development"
```

> On EC2, the IAM instance profile provides AWS credentials automatically — `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are not needed on the server.

---

## Database

### Schema (4 tables)

```
User ──────────┐
               ├── Booking ──► Room
               └── Review  ──► Room
```

| Table | Key Fields |
|-------|-----------|
| `User` | id, email, name, password (bcrypt), role (`GUEST`\|`ADMIN`) |
| `Room` | id, name, price (LKR), capacity, location, imageUrl, featured |
| `Booking` | id, userId, roomId, checkIn, checkOut, status (`PENDING`\|`CONFIRMED`\|`CANCELLED`\|`COMPLETED`) |
| `Review` | id, userId, roomId, rating (1–5), comment |

### Useful Commands

```bash
npx prisma studio          # Visual database browser
npx prisma migrate dev     # Create and apply new migration (dev)
npx prisma migrate deploy  # Apply migrations (production)
npx prisma db seed         # Re-seed demo data
npx prisma generate        # Regenerate client after schema changes
```

---

## Deployment

### Production Deploy to EC2

```bash
# SSH into EC2
ssh -i serene-stay-key.pem ubuntu@<EC2-IP>

# Clone and setup
git clone https://github.com/<your-username>/hotel-booking-app.git
cd hotel-booking-app
cp .env.example .env
nano .env   # fill in real values

# Add swap (required on t4g.micro)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Install, migrate, build, start
npm install
npx prisma migrate deploy
npx prisma db seed
npm run build
pm2 start ecosystem.config.js
pm2 save
```

### Key Production Gotchas

| Issue | Fix |
|-------|-----|
| RDS SSL certificate error | Use `?sslmode=no-verify` in `DATABASE_URL` — AWS CA not in Ubuntu trust store |
| `npm install` killed (OOM) | Add 2GB swap before installing — t4g.micro has only 1GB RAM |
| Node.js version mismatch | Prisma v7 requires Node 22+ — install via NodeSource, not `apt` |
| PM2 showing errored | Always run `npm run build` before `pm2 start` |
| Build fails — missing PostCSS | Use `npm ci` not `npm ci --omit=dev` — `@tailwindcss/postcss` is a devDependency needed at build time |
| DNS not resolving | Set Route 53 nameservers at registrar exactly; add ACM CNAME records at registrar directly |

---

## Lessons Learned

Real issues hit during deployment and what they taught me:

1. **IAM roles over credentials** — Instance profiles are cleaner and safer than managing AWS keys in `.env`. The app never touches credentials directly.

2. **RDS SSL is not standard** — `pg` v8 treats `sslmode=require` as full certificate verification. AWS's internal CA isn't in Ubuntu's trust store, so connections fail. `sslmode=no-verify` is the correct setting inside a private VPC.

3. **Tiny instances need swap** — A t4g.micro (1GB RAM) cannot handle `npm install` or `next build` without swap. This is not obvious from AWS documentation but critical in practice.

4. **DNS propagation is the slowest part** — Nameserver changes at the registrar can take hours. ACM validation CNAMEs should be added directly at the registrar rather than waiting for Route 53 propagation.

5. **PM2 does not build** — It only runs. Build must always happen before starting the process manager. The CI/CD workflow enforces this order automatically.

6. **Security groups as layered defence** — Three separate groups (ALB → EC2 → RDS) with source-based rules meant the database was never reachable from the internet, even if EC2 were compromised.

---

## API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/rooms` | Public | List rooms (`?location=`, `?featured=true`) |
| GET | `/api/rooms/[id]` | Public | Room detail with reviews |
| POST | `/api/rooms` | Admin | Create room |
| PUT | `/api/rooms/[id]` | Admin | Update room |
| DELETE | `/api/rooms/[id]` | Admin | Delete room |
| GET | `/api/bookings` | Auth | Current user's bookings |
| POST | `/api/bookings` | Auth | Create booking (availability checked) |
| PUT | `/api/bookings/[id]` | Auth | Cancel booking |
| GET | `/api/reviews` | Public | List reviews (`?roomId=`) |
| POST | `/api/reviews` | Auth | Submit review |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/bookings` | Admin | All bookings (`?status=`) |
| PUT | `/api/admin/bookings` | Admin | Update booking status |
| DELETE | `/api/admin/reviews/[id]` | Admin | Delete review |
| POST | `/api/upload` | Auth | Upload image to S3 |

---

<div align="center">

**Serene Stay** · Built with Next.js · Deployed on AWS · Automated with GitHub Actions

[Live Demo](https://imperialchrysalis.online) · [Report an Issue](https://github.com/<your-username>/hotel-booking-app/issues)

</div>
