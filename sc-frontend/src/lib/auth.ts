// sc-frontend/src/lib/auth.ts
// 服务端读取 Cookie 并获取用户语言偏好

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const COOKIE_NAME = "auth_token";
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

/**
 * 从 Cookie 中读取 JWT token，解码获取 user_id，
 * 然后调用后端 API 获取用户语言偏好
 */
export async function getUserLanguage(): Promise<"en" | "zh"> {
  try {
    // 1. 读取 Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return "en";
    }

    // 2. 解码 JWT 获取 user_id
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub;

    if (!userId) {
      return "en";
    }

    // 3. 调用后端 API 获取用户信息
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return "en";
    }

    const user = await response.json();
    return user.language === "zh" ? "zh" : "en";
  } catch {
    // 任何错误都返回默认语言
    return "en";
  }
}
