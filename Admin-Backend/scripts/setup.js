#!/usr/bin/env node

/**
 * MED-CARE Admin Backend - Quick Start Setup
 * 
 * This script guides you through the initial setup process.
 * Run: npm run setup
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n");
  log(
    "═══════════════════════════════════════════════════════════════",
    colors.cyan,
  );
  log(`  ${title}`, colors.cyan);
  log(
    "═══════════════════════════════════════════════════════════════",
    colors.cyan,
  );
}

async function checkFile(filepath, description) {
  const exists = fs.existsSync(filepath);
  const icon = exists ? "✅" : "❌";
  const status = exists ? "found" : "missing";
  log(`${icon} ${description}: ${status}`, exists ? colors.green : colors.red);
  return exists;
}

async function runCommand(command, args, description) {
  return new Promise((resolve) => {
    log(`\n⏳ ${description}...`, colors.yellow);
    const child = spawn(command, args, { stdio: "inherit", shell: true });

    child.on("close", (code) => {
      if (code === 0) {
        log(`✅ ${description} completed`, colors.green);
      } else {
        log(
          `⚠️  ${description} completed with warnings (exit code: ${code})`,
          colors.yellow,
        );
      }
      resolve();
    });

    child.on("error", (err) => {
      log(`❌ Error: ${err.message}`, colors.red);
      resolve();
    });
  });
}

async function main() {
  logSection("MED-CARE Admin Backend Setup");

  log("\n📋 Checking project files...", colors.blue);
  await checkFile(".env", ".env configuration");
  await checkFile("package.json", "package.json");
  await checkFile("tsconfig.json", "tsconfig.json");
  await checkFile("src/server.ts", "Server entry point");
  await checkFile("src/seed.ts", "Database seeder");

  logSection("Installation");

  log(
    "\n⚙️  Installing dependencies (this may take a minute)...",
    colors.yellow,
  );
  await runCommand("npm", ["install"], "NPM installation");

  logSection("MongoDB Setup");

  log(
    "\n🗄️  MongoDB is required. Make sure it's running. You can:",
    colors.yellow,
  );
  log("   1. Start MongoDB locally (if installed)", colors.reset);
  log("   2. Run using Docker: ", colors.reset);
  log("      docker run -d --name mongodb -p 27017:27017 mongo:latest",
    colors.blue,
  );
  log("   3. Use a cloud MongoDB (update MONGO_URI in .env)", colors.reset);

  const shouldSeed = process.argv.includes("--seed");
  if (shouldSeed) {
    logSection("Database Seeding");
    log("\n🌱 Running database seeding...", colors.yellow);

    try {
      await runCommand("npm", ["run", "seed"], "Database seeding");
      log(
        "\n✅ Database seeded with sample data:",
        colors.green,
      );
      log(
        "   Super Admin: superadmin@medcare-et.com / Admin@12345",
        colors.reset,
      );
      log(
        "   Admin: admin@medcare-et.com / Admin@12345",
        colors.reset,
      );
      log(
        "   User: abel.user@medcare-et.com / User@12345",
        colors.reset,
      );
    } catch (err) {
      log(
        "⚠️  Seeding encountered an issue. You can retry with: npm run seed",
        colors.yellow,
      );
    }
  }

  logSection("Next Steps");

  log("\n1️⃣  Make sure MongoDB is running:", colors.blue);
  log(
    "   Check: Try 'mongo' or 'mongosh' in terminal to connect",
    colors.reset,
  );

  if (!shouldSeed) {
    log(
      "\n2️⃣  Seed the database (optional):",
      colors.blue,
    );
    log("   Run: npm run seed", colors.reset);
  } else {
    log("\n2️⃣  Database has been seeded", colors.green);
  }

  log("\n3️⃣  Start the development server:", colors.blue);
  log("   Run: npm run dev", colors.reset);
  log("   Or:  make dev", colors.reset);

  log("\n4️⃣  Test the API:", colors.blue);
  log("   Health: curl http://localhost:5000/health", colors.reset);
  log(
    "   Login: Use Postman collection to test endpoints",
    colors.reset,
  );

  logSection("Available Commands");

  log("\nnpm run dev          Start development server with hot reload", colors.reset);
  log("npm run build        Build TypeScript to JavaScript", colors.reset);
  log("npm test             Run test suite", colors.reset);
  log("npm run seed         Seed database", colors.reset);
  log("npm start            Run production build", colors.reset);
  log("make help            View all Makefile commands", colors.reset);

  logSection("Documentation");

  log("\n📖 See README.md for:", colors.blue);
  log("   - Detailed setup instructions", colors.reset);
  log("   - Troubleshooting guide", colors.reset);
  log("   - Project architecture", colors.reset);
  log("   - API testing examples", colors.reset);

  logSection("Support");

  log("\n💡 Common Issues:", colors.blue);
  log(
    "   MongoDB not running → Start with: docker run -d --name mongodb -p 27017:27017 mongo:latest",
    colors.reset,
  );
  log(
    "   Port 5000 in use → Change PORT in .env file",
    colors.reset,
  );
  log(
    "   Module errors → Ensure you're using .js extensions in imports",
    colors.reset,
  );

  log("\n✨ Setup complete! Ready to start developing.", colors.green);
  console.log("");
}

main().catch((err) => {
  log(`\n❌ Setup failed: ${err.message}`, colors.red);
  process.exit(1);
});
