import { Router } from "express";
import {
  createMenuConfigsBatch,
  createMenuConfig,
  list,
  listMenuConfigs,
  updateMenuConfigsBatch,
  updateMenuConfig,
} from "../controllers/outlet-controller";

const router = Router();

router.get("/outlets", list);
router.get("/outlets/:outletId/menu-configs", listMenuConfigs);
router.post("/outlets/:outletId/menu-configs", createMenuConfig);
router.post("/outlets/:outletId/menu-configs/batch", createMenuConfigsBatch);
router.put("/outlets/:outletId/menu-configs/:configId", updateMenuConfig);
router.put("/outlets/:outletId/menu-configs", updateMenuConfigsBatch);

export default router;
