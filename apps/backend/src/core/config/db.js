import dotenv from "dotenv";

dotenv.config();

export const port = process.env.PORT || 5000;

export const clientUrls = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map((url) => url.trim())
  :[
  "http://localhost:5173",
  "http://localhost:5174",
  "https://your-frontend.vercel.app"
];

export const databaseUrl = process.env.DATABASE_URL;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export const jwtSecret = process.env.JWT_SECRET;
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";