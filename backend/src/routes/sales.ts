import { Router } from "express";
import { createSale } from "../controllers/sales-controller";

const router = Router();

router.post("/outlets/:outletId/sales", createSale);

export default router;
