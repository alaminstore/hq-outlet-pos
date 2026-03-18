export type SaleItemInput = {
  menu_item_id: number;
  quantity: number;
};

export type ConfigRow = {
  menu_item_id: number;
  stock_level: number;
  outlet_price: string;
};

export type SaleRow = {
  id: number;
  receipt_number: number;
  total_amount: string;
  created_at: string;
};
