import type { Request, Response } from "express";
import { connectDB } from "../config/db-config";

type LoginBody = {
  user_type?: "hq" | "outlet";
  password?: string;
};

export async function login(req: Request, res: Response) {
  const { user_type, password } = req.body as LoginBody;

  if (!user_type || !password) {
    return res.status(400).json({ ok: false, message: "Missing credentials" });
  }

  if (user_type === "hq") {
    const secret = process.env.HQ_SECRET_CODE ?? "";
    if (password === secret) {
      return res.json({ ok: true, author: "hq" });
    }
    return res.status(401).json({ ok: false, message: "Invalid code" });
  }

  if (user_type === "outlet") {
    const rows = (await connectDB.query(
      "SELECT id FROM outlets WHERE outlet_code = $1 LIMIT 1",
      [password]
    )) as { id: number }[];

    if (rows.length > 0) {
      return res.json({ ok: true, author: "outlet", outlet_id: rows[0].id });
    }

    return res.status(401).json({ ok: false, message: "Invalid code" });
  }

  return res.status(400).json({ ok: false, message: "Invalid user_type" });
}
