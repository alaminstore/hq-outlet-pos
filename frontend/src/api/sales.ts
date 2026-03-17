import axios from "axios";
import apiBaseUrl from "../utils/apiBaseUrl";

export type SaleItemInput = {
  menu_item_id: number;
  quantity: number;
};

export type CreateSaleResponse = {
  ok: boolean;
  sale: {
    id: number;
    receipt_number: number;
    total_amount: string;
    created_at: string;
  };
};

export async function createSale(outletId: number, items: SaleItemInput[]) {
  const response = await axios.post<CreateSaleResponse>(
    `${apiBaseUrl}/api/outlets/${outletId}/sales`,
    { items },
  );
  return response.data.sale;
}
