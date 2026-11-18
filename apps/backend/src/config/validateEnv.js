/**
 * Environment Variable Validation Module
 * Verifies required production environment variables before server startup.
 */

const REQUIRED_ENV_VARS = [
  "PORT",
  "NODE_ENV",
  "DATABASE_URL",
  "JWT_SECRET"
];

export function validateEnvironment() {
  const missing = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ CRITICAL: Missing required environment variables: ${missing.join(", ")}`);
    console.error("Please configure these variables in your .env file or server environment.");
    process.exit(1);
  }

  console.log("✅ Environment variable validation passed cleanly.");
}

