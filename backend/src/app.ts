import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes/index";
import { errorHandler } from "./middleware/error";

export function createApp() {
  dotenv.config();
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/api", router);

  app.use(errorHandler);

  return app;
}
