import axios from "axios";
import apiBaseUrl from "../utils/apiBaseUrl";

export type RevenueByOutletItem = {
  outlet_id: number;
  outlet_name: string;
  total_revenue: string;
};

export type RevenueByOutletResponse = {
  success: boolean;
  data: RevenueByOutletItem[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};

export type TopItemByOutletItem = {
  menu_item_id: number;
  item_name: string;
  sku: string;
  total_quantity: number;
  total_revenue: string;
};

export type TopItemsByOutletResponse = {
  success: boolean;
  items: TopItemByOutletItem[];
};

export async function fetchRevenueByOutlet(
  page = 1,
  perPage = 10,
): Promise<RevenueByOutletResponse> {
  const response = await axios.get<RevenueByOutletResponse>(
    `${apiBaseUrl}/api/reports/revenue-by-outlet`,
    { params: { page, per_page: perPage } },
  );

  return response.data;
}

export async function fetchTopItemsByOutlet(
  outletId: number,
): Promise<TopItemsByOutletResponse> {
  const response = await axios.get<TopItemsByOutletResponse>(
    `${apiBaseUrl}/api/reports/top-items`,
    { params: { outlet_id: outletId } },
  );

  return response.data;
}
