import { connectDB } from "../config/db-config";

export type SaleItemInput = {
  menu_item_id: number;
  quantity: number;
};

type ConfigRow = {
  menu_item_id: number;
  stock_level: number;
  outlet_price: string;
};

type SaleRow = {
  id: number;
  receipt_number: number;
  total_amount: string;
  created_at: string;
};

export class ServiceError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function createSaleService(
  outletId: number,
  items: SaleItemInput[],
) {
  const menuItemIds = buildMenuItemIds(items);

  await connectDB.query("BEGIN");
  try {
    await lockOutlet(outletId);

    const configRows = await loadConfigRows(outletId, menuItemIds);
    const configMap = validateItemsAvailability(items, menuItemIds, configRows);

    const nextReceipt = await getNextReceiptNumber(outletId);
    const totalAmount = calculateTotalAmount(items, configMap);

    const sale = await insertSale(outletId, nextReceipt, totalAmount);
    await insertSaleItemsAndUpdateStock(sale.id, outletId, items, configMap);

    await connectDB.query("COMMIT");
    return sale;
  } catch (error) {
    await connectDB.query("ROLLBACK");
    throw error;
  }
}

function buildMenuItemIds(items: SaleItemInput[]) {
  return Array.from(new Set(items.map((item) => item.menu_item_id)));
}

async function lockOutlet(outletId: number) {
  const outletRows = (await connectDB.query(
    `SELECT id FROM outlets WHERE id = $1 FOR UPDATE`,
    [outletId],
  )) as { id: number }[];

  if (!outletRows[0]) {
    throw new ServiceError(404, "Outlet not found");
  }
}

async function loadConfigRows(outletId: number, menuItemIds: number[]) {
  return (await connectDB.query(
    `SELECT menu_item_id, stock_level, outlet_price
       FROM outlet_menu_configs
      WHERE outlet_id = $1 AND menu_item_id = ANY($2::int[])
      FOR UPDATE`,
    [outletId, menuItemIds],
  )) as ConfigRow[];
}

function buildConfigMap(configRows: ConfigRow[]) {
  return new Map(configRows.map((row) => [row.menu_item_id, row]));
}

function validateItemsAvailability(
  items: SaleItemInput[],
  menuItemIds: number[],
  configRows: ConfigRow[],
) {
  if (configRows.length !== menuItemIds.length) {
    throw new ServiceError(404, "One or more items not assigned");
  }

  const configMap = buildConfigMap(configRows);
  for (const item of items) {
    const config = configMap.get(item.menu_item_id);
    if (!config) {
      throw new ServiceError(404, "Item not assigned");
    }
    if (config.stock_level < item.quantity) {
      throw new ServiceError(409, "Insufficient stock for one or more items");
    }
  }

  return configMap;
}

async function getNextReceiptNumber(outletId: number) {
  const lastReceiptRows = (await connectDB.query(
    `SELECT receipt_number
       FROM sales
      WHERE outlet_id = $1
      ORDER BY receipt_number DESC
      LIMIT 1`,
    [outletId],
  )) as { receipt_number: number }[];
  const lastReceipt = Number(lastReceiptRows[0]?.receipt_number ?? 0);
  return lastReceipt + 1;
}

function calculateTotalAmount(
  items: SaleItemInput[],
  configMap: Map<number, ConfigRow>,
) {
  let totalCents = 0;
  for (const item of items) {
    const config = configMap.get(item.menu_item_id)!;
    const unitCents = Math.round(Number(config.outlet_price) * 100);
    totalCents += unitCents * item.quantity;
  }

  return (totalCents / 100).toFixed(2);
}

async function insertSale(
  outletId: number,
  receiptNumber: number,
  totalAmount: string,
) {
  const saleRows = (await connectDB.query(
    `INSERT INTO sales (outlet_id, receipt_number, total_amount)
     VALUES ($1, $2, $3)
     RETURNING id, receipt_number, total_amount, created_at`,
    [outletId, receiptNumber, totalAmount],
  )) as SaleRow[];

  return saleRows[0];
}

async function insertSaleItemsAndUpdateStock(
  saleId: number,
  outletId: number,
  items: SaleItemInput[],
  configMap: Map<number, ConfigRow>,
) {
  for (const item of items) {
    const config = configMap.get(item.menu_item_id)!;

    await connectDB.query(
      `INSERT INTO sale_items (sale_id, menu_item_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)`,
      [saleId, item.menu_item_id, item.quantity, config.outlet_price],
    );

    await connectDB.query(
      `UPDATE outlet_menu_configs
          SET stock_level = stock_level - $1
        WHERE outlet_id = $2 AND menu_item_id = $3`,
      [item.quantity, outletId, item.menu_item_id],
    );
  }
}
