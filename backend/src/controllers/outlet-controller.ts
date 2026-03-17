import type { Request, Response } from "express";
import { connectDB } from "../config/db-config";

type OutletRow = {
  id: number;
  name: string;
};

type OutletMenuConfigRow = {
  id: number;
  outlet_id: number;
  menu_item_id: number;
  outlet_price: string;
  stock_level: number;
  name: string;
  sku: string;
  base_price: string;
};

export async function list(req: Request, res: Response) {
  const rows = (await connectDB.query(
    `SELECT id, name FROM outlets ORDER BY id ASC`
  )) as OutletRow[];

  return res.json({ items: rows });
}

export async function listMenuConfigs(req: Request, res: Response) {
  const outletId = Number(req.params.outletId);
  if (!Number.isFinite(outletId) || outletId <= 0) {
    return res.status(400).json({ ok: false, message: "Invalid outlet id" });
  }

  const pageRaw = Number(req.query.page);
  const perPageRaw = Number(req.query.per_page);
  const page =
    Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const perPage =
    Number.isFinite(perPageRaw) && perPageRaw > 0
      ? Math.min(50, Math.floor(perPageRaw))
      : 5;

  const offset = (page - 1) * perPage;
  const items = (await connectDB.query(
    `SELECT c.id,
            c.outlet_id,
            c.menu_item_id,
            c.outlet_price,
            c.stock_level,
            m.name,
            m.sku,
            m.base_price
       FROM outlet_menu_configs c
       JOIN master_menu m ON m.id = c.menu_item_id
      WHERE c.outlet_id = $1
      ORDER BY c.id DESC
      LIMIT $2 OFFSET $3`,
    [outletId, perPage, offset]
  )) as OutletMenuConfigRow[];

  const countRows = (await connectDB.query(
    `SELECT COUNT(*)::int AS count
       FROM outlet_menu_configs
      WHERE outlet_id = $1`,
    [outletId]
  )) as { count: number }[];
  const total = Number(countRows[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return res.json({
    items,
    page,
    per_page: perPage,
    total,
    total_pages: totalPages,
  });
}

export async function createMenuConfig(req: Request, res: Response) {
  const outletId = Number(req.params.outletId);
  const menuItemId = Number(req.body?.menu_item_id);
  const outletPriceRaw = req.body?.outlet_price;
  const stockLevelRaw = req.body?.stock_level;
  const outletPriceValue =
    typeof outletPriceRaw === "string" ? Number(outletPriceRaw) : outletPriceRaw;
  const stockLevelValue =
    typeof stockLevelRaw === "string" ? Number(stockLevelRaw) : stockLevelRaw;

  if (!Number.isFinite(outletId) || outletId <= 0) {
    return res.status(400).json({ ok: false, message: "Invalid outlet id" });
  }

  if (!Number.isFinite(menuItemId) || menuItemId <= 0) {
    return res.status(400).json({ ok: false, message: "Invalid menu item" });
  }

  const baseRows = (await connectDB.query(
    `SELECT base_price FROM master_menu WHERE id = $1`,
    [menuItemId]
  )) as { base_price: string }[];

  if (!baseRows[0]) {
    return res.status(404).json({ ok: false, message: "Menu item not found" });
  }

  const basePrice = Number(baseRows[0].base_price);
  const outletPrice = Number.isFinite(outletPriceValue)
    ? outletPriceValue
    : basePrice;
  const stockLevel = Number.isFinite(stockLevelValue)
    ? stockLevelValue
    : 0;

  if (outletPrice < 0) {
    return res.status(400).json({ ok: false, message: "Invalid outlet price" });
  }
  if (!Number.isInteger(stockLevel) || stockLevel < 0) {
    return res.status(400).json({ ok: false, message: "Invalid stock level" });
  }

  try {
    const insertRows = (await connectDB.query(
      `INSERT INTO outlet_menu_configs (outlet_id, menu_item_id, outlet_price, stock_level)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [outletId, menuItemId, outletPrice, stockLevel]
    )) as { id: number }[];

    const itemRows = (await connectDB.query(
      `SELECT c.id,
              c.outlet_id,
              c.menu_item_id,
              c.outlet_price,
              c.stock_level,
              m.name,
              m.sku,
              m.base_price
         FROM outlet_menu_configs c
         JOIN master_menu m ON m.id = c.menu_item_id
        WHERE c.id = $1`,
      [insertRows[0].id]
    )) as OutletMenuConfigRow[];

    return res.status(201).json({ ok: true, item: itemRows[0] });
  } catch (error: any) {
    if (error?.code === "23505") {
      return res
        .status(409)
        .json({ ok: false, message: "Item already assigned" });
    }
    throw error;
  }
}

export async function createMenuConfigsBatch(req: Request, res: Response) {
  const outletId = Number(req.params.outletId);
  const updates = Array.isArray(req.body?.updates) ? req.body.updates : null;

  if (!Number.isFinite(outletId) || outletId <= 0) {
    return res.status(400).json({ ok: false, message: "Invalid outlet id" });
  }
  if (!updates || updates.length === 0) {
    return res.status(400).json({ ok: false, message: "No updates provided" });
  }

  await connectDB.query("BEGIN");
  try {
    for (const update of updates) {
      const menuItemId = Number(update?.menu_item_id);
      const outletPriceRaw = update?.outlet_price;
      const stockLevelRaw = update?.stock_level;
      const outletPriceValue =
        typeof outletPriceRaw === "string"
          ? Number(outletPriceRaw)
          : outletPriceRaw;
      const stockLevelValue =
        typeof stockLevelRaw === "string"
          ? Number(stockLevelRaw)
          : stockLevelRaw;

      if (!Number.isFinite(menuItemId) || menuItemId <= 0) {
        throw new Error("Invalid menu item");
      }

      const baseRows = (await connectDB.query(
        `SELECT base_price FROM master_menu WHERE id = $1`,
        [menuItemId]
      )) as { base_price: string }[];

      if (!baseRows[0]) {
        throw new Error("Menu item not found");
      }

      const basePrice = Number(baseRows[0].base_price);
      const outletPrice = Number.isFinite(outletPriceValue)
        ? outletPriceValue
        : basePrice;
      const stockLevel = Number.isFinite(stockLevelValue)
        ? stockLevelValue
        : 0;

      if (outletPrice < 0) {
        throw new Error("Invalid outlet price");
      }
      if (!Number.isInteger(stockLevel) || stockLevel < 0) {
        throw new Error("Invalid stock level");
      }

      await connectDB.query(
        `INSERT INTO outlet_menu_configs (outlet_id, menu_item_id, outlet_price, stock_level)
         VALUES ($1, $2, $3, $4)`,
        [outletId, menuItemId, outletPrice, stockLevel]
      );
    }

    await connectDB.query("COMMIT");
  } catch (error: any) {
    await connectDB.query("ROLLBACK");
    if (error?.code === "23505") {
      return res
        .status(409)
        .json({ ok: false, message: "Item already assigned" });
    }
    return res
      .status(400)
      .json({ ok: false, message: error?.message ?? "Invalid request" });
  }

  const items = (await connectDB.query(
    `SELECT c.id,
            c.outlet_id,
            c.menu_item_id,
            c.outlet_price,
            c.stock_level,
            m.name,
            m.sku,
            m.base_price
       FROM outlet_menu_configs c
       JOIN master_menu m ON m.id = c.menu_item_id
      WHERE c.outlet_id = $1
      ORDER BY c.id DESC`,
    [outletId]
  )) as OutletMenuConfigRow[];

  return res.status(201).json({ ok: true, items });
}

export async function updateMenuConfig(req: Request, res: Response) {
  const outletId = Number(req.params.outletId);
  const configId = Number(req.params.configId);
  const outletPriceRaw = req.body?.outlet_price;
  const stockLevelRaw = req.body?.stock_level;
  const outletPriceValue =
    typeof outletPriceRaw === "string" ? Number(outletPriceRaw) : outletPriceRaw;
  const stockLevelValue =
    typeof stockLevelRaw === "string" ? Number(stockLevelRaw) : stockLevelRaw;

  if (!Number.isFinite(outletId) || outletId <= 0) {
    return res.status(400).json({ ok: false, message: "Invalid outlet id" });
  }
  if (!Number.isFinite(configId) || configId <= 0) {
    return res.status(400).json({ ok: false, message: "Invalid config id" });
  }
  if (!Number.isFinite(outletPriceValue) || outletPriceValue < 0) {
    return res.status(400).json({ ok: false, message: "Invalid outlet price" });
  }
  if (
    !Number.isFinite(stockLevelValue) ||
    stockLevelValue < 0 ||
    !Number.isInteger(stockLevelValue)
  ) {
    return res.status(400).json({ ok: false, message: "Invalid stock level" });
  }

  const rows = (await connectDB.query(
    `UPDATE outlet_menu_configs
        SET outlet_price = $1,
            stock_level = $2
      WHERE id = $3 AND outlet_id = $4
      RETURNING id`,
    [outletPriceValue, stockLevelValue, configId, outletId]
  )) as { id: number }[];

  if (rows.length === 0) {
    return res.status(404).json({ ok: false, message: "Config not found" });
  }

  const itemRows = (await connectDB.query(
    `SELECT c.id,
            c.outlet_id,
            c.menu_item_id,
            c.outlet_price,
            c.stock_level,
            m.name,
            m.sku,
            m.base_price
       FROM outlet_menu_configs c
       JOIN master_menu m ON m.id = c.menu_item_id
      WHERE c.id = $1`,
    [configId]
  )) as OutletMenuConfigRow[];

  return res.json({ ok: true, item: itemRows[0] });
}

export async function updateMenuConfigsBatch(req: Request, res: Response) {
  const outletId = Number(req.params.outletId);
  const updates = Array.isArray(req.body?.updates) ? req.body.updates : null;

  if (!Number.isFinite(outletId) || outletId <= 0) {
    return res.status(400).json({ ok: false, message: "Invalid outlet id" });
  }
  if (!updates || updates.length === 0) {
    return res.status(400).json({ ok: false, message: "No updates provided" });
  }

  for (const update of updates) {
    const configId = Number(update?.config_id);
    const outletPriceValue =
      typeof update?.outlet_price === "string"
        ? Number(update.outlet_price)
        : update?.outlet_price;
    const stockLevelValue =
      typeof update?.stock_level === "string"
        ? Number(update.stock_level)
        : update?.stock_level;

    if (!Number.isFinite(configId) || configId <= 0) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid config id" });
    }
    if (!Number.isFinite(outletPriceValue) || outletPriceValue < 0) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid outlet price" });
    }
    if (
      !Number.isFinite(stockLevelValue) ||
      stockLevelValue < 0 ||
      !Number.isInteger(stockLevelValue)
    ) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid stock level" });
    }
  }

  await connectDB.query("BEGIN");
  try {
    for (const update of updates) {
      const configId = Number(update.config_id);
      const outletPriceValue =
        typeof update.outlet_price === "string"
          ? Number(update.outlet_price)
          : update.outlet_price;
      const stockLevelValue =
        typeof update.stock_level === "string"
          ? Number(update.stock_level)
          : update.stock_level;

      await connectDB.query(
        `UPDATE outlet_menu_configs
            SET outlet_price = $1,
                stock_level = $2
          WHERE id = $3 AND outlet_id = $4`,
        [outletPriceValue, stockLevelValue, configId, outletId]
      );
    }

    await connectDB.query("COMMIT");
  } catch (error) {
    await connectDB.query("ROLLBACK");
    throw error;
  }

  const updatedRows = (await connectDB.query(
    `SELECT c.id,
            c.outlet_id,
            c.menu_item_id,
            c.outlet_price,
            c.stock_level,
            m.name,
            m.sku,
            m.base_price
       FROM outlet_menu_configs c
       JOIN master_menu m ON m.id = c.menu_item_id
      WHERE c.outlet_id = $1
      ORDER BY c.id DESC`,
    [outletId]
  )) as OutletMenuConfigRow[];

  return res.json({ ok: true, items: updatedRows });
}
