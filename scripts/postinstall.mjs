#!/usr/bin/env node
import { execSync } from "child_process";

try {
  execSync("npx prisma generate", {
    stdio: "inherit",
    env: { ...process.env },
  });
} catch {
  console.log(
    "\n⚠ Skipping prisma generate — DATABASE_URL may not be set yet.\n" +
      "  Run 'npx prisma generate' after configuring your .env file.\n",
  );
}
