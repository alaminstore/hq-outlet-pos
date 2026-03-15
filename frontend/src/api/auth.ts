import axios from "axios";

export type LoginResponse = {
  ok: boolean;
  author: "hq" | "outlet";
  outlet_id?: number;
};

const apiBaseUrl = import.meta.env.VITE_HQ_API_URL ?? "";

export type LoginResult =
  | { ok: true; data: LoginResponse }
  | { ok: false; reason: "unauthorized" | "unknown" };

export async function login(
  userType: "hq" | "outlet",
  password: string,
): Promise<LoginResult> {
  try {
    const response = await axios.post<LoginResponse>(
      `${apiBaseUrl}/api/login`,
      {
        user_type: userType,
        password,
      },
    );

    return { ok: true, data: response.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return { ok: false, reason: "unauthorized" };
    }
    return { ok: false, reason: "unknown" };
  }
}
