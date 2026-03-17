import axios from "axios";
import apiBaseUrl from "../utils/apiBaseUrl";

export type Outlet = {
  id: number;
  name: string;
};

export async function fetchOutlets(): Promise<Outlet[]> {
  const response = await axios.get<{ items: Outlet[] }>(
    `${apiBaseUrl}/api/outlets`
  );
  return response.data.items;
}
