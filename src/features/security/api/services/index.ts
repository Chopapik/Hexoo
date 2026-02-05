import { SecurityService } from "./security.service";

export const getSecurityService = (): SecurityService => {
  return new SecurityService();
};

export async function checkAndIncrementIpLimit(ip: string) {
  const service = getSecurityService();
  return await service.checkAndIncrementIpLimit(ip);
}

export async function resetIpLimit(ip: string) {
  const service = getSecurityService();
  return await service.resetIpLimit(ip);
}

export async function checkThrottle(ip: string) {
  const service = getSecurityService();
  return await service.checkThrottle(ip);
}

export { SecurityService };
