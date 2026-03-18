import { connectDB } from "../config/db-config";
import { ServiceError } from "../errors/service-error";
import type {
  BatchCreateMenuConfigInput,
  BatchUpdateMenuConfigInput,
  CountRow,
  CreateMenuConfigInput,
  InsertedConfigRow,
  MenuDefaultsRow,
  OutletMenuConfigRow,
  OutletRow,
  PaginationInput,
  UpdateMenuConfigInput,
} from "./types/outlet-service.types";

export async function listOutletsService() {
  return (await connectDB.query(
    `SELECT id, outlet_code AS "outletCode", name
       FROM outlets
      ORDER BY id DESC`,
  )) as OutletRow[];
}

export async function listOutletMenuConfigsService(
  outletId: number,
  pagination: PaginationInput,
) {
  validateOutletId(outletId);

  const { page, perPage } = parsePagination(pagination);
  const offset = (page - 1) * perPage;

  const items = await fetchOutletMenuConfigs(outletId, perPage, offset);
  const countRows = (await connectDB.query(
    `SELECT COUNT(*)::int AS count
       FROM outlet_menu_configs
      WHERE outlet_id = $1`,
    [outletId],
  )) as CountRow[];
  const total = Number(countRows[0]?.count ?? 0);

  return {
    items,
    page,
    per_page: perPage,
    total,
    total_pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function createMenuConfigService(input: CreateMenuConfigInput) {
  validateOutletId(input.outletId);
  validateMenuItemId(input.menuItemId);

  const resolved = await resolveMenuConfigValues(
    input.menuItemId,
    input.outletPrice,
    input.stockLevel,
  );

  try {
    const insertRows = (await connectDB.query(
      `INSERT INTO outlet_menu_configs (outlet_id, menu_item_id, outlet_price, stock_level)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        input.outletId,
        input.menuItemId,
        resolved.outletPrice,
        resolved.stockLevel,
      ],
    )) as InsertedConfigRow[];

    const item = await fetchOutletMenuConfigById(insertRows[0].id);
    return { ok: true, item };
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ServiceError(409, "Item already assigned");
    }
    throw error;
  }
}

export async function createMenuConfigsBatchService(
  input: BatchCreateMenuConfigInput,
) {
  validateOutletId(input.outletId);
  if (!input.updates.length) {
    throw new ServiceError(400, "No updates provided");
  }

  await connectDB.query("BEGIN");
  try {
    for (const update of input.updates) {
      const menuItemId = Number(update.menu_item_id);
      validateMenuItemId(menuItemId);

      const resolved = await resolveMenuConfigValues(
        menuItemId,
        toNumber(update.outlet_price),
        toNumber(update.stock_level),
      );

      await connectDB.query(
        `INSERT INTO outlet_menu_configs (outlet_id, menu_item_id, outlet_price, stock_level)
         VALUES ($1, $2, $3, $4)`,
        [input.outletId, menuItemId, resolved.outletPrice, resolved.stockLevel],
      );
    }

    await connectDB.query("COMMIT");
  } catch (error: any) {
    await connectDB.query("ROLLBACK");
    if (error?.code === "23505") {
      throw new ServiceError(409, "Item already assigned");
    }
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(400, error?.message ?? "Invalid request");
  }

  const items = await fetchAllOutletMenuConfigs(input.outletId);
  return { ok: true, items };
}

export async function updateMenuConfigService(input: UpdateMenuConfigInput) {
  validateOutletId(input.outletId);
  validateConfigId(input.configId);
  validateOutletPrice(input.outletPrice);
  validateStockLevel(input.stockLevel);

  const rows = (await connectDB.query(
    `UPDATE outlet_menu_configs
        SET outlet_price = $1,
            stock_level = $2
      WHERE id = $3 AND outlet_id = $4
      RETURNING id`,
    [input.outletPrice, input.stockLevel, input.configId, input.outletId],
  )) as InsertedConfigRow[];

  if (!rows.length) {
    throw new ServiceError(404, "Config not found");
  }

  const item = await fetchOutletMenuConfigById(input.configId);
  return { ok: true, item };
}

export async function updateMenuConfigsBatchService(
  input: BatchUpdateMenuConfigInput,
) {
  validateOutletId(input.outletId);
  if (!input.updates.length) {
    throw new ServiceError(400, "No updates provided");
  }

  const normalizedUpdates = input.updates.map((update) => {
    const configId = Number(update.config_id);
    const outletPrice = toNumber(update.outlet_price);
    const stockLevel = toNumber(update.stock_level);

    validateConfigId(configId);
    validateOutletPrice(outletPrice);
    validateStockLevel(stockLevel);

    return {
      configId,
      outletPrice,
      stockLevel,
    };
  });

  await connectDB.query("BEGIN");
  try {
    for (const update of normalizedUpdates) {
      await connectDB.query(
        `UPDATE outlet_menu_configs
            SET outlet_price = $1,
                stock_level = $2
          WHERE id = $3 AND outlet_id = $4`,
        [
          update.outletPrice,
          update.stockLevel,
          update.configId,
          input.outletId,
        ],
      );
    }

    await connectDB.query("COMMIT");
  } catch (error) {
    await connectDB.query("ROLLBACK");
    throw error;
  }

  const items = await fetchAllOutletMenuConfigs(input.outletId);
  return { ok: true, items };
}

function parsePagination(pagination: PaginationInput) {
  const page =
    Number.isFinite(pagination.page) && Number(pagination.page) > 0
      ? Math.floor(Number(pagination.page))
      : 1;
  const perPage =
    Number.isFinite(pagination.perPage) && Number(pagination.perPage) > 0
      ? Math.min(50, Math.floor(Number(pagination.perPage)))
      : 5;

  return { page, perPage };
}

async function fetchOutletMenuConfigs(
  outletId: number,
  limit: number,
  offset: number,
) {
  return (await connectDB.query(
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
    [outletId, limit, offset],
  )) as OutletMenuConfigRow[];
}

async function fetchAllOutletMenuConfigs(outletId: number) {
  return (await connectDB.query(
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
    [outletId],
  )) as OutletMenuConfigRow[];
}

async function fetchOutletMenuConfigById(configId: number) {
  const rows = (await connectDB.query(
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
    [configId],
  )) as OutletMenuConfigRow[];

  return rows[0];
}

async function resolveMenuConfigValues(
  menuItemId: number,
  outletPrice?: number,
  stockLevel?: number,
) {
  const baseRows = (await connectDB.query(
    `SELECT base_price FROM master_menu WHERE id = $1`,
    [menuItemId],
  )) as MenuDefaultsRow[];

  if (!baseRows[0]) {
    throw new ServiceError(404, "Menu item not found");
  }

  const basePrice = Number(baseRows[0].base_price);
  const resolvedOutletPrice =
    Number.isFinite(outletPrice) && outletPrice !== undefined
      ? outletPrice
      : basePrice;
  const resolvedStockLevel =
    Number.isFinite(stockLevel) && stockLevel !== undefined ? stockLevel : 0;

  validateOutletPrice(resolvedOutletPrice);
  validateStockLevel(resolvedStockLevel);

  return {
    outletPrice: resolvedOutletPrice,
    stockLevel: resolvedStockLevel,
  };
}

function validateOutletId(outletId: number) {
  if (!Number.isFinite(outletId) || outletId <= 0) {
    throw new ServiceError(400, "Invalid outlet id");
  }
}

function validateMenuItemId(menuItemId: number) {
  if (!Number.isFinite(menuItemId) || menuItemId <= 0) {
    throw new ServiceError(400, "Invalid menu item");
  }
}

function validateConfigId(configId: number) {
  if (!Number.isFinite(configId) || configId <= 0) {
    throw new ServiceError(400, "Invalid config id");
  }
}

function validateOutletPrice(outletPrice?: number) {
  if (!Number.isFinite(outletPrice) || Number(outletPrice) < 0) {
    throw new ServiceError(400, "Invalid outlet price");
  }
}

function validateStockLevel(stockLevel?: number) {
  if (
    !Number.isFinite(stockLevel) ||
    Number(stockLevel) < 0 ||
    !Number.isInteger(stockLevel)
  ) {
    throw new ServiceError(400, "Invalid stock level");
  }
}

function toNumber(value: unknown) {
  return typeof value === "string" ? Number(value) : (value as number);
}
