import express from "express";
import cors from "cors";

import router from "./routes/routes.js";

import { clientUrls } from "./core/config/db.js";

import notFound from "./core/middlewares/notFound.js";
import errorHandler from "./core/middlewares/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (clientUrls.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", router);

app.use(notFound);

app.use(errorHandler);

export default app;