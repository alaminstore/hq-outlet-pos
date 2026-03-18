import { connectDB } from "../../config/db-config";

export type TopItemRow = {
  menu_item_id: number;
  item_name: string;
  sku: string;
  total_quantity: string;
  total_revenue: string;
};

export async function getTopFiveItemsByOutlet(outletId: number) {
  const rows = (await connectDB.query(
    `SELECT m.id AS menu_item_id,
            m.name AS item_name,
            m.sku AS sku,
            SUM(si.quantity)::int AS total_quantity,
            COALESCE(SUM(si.quantity * si.unit_price), 0) AS total_revenue
       FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       JOIN master_menu m ON m.id = si.menu_item_id
      WHERE s.outlet_id = $1
      GROUP BY m.id, m.name, m.sku
      ORDER BY total_quantity DESC, total_revenue DESC
      LIMIT 5`,
    [outletId],
  )) as TopItemRow[];

  return rows;
}
