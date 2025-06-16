export interface CIDRInfo {
  ipAddress: string;
  subnetMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  networkBits: number;
  hostBits: number;
}

export function calculateCIDR(ipAddress: string, prefixLength: number): CIDRInfo {
  // Convert IP address to binary
  const ipParts = ipAddress.split('.').map(Number);
  const ipBinary = ipParts.map(part => part.toString(2).padStart(8, '0')).join('');
  
  // Calculate subnet mask
  const subnetMaskBinary = '1'.repeat(prefixLength) + '0'.repeat(32 - prefixLength);
  const subnetMask = subnetMaskBinary.match(/.{8}/g)!.map(bin => parseInt(bin, 2)).join('.');
  
  // Calculate network address
  const networkBinary = ipBinary.slice(0, prefixLength) + '0'.repeat(32 - prefixLength);
  const networkAddress = networkBinary.match(/.{8}/g)!.map(bin => parseInt(bin, 2)).join('.');
  
  // Calculate broadcast address
  const broadcastBinary = ipBinary.slice(0, prefixLength) + '1'.repeat(32 - prefixLength);
  const broadcastAddress = broadcastBinary.match(/.{8}/g)!.map(bin => parseInt(bin, 2)).join('.');
  
  // Calculate first and last host
  const firstHostParts = networkAddress.split('.').map(Number);
  firstHostParts[3] += 1;
  const firstHost = firstHostParts.join('.');
  
  const lastHostParts = broadcastAddress.split('.').map(Number);
  lastHostParts[3] -= 1;
  const lastHost = lastHostParts.join('.');
  
  // Calculate total hosts
  let totalHosts;
  if (prefixLength === 32) {
    totalHosts = 1;
  } else if (prefixLength === 31) {
    totalHosts = 2;
  } else {
    totalHosts = Math.pow(2, 32 - prefixLength) - 2;
  }
  
  return {
    ipAddress,
    subnetMask,
    networkAddress,
    broadcastAddress,
    firstHost,
    lastHost,
    totalHosts,
    networkBits: prefixLength,
    hostBits: 32 - prefixLength
  };
}

export function isValidIP(ip: string): boolean {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;
  
  const parts = ip.split('.').map(Number);
  return parts.every(part => part >= 0 && part <= 255);
}

export function isValidPrefixLength(prefix: number): boolean {
  return prefix >= 0 && prefix <= 32;
}

export function getWildcardMask(subnetMask: string): string {
  return subnetMask
    .split('.')
    .map(octet => (255 - Number(octet)).toString())
    .join('.');
}

export function getIPClass(ip: string): string {
  const first = Number(ip.split('.')[0]);
  if (first >= 1 && first <= 126) return 'A';
  if (first >= 128 && first <= 191) return 'B';
  if (first >= 192 && first <= 223) return 'C';
  if (first >= 224 && first <= 239) return 'D (Multicast)';
  if (first >= 240 && first <= 254) return 'E (Reserved)';
  return 'Unknown';
}

export function toBinary(ip: string): string {
  return ip
    .split('.')
    .map(octet => Number(octet).toString(2).padStart(8, '0'))
    .join('.');
}

export function toHex(ip: string): string {
  return ip
    .split('.')
    .map(octet => Number(octet).toString(16).padStart(2, '0'))
    .join('.');
}

export function getPTR(ip: string): string {
  return ip.split('.').reverse().join('.') + '.in-addr.arpa';
} 