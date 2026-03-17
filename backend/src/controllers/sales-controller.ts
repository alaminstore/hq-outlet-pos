import type { Request, Response } from "express";
import { createSaleService } from "../services/sales-service";

export async function createSale(req: Request, res: Response) {
  const outletId = parseInt(req.params.outletId);
  const { items } = req.body;

  if (!outletId || outletId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Valid Outlet ID is required" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "At least one sale item is required" });
  }

  try {
    const validatedItems = items.map((item) => ({
      menu_item_id: Number(item.menu_item_id),
      quantity: Math.floor(Number(item.quantity)),
    }));

    const sale = await createSaleService(outletId, validatedItems);

    return res.status(201).json({
      success: true,
      sale,
    });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.status
      ? error.message
      : "An unexpected error occurred";

    return res.status(status).json({
      success: false,
      message,
    });
  }
}
