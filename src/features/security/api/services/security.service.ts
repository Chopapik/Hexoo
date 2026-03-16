import type { SecurityService as ISecurityService } from "./security.service.interface";

export class SecurityService implements ISecurityService {
  async checkThrottle(ip: string) {
    // Throttling/rate limits have been disabled. This method is now a no-op.
    // Left in place to keep the interface stable.
    void ip;
    return;
  }
}
