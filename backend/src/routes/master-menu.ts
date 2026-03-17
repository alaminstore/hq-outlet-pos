import { Router } from "express";
import { createMasterMenu, masterMenu } from "../controllers/master-menu-controller";

const router = Router();

router.get("/master-menu", masterMenu);
router.post("/master-menu", createMasterMenu);

export default router;
