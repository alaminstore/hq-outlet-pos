import type { Request, Response } from "express";
import { getRevenueByOutlet } from "../services/report/revenue-by-outlet-service";
import { getTopFiveItemsByOutlet } from "../services/report/top-five-items-by-outlet-service";

export async function revenueByOutlet(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.min(50, Number(req.query.per_page) || 10);

  try {
    const result = await getRevenueByOutlet(page, perPage);

    return res.json({
      success: true,
      ...result,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch revenue report",
    });
  }
}

export async function topItemsByOutlet(req: Request, res: Response) {
  const outletId = Number(req.query.outlet_id);

  if (!outletId || outletId <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid Outlet ID is required",
    });
  }

  try {
    const items = await getTopFiveItemsByOutlet(outletId);

    return res.json({
      success: true,
      items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch top items for this outlet",
    });
  }
}
