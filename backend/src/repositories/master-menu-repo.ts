import { connectDB } from "../config/db-config";

export type MasterMenuRow = {
  id: number;
  name: string;
  base_price: string;
  sku: string;
};

type MasterMenuListResult = {
  items: MasterMenuRow[];
  total: number;
};

const generateSku = (name: string): string => {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const salt = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${slug}-${salt}`;
};

export async function getMasterMenu(
  page: number,
  perPage: number,
): Promise<MasterMenuListResult> {
  const offset = (page - 1) * perPage;
  const items = (await connectDB.query(
    `SELECT id, name, base_price, sku
       FROM master_menu
      ORDER BY id DESC
      LIMIT $1 OFFSET $2`,
    [perPage, offset],
  )) as MasterMenuRow[];

  const countRows = (await connectDB.query(
    `SELECT COUNT(*)::int AS count FROM master_menu`,
  )) as { count: number }[];
  const total = Number(countRows[0]?.count ?? 0);

  return { items, total };
}

export async function createMasterMenuItem(
  name: string,
  basePrice: number,
): Promise<MasterMenuRow> {
  const trimmedName = name.trim();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const sku = generateSku(trimmedName);
    try {
      const rows = (await connectDB.query(
        `INSERT INTO master_menu (name, base_price, sku)
         VALUES ($1, $2, $3)
         RETURNING id, name, base_price, sku`,
        [trimmedName, basePrice, sku],
      )) as MasterMenuRow[];

      if (rows[0]) return rows[0];
    } catch (error: any) {
      if (error?.code === "23505") continue;
      throw error;
    }
  }

  throw new Error("Unable to generate a unique SKU");
}
