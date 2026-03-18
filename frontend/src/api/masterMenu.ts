import axios from "axios";
import apiBaseUrl from "../utils/apiBaseUrl";

type MasterMenuApiItem = {
  id: number;
  name: string;
  base_price: string;
  sku: string;
};

export type MasterMenuItem = {
  id: number;
  name: string;
  basePrice: number;
  sku: string;
};

export type MasterMenuPage = {
  items: MasterMenuItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

function mapItem(item: MasterMenuApiItem): MasterMenuItem {
  return {
    id: item.id,
    name: item.name,
    basePrice: Number(item.base_price),
    sku: item.sku,
  };
}

export async function fetchMasterMenu(
  page: number,
  perPage: number
): Promise<MasterMenuPage> {
  const response = await axios.get<{
    data: MasterMenuApiItem[];
    pagination: {
      totalRecords: number;
      currentPage: number;
      totalPages: number;
      limit: number;
    };
  }>(`${apiBaseUrl}/api/master-menu`, {
    params: { page, per_page: perPage },
  });

  return {
    items: response.data.data.map(mapItem),
    page: response.data.pagination.currentPage,
    perPage: response.data.pagination.limit,
    total: response.data.pagination.totalRecords,
    totalPages: response.data.pagination.totalPages,
  };
}

export async function fetchAllMasterMenu(): Promise<MasterMenuItem[]> {
  const firstPage = await fetchMasterMenu(1, 50);
  const items = [...firstPage.items];

  for (let page = firstPage.page + 1; page <= firstPage.totalPages; page += 1) {
    const nextPage = await fetchMasterMenu(page, firstPage.perPage);
    items.push(...nextPage.items);
  }

  return items;
}

export async function createMasterMenuItem(
  name: string,
  basePrice: number
): Promise<MasterMenuItem> {
  const response = await axios.post<{
    success: boolean;
    data: MasterMenuApiItem;
  }>(
    `${apiBaseUrl}/api/master-menu`,
    { name, base_price: basePrice }
  );

  return mapItem(response.data.data);
}
