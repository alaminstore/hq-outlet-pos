import type { Request, Response } from "express";
import {
  createMasterMenuItem,
  listMasterMenu,
} from "../repositories/master-menu-repo";

interface CreateMenuRequest {
  name?: string;
  base_price?: string | number;
}

export const masterMenu = async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.per_page) || 5, 50);
  const page = Math.max(Number(req.query.page) || 1, 1);

  try {
    const { items, total } = await listMasterMenu(page, limit);

    return res.json({
      data: items,
      pagination: {
        totalRecords: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch menu items" });
  }
};

export const createMasterMenu = async (req: Request, res: Response) => {
  const { name, base_price } = req.body as CreateMenuRequest;

  const price =
    typeof base_price === "string" ? parseFloat(base_price) : base_price;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: "Menu name is required" });
  }

  if (price === undefined || isNaN(price) || price < 0) {
    return res.status(400).json({ error: "A valid base price is required" });
  }

  try {
    const newMasterMenu = await createMasterMenuItem(name.trim(), price);
    return res.status(201).json({
      success: true,
      data: newMasterMenu,
    });
  } catch (err) {
    console.error("[CreateMasterMenu]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
