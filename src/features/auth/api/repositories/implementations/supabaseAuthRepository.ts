import { createAppError } from "@/lib/AppError";
import { supabaseAdmin } from "@/lib/supabaseServer";
import type {
  AuthRepository,
  AuthDecodedToken,
  AuthUserRecord,
  RefreshTokens,
} from "../authRepository.interface";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export class SupabaseAuthRepository implements AuthRepository {
  async verifyIdToken(idToken: string): Promise<AuthDecodedToken> {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(idToken);

    if (error) {
      throw createAppError({
        code: "INVALID_CREDENTIALS",
        message: "Failed to verify Supabase JWT.",
        details: error,
      });
    }

    if (!user) {
      throw createAppError({
        code: "INVALID_CREDENTIALS",
        message: "No user from Supabase JWT.",
      });
    }

    return {
      uid: user.id,
      email: user.email ?? null,
    };
  }

  async createSessionCookie(idToken: string, _expiresIn: number): Promise<string> {
    return idToken;
  }

  async refreshSession(refreshToken: string): Promise<RefreshTokens> {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "Supabase URL or anon key missing for refresh.",
      });
    }
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw createAppError({
        code: "INVALID_CREDENTIALS",
        message: "Failed to refresh Supabase session.",
        details: { status: res.status, body: errBody },
      });
    }
    const data = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
    };
    if (!data?.access_token || !data?.refresh_token) {
      throw createAppError({
        code: "INVALID_CREDENTIALS",
        message: "Supabase refresh response missing tokens.",
      });
    }
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  }

  async getUserByEmail(email: string): Promise<AuthUserRecord | null> {
    const normalized = email.trim().toLowerCase();
    let page = 1;
    const perPage = 500;

    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        throw createAppError({
          code: "INTERNAL_ERROR",
          message: "Failed to list users via Supabase Admin API.",
          details: error,
        });
      }

      const users = data?.users ?? [];
      const found = users.find(
        (u) => u.email?.toLowerCase() === normalized
      );

      if (found) {
        return { uid: found.id, email: found.email ?? null };
      }

      if (users.length < perPage) break;
      page += 1;
    }

    return null;
  }

  async deleteUser(uid: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (error) {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "Failed to delete user via Supabase Admin API.",
        details: error,
      });
    }
  }

  async updateUser(
    uid: string,
    properties: Record<string, unknown>
  ): Promise<void> {
    const attrs: {
      email?: string;
      password?: string;
      user_metadata?: Record<string, unknown>;
    } = {};

    if (typeof properties.email === "string") attrs.email = properties.email;
    if (typeof properties.password === "string")
      attrs.password = properties.password;

    const meta: Record<string, unknown> = {};
    if (typeof properties.displayName === "string") meta.name = properties.displayName;
    if (typeof properties.photoURL === "string") meta.avatar_url = properties.photoURL;
    if (Object.keys(meta).length > 0) attrs.user_metadata = meta;

    // Supabase has no "disabled" flag; ban is enforced via our DB (is_banned). Skip no-op.
    if (Object.keys(attrs).length === 0) return;

    const { error } = await supabaseAdmin.auth.admin.updateUserById(uid, attrs);
    if (error) {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "Failed to update user via Supabase Admin API.",
        details: error,
      });
    }
  }

  async createUser(properties: {
    email: string;
    password: string;
    displayName?: string;
    [key: string]: unknown;
  }): Promise<{ uid: string }> {
    const { email, password, displayName } = properties;
    const attrs: { email: string; password: string; user_metadata?: object } = {
      email,
      password,
    };
    if (displayName) attrs.user_metadata = { name: displayName };

    const { data, error } = await supabaseAdmin.auth.admin.createUser(attrs);

    if (error) {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "Failed to create user via Supabase Admin API.",
        details: error,
      });
    }

    if (!data?.user?.id) {
      throw createAppError({
        code: "INTERNAL_ERROR",
        message: "Supabase createUser returned no user id.",
      });
    }

    return { uid: data.user.id };
  }
}
