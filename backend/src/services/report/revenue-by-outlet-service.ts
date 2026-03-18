import { connectDB } from "../../config/db-config";

export type RevenueByOutletRow = {
  outlet_id: number;
  outlet_name: string;
  total_revenue: string;
};

export type RevenueByOutletResult = {
  data: RevenueByOutletRow[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};

export async function getRevenueByOutlet(
  page: number,
  perPage: number,
): Promise<RevenueByOutletResult> {
  const offset = (page - 1) * perPage;

  const outletCountResult = (await connectDB.query(
    `SELECT COUNT(*)::int AS count FROM outlets`,
  )) as { count: number }[];
  const totalOutlets = Number(outletCountResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalOutlets / perPage));

  const revenueRows = (await connectDB.query(
    `SELECT
        o.id AS outlet_id,
        o.name AS outlet_name,
        COALESCE(SUM(s.total_amount), 0) AS total_revenue
      FROM outlets o
      LEFT JOIN sales s ON s.outlet_id = o.id
      GROUP BY o.id, o.name
      ORDER BY o.name ASC
      LIMIT $1 OFFSET $2`,
    [perPage, offset],
  )) as RevenueByOutletRow[];

  return {
    data: revenueRows,
    pagination: {
      page,
      per_page: perPage,
      total: totalOutlets,
      total_pages: totalPages,
    },
  };
}
