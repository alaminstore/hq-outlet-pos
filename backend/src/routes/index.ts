import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "HQ outlet POS System is running" });
});

export default router;
