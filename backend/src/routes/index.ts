import { Router } from "express";
import authRouter from "./auth";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "HQ outlet POS System is running" });
});

router.use(authRouter);

export default router;
