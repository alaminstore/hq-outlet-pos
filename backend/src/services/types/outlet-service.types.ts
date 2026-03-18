export type OutletRow = {
  id: number;
  outletCode: string;
  name: string;
};

export type OutletMenuConfigRow = {
  id: number;
  outlet_id: number;
  menu_item_id: number;
  outlet_price: string;
  stock_level: number;
  name: string;
  sku: string;
  base_price: string;
};

export type PaginationInput = {
  page?: number;
  perPage?: number;
};

export type CreateMenuConfigInput = {
  outletId: number;
  menuItemId: number;
  outletPrice?: number;
  stockLevel?: number;
};

export type BatchCreateMenuConfigInput = {
  outletId: number;
  updates: Array<{
    menu_item_id?: number;
    outlet_price?: number;
    stock_level?: number;
  }>;
};

export type UpdateMenuConfigInput = {
  outletId: number;
  configId: number;
  outletPrice?: number;
  stockLevel?: number;
};

export type BatchUpdateMenuConfigInput = {
  outletId: number;
  updates: Array<{
    config_id?: number;
    outlet_price?: number;
    stock_level?: number;
  }>;
};

export type MenuDefaultsRow = {
  base_price: string;
};

export type InsertedConfigRow = {
  id: number;
};

export type CountRow = {
  count: number;
};
