import { Router } from "express";
import authRouter from "./auth";
import masterMenuRouter from "./master-menu";
import outletRouter from "./outlet";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "HQ outlet POS System is running" });
});

router.use(authRouter);
router.use(masterMenuRouter);
router.use(outletRouter);

export default router;
