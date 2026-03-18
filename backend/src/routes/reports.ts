import { Router } from "express";
import {
  revenueByOutlet,
  topItemsByOutlet,
} from "../controllers/report-controller";

const router = Router();

router.get("/reports/revenue-by-outlet", revenueByOutlet);
router.get("/reports/top-items", topItemsByOutlet);

export default router;
