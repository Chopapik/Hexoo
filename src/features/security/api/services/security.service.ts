import { supabaseAdmin } from "@/lib/supabaseServer";
import { createAppError } from "@/lib/AppError";
import type { SecurityService as ISecurityService } from "./security.service.interface";

const TABLE = "throttle_limits";
const WINDOW_SIZE_MS = 60 * 1000;
const MAX_REQUESTS = 30;

export class SecurityService implements ISecurityService {
  async checkThrottle(ip: string) {
    const now = Date.now();

    const { data: row } = await supabaseAdmin
      .from(TABLE)
      .select("window_start, request_count")
      .eq("ip", ip)
      .maybeSingle();

    const windowStart = row?.window_start ?? 0;
    const currentCount = row?.request_count ?? 0;
    const timeElapsed = now - windowStart;

    if (!row || timeElapsed > WINDOW_SIZE_MS) {
      const { error } = await supabaseAdmin
        .from(TABLE)
        .upsert(
          { ip, window_start: now, request_count: 1 },
          { onConflict: "ip" },
        );
      if (error) throw new Error(error.message);
      return;
    }

    if (currentCount >= MAX_REQUESTS) {
      const resetTime = windowStart + WINDOW_SIZE_MS;
      throw createAppError({
        code: "RATE_LIMIT",
        status: 429,
        data: {
          ip,
          retryAfter: resetTime,
          limit: MAX_REQUESTS,
        },
      });
    }

    const { error } = await supabaseAdmin
      .from(TABLE)
      .update({
        request_count: currentCount + 1,
      })
      .eq("ip", ip);
    if (error) throw new Error(error.message);
  }
}
