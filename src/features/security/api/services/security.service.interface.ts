export interface SecurityService {
  checkAndIncrementIpLimit(ip: string): Promise<void>;
  resetIpLimit(ip: string): Promise<void>;
  checkThrottle(ip: string): Promise<void>;
}
