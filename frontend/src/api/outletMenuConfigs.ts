import axios from "axios";
import apiBaseUrl from "../utils/apiBaseUrl";

export type OutletMenuConfigItem = {
  id: number;
  outlet_id: number;
  menu_item_id: number;
  outlet_price: string;
  stock_level: number;
  name: string;
  sku: string;
  base_price: string;
};

export type OutletMenuConfigPage = {
  items: OutletMenuConfigItem[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

export async function fetchOutletMenuConfigs(
  outletId: number,
  page: number,
  perPage: number
): Promise<OutletMenuConfigPage> {
  const response = await axios.get<OutletMenuConfigPage>(
    `${apiBaseUrl}/api/outlets/${outletId}/menu-configs`,
    { params: { page, per_page: perPage } }
  );
  return response.data;
}

export async function fetchAllOutletMenuConfigs(
  outletId: number
): Promise<OutletMenuConfigItem[]> {
  const firstPage = await fetchOutletMenuConfigs(outletId, 1, 50);
  const items = [...firstPage.items];

  for (let page = firstPage.page + 1; page <= firstPage.total_pages; page += 1) {
    const nextPage = await fetchOutletMenuConfigs(outletId, page, firstPage.per_page);
    items.push(...nextPage.items);
  }

  return items;
}

export async function createOutletMenuConfig(
  outletId: number,
  menuItemId: number,
  outletPrice?: number,
  stockLevel?: number
) {
  const response = await axios.post<{ ok: boolean; item: OutletMenuConfigItem }>(
    `${apiBaseUrl}/api/outlets/${outletId}/menu-configs`,
    {
      menu_item_id: menuItemId,
      outlet_price: outletPrice,
      stock_level: stockLevel,
    }
  );
  return response.data.item;
}

export async function createOutletMenuConfigsBatch(
  outletId: number,
  updates: Array<{
    menu_item_id: number;
    outlet_price?: number;
    stock_level?: number;
  }>
) {
  const response = await axios.post<{ ok: boolean; items: OutletMenuConfigItem[] }>(
    `${apiBaseUrl}/api/outlets/${outletId}/menu-configs/batch`,
    { updates }
  );
  return response.data.items;
}

export async function updateOutletMenuConfig(
  outletId: number,
  configId: number,
  outletPrice: number,
  stockLevel: number
) {
  const response = await axios.put<{ ok: boolean; item: OutletMenuConfigItem }>(
    `${apiBaseUrl}/api/outlets/${outletId}/menu-configs/${configId}`,
    {
      outlet_price: outletPrice,
      stock_level: stockLevel,
    }
  );
  return response.data.item;
}

export async function updateOutletMenuConfigsBatch(
  outletId: number,
  updates: Array<{
    config_id: number;
    outlet_price: number;
    stock_level: number;
  }>
) {
  const response = await axios.put<{ ok: boolean; items: OutletMenuConfigItem[] }>(
    `${apiBaseUrl}/api/outlets/${outletId}/menu-configs`,
    { updates }
  );
  return response.data.items;
}
