import axios from "axios";
import apiBaseUrl from "../utils/apiBaseUrl";

export type UserRole = "hq" | "outlet";

export interface UserSession {
  role: UserRole;
  outletId?: number;
}

export type LoginResult =
  | { success: true; session: UserSession }
  | { success: false; error: "INVALID_CREDENTIALS" | "SERVER_ERROR" };

export async function login(
  userType: UserRole,
  password: string,
): Promise<LoginResult> {
  try {
    const { data } = await axios.post<LoginResponse>(
      `${apiBaseUrl}/api/login`,
      { user_type: userType, password },
    );

    return {
      success: true,
      session: {
        role: data.author,
        outletId: data.outlet_id,
      },
    };
  } catch (error) {
    return handleLoginError(error);
  }
}

function handleLoginError(error: unknown): LoginResult {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) {
      return { success: false, error: "INVALID_CREDENTIALS" };
    }
  }

  console.error("[LoginService] Unexpected error:", error);
  return { success: false, error: "SERVER_ERROR" };
}

interface LoginResponse {
  ok: boolean;
  author: UserRole;
  outlet_id?: number;
}
