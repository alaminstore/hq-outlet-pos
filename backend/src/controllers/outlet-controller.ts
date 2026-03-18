import type { Request, Response } from "express";
import { ServiceError } from "../errors/service-error";
import {
  createMenuConfigService,
  createMenuConfigsBatchService,
  listOutletMenuConfigsService,
  listOutletsService,
  updateMenuConfigService,
  updateMenuConfigsBatchService,
} from "../services/outlet-service";

export async function list(_req: Request, res: Response) {
  const rows = await listOutletsService();
  return res.json({ items: rows });
}

export async function listMenuConfigs(req: Request, res: Response) {
  try {
    const result = await listOutletMenuConfigsService(
      Number(req.params.outletId),
      {
        page: Number(req.query.page),
        perPage: Number(req.query.per_page),
      },
    );

    return res.json(result);
  } catch (error) {
    return handleServiceError(error, res);
  }
}

export async function createMenuConfig(req: Request, res: Response) {
  try {
    const result = await createMenuConfigService({
      outletId: Number(req.params.outletId),
      menuItemId: Number(req.body?.menu_item_id),
      outletPrice:
        typeof req.body?.outlet_price === "string"
          ? Number(req.body.outlet_price)
          : req.body?.outlet_price,
      stockLevel:
        typeof req.body?.stock_level === "string"
          ? Number(req.body.stock_level)
          : req.body?.stock_level,
    });

    return res.status(201).json(result);
  } catch (error) {
    return handleServiceError(error, res);
  }
}

export async function createMenuConfigsBatch(req: Request, res: Response) {
  try {
    const result = await createMenuConfigsBatchService({
      outletId: Number(req.params.outletId),
      updates: Array.isArray(req.body?.updates) ? req.body.updates : [],
    });

    return res.status(201).json(result);
  } catch (error) {
    return handleServiceError(error, res);
  }
}

export async function updateMenuConfig(req: Request, res: Response) {
  try {
    const result = await updateMenuConfigService({
      outletId: Number(req.params.outletId),
      configId: Number(req.params.configId),
      outletPrice:
        typeof req.body?.outlet_price === "string"
          ? Number(req.body.outlet_price)
          : req.body?.outlet_price,
      stockLevel:
        typeof req.body?.stock_level === "string"
          ? Number(req.body.stock_level)
          : req.body?.stock_level,
    });

    return res.json(result);
  } catch (error) {
    return handleServiceError(error, res);
  }
}

export async function updateMenuConfigsBatch(req: Request, res: Response) {
  try {
    const result = await updateMenuConfigsBatchService({
      outletId: Number(req.params.outletId),
      updates: Array.isArray(req.body?.updates) ? req.body.updates : [],
    });

    return res.json(result);
  } catch (error) {
    return handleServiceError(error, res);
  }
}

function handleServiceError(error: unknown, res: Response) {
  if (error instanceof ServiceError) {
    return res.status(error.status).json({ ok: false, message: error.message });
  }

  throw error;
}
