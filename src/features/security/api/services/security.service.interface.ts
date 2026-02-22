export interface SecurityService {
  checkThrottle(ip: string): Promise<void>;
}
