'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  calculateCIDR,
  isValidIP,
  isValidPrefixLength,
  CIDRInfo,
  getWildcardMask,
  getIPClass,
  toBinary,
  toHex,
  getPTR,
} from "@/utils/cidr";
import { useRouter, useSearchParams } from "next/navigation";

function toBinaryOctets(ip: string) {
  return ip.split(".").map((octet) =>
    Number(octet)
      .toString(2)
      .padStart(8, "0")
      .split("")
  );
}

const resultStyles = [
  {
    bg: "bg-blue-100",
    border: "border-blue-200",
    text: "text-blue-800",
    label: "text-blue-600",
  },
  {
    bg: "bg-green-100",
    border: "border-green-200",
    text: "text-green-800",
    label: "text-green-600",
  },
  {
    bg: "bg-purple-100",
    border: "border-purple-200",
    text: "text-purple-800",
    label: "text-purple-600",
  },
  {
    bg: "bg-orange-100",
    border: "border-orange-200",
    text: "text-orange-800",
    label: "text-orange-600",
  },
  {
    bg: "bg-teal-100",
    border: "border-teal-200",
    text: "text-teal-800",
    label: "text-teal-600",
  },
  {
    bg: "bg-pink-100",
    border: "border-pink-200",
    text: "text-pink-800",
    label: "text-pink-600",
  },
];

const resultLabels = [
  { label: "Netmask", icon: "🛡️", key: "subnetMask" },
  { label: "CIDR Base IP", icon: "📦", key: "networkAddress" },
  { label: "Broadcast IP", icon: "📡", key: "broadcastAddress" },
  { label: "First Usable IP", icon: "🔑", key: "firstHost" },
  { label: "Last Usable IP", icon: "🔚", key: "lastHost" },
  { label: "Count", icon: "🔢", key: "totalHosts" },
];

const binaryOctetColors = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-orange-100 text-orange-800 border-orange-200",
];

const octetBitColors = [
  'bg-blue-400 text-white',
  'bg-green-400 text-white',
  'bg-purple-400 text-white',
  'bg-orange-400 text-white',
];
const octetLabelColors = [
  'text-blue-500',
  'text-green-500',
  'text-purple-500',
  'text-orange-500',
];

// Tooltip component
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="relative group cursor-pointer">
      {children}
      <span className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 hidden group-hover:block group-focus:block bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg font-sans min-w-max">
        {text}
      </span>
    </span>
  );
}

function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ipAddress, setIpAddress] = useState('');
  const [prefixLength, setPrefixLength] = useState(24);
  const [result, setResult] = useState<CIDRInfo | null>(null);
  const [copied, setCopied] = useState('');

  // Read from URL on mount
  useEffect(() => {
    const ip = searchParams.get("ip");
    const prefix = searchParams.get("prefix");
    if (ip && isValidIP(ip)) setIpAddress(ip);
    if (prefix && !isNaN(Number(prefix)) && isValidPrefixLength(Number(prefix))) setPrefixLength(Number(prefix));
    // eslint-disable-next-line
  }, []);

  // Update URL when ipAddress or prefixLength changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (isValidIP(ipAddress)) params.set("ip", ipAddress);
    if (isValidPrefixLength(prefixLength)) params.set("prefix", String(prefixLength));
    const paramString = params.toString();
    router.replace(paramString ? `?${paramString}` : "", { scroll: false });
    // eslint-disable-next-line
  }, [ipAddress, prefixLength]);

  useEffect(() => {
    setResult(null);
    if (!isValidIP(ipAddress)) {
      return;
    }
    if (!isValidPrefixLength(prefixLength)) {
      return;
    }
    const cidrInfo = calculateCIDR(ipAddress, prefixLength);
    setResult(cidrInfo);
  }, [ipAddress, prefixLength]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1200);
  };

  // For binary octets
  const ipOctets = ipAddress.split(".");
  const binaryOctets = isValidIP(ipAddress)
    ? toBinaryOctets(ipAddress)
    : [[], [], [], []];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-10 px-2">
      <div className="w-full max-w-6xl bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight text-center font-montserrat">CIDR Calculator</h1>
        <p className="text-lg text-slate-600 mb-8 text-center font-montserrat">Wide, modern, and visual subnet calculator</p>
        {/* Input Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 w-full">
          {Array(4)
            .fill(0)
            .map((_, idx) => (
              <input
                key={idx}
                type="number"
                min={0}
                max={255}
                value={ipOctets[idx] || ""}
                onChange={(e) => {
                  const newOctets = [...ipOctets];
                  newOctets[idx] = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                  setIpAddress(newOctets.join("."));
                }}
                className="w-16 text-2xl font-semibold text-slate-800 text-center bg-transparent border-0 border-b-2 border-slate-300 focus:border-blue-500 outline-none transition-all duration-150 mx-1 font-jetbrains-mono placeholder:text-slate-400"
                placeholder={"0"}
              />
            ))}
          <span className="text-2xl font-bold mx-1 font-montserrat">/</span>
          <input
            type="number"
            min={0}
            max={32}
            value={prefixLength}
            onChange={(e) => setPrefixLength(Number(e.target.value))}
            className="w-16 text-2xl font-semibold text-slate-800 text-center bg-transparent border-0 border-b-2 border-slate-300 focus:border-blue-500 outline-none transition-all duration-150 mx-1 font-jetbrains-mono placeholder:text-slate-400"
            placeholder="24"
          />
        </div>
        {/* Binary Row */}
        <div className="w-full overflow-x-auto mb-8">
          <div className="flex flex-row gap-1 min-w-[600px] justify-center">
            {binaryOctets.flat().map((bit, i) => {
              const octetIdx = Math.floor(i / 8);
              return (
                <span
                  key={i}
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-jetbrains-mono text-base font-semibold border ${binaryOctetColors[octetIdx]}`}
                >
                  {bit}
                </span>
              );
            })}
          </div>
        </div>
        {/* Results */}
        {result && (
          <div className="w-full mt-8 animate-fade-in-up overflow-x-auto">
            {/* Interactive Visualization Bar */}
            <div className="w-full max-w-5xl mx-auto mb-10 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold font-montserrat text-slate-700">Network/Host Bits Visualization</h3>
                <Tooltip text="This bar shows how many bits are used for the network (blue) and for hosts (gray) in your subnet.">
                  <span className="text-blue-500 text-base align-middle ml-1">ℹ️</span>
                </Tooltip>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm" style={{ width: 32 * 14 }}>
                  <div
                    className="bg-blue-400 flex items-center justify-center text-xs text-white font-bold h-full transition-all duration-300"
                    style={{ width: `${result.networkBits * 14}px` }}
                  >
                    {result.networkBits > 4 ? <span className="ml-2">Network ({result.networkBits})</span> : null}
                  </div>
                  <div
                    className="bg-slate-200 flex items-center justify-center text-xs text-slate-700 font-bold h-full transition-all duration-300"
                    style={{ width: `${result.hostBits * 14}px` }}
                  >
                    {result.hostBits > 4 ? <span className="ml-2">Host ({result.hostBits})</span> : null}
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-mono">/32</span>
              </div>
            </div>
            {/* Bitwise Mask Visualization */}
            <div className="w-full max-w-5xl mx-auto mb-10 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold font-montserrat text-slate-700">Bitwise Subnet Mask</h3>
                <Tooltip text="This shows the subnet mask as 32 bits. Blue/colored bits are network bits (1), gray are host bits (0). Each group of 8 bits is an octet.">
                  <span className="text-blue-500 text-base align-middle ml-1">ℹ️</span>
                </Tooltip>
              </div>
              <div className="flex flex-row gap-2 items-center justify-center" style={{ width: 32 * 14 }}>
                {Array.from({ length: 4 }).map((_, octetIdx) => (
                  <div key={octetIdx} className="flex flex-col items-center">
                    <div className="flex flex-row gap-0.5">
                      {Array.from({ length: 8 }).map((_, bitIdx) => {
                        const globalBitIdx = octetIdx * 8 + bitIdx;
                        const isNetwork = globalBitIdx < result.networkBits;
                        return (
                          <span
                            key={bitIdx}
                            className={`w-7 h-7 flex items-center justify-center rounded font-jetbrains-mono text-sm font-bold border border-slate-200 ${isNetwork ? octetBitColors[octetIdx] : 'bg-slate-200 text-slate-700'}`}
                          >
                            {isNetwork ? 1 : 0}
                          </span>
                        );
                      })}
                    </div>
                    <span className={`text-xs mt-1 font-mono font-bold ${octetLabelColors[octetIdx]}`}>Octet {octetIdx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
              {resultLabels.slice(0, 3).map((item, idx) => {
                const style = resultStyles[idx];
                // Add tooltips for Netmask, CIDR Base, Broadcast
                const tooltips = [
                  "The subnet mask determines which part of the IP address is the network and which is the host.",
                  "The base IP address of the network (all host bits are 0).",
                  "The broadcast address is used to send data to all hosts in the network.",
                ];
                return (
                  <div
                    key={item.key}
                    className={`flex flex-col items-center justify-center px-8 py-8 rounded-2xl border min-w-[260px] bg-white ${style.bg} ${style.border} shadow-sm`}
                  >
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      <Tooltip text={tooltips[idx]}>
                        <span className="text-blue-500 text-base align-middle ml-1">ℹ️</span>
                      </Tooltip>
                    </div>
                    <span className={`text-2xl font-jetbrains-mono font-bold mb-1 ${style.text}`}>{result[item.key as keyof CIDRInfo]}</span>
                    <span className={`text-lg font-bold tracking-wide font-montserrat mt-1 ${style.text}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mt-6">
              {resultLabels.slice(3, 6).map((item, idx) => {
                const style = resultStyles[idx + 3];
                // Add tooltips for First/Last Usable, Count
                const tooltips = [
                  "The first usable IP address in the network (usually assigned to a host).",
                  "The last usable IP address in the network (usually assigned to a host).",
                  "The total number of usable host addresses in the network.",
                ];
                return (
                  <div
                    key={item.key}
                    className={`flex flex-col items-center justify-center px-8 py-8 rounded-2xl border min-w-[260px] bg-white ${style.bg} ${style.border} shadow-sm`}
                  >
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      <Tooltip text={tooltips[idx]}>
                        <span className="text-blue-500 text-base align-middle ml-1">ℹ️</span>
                      </Tooltip>
                    </div>
                    <span className={`text-2xl font-jetbrains-mono font-bold mb-1 ${style.text}`}>{item.key === "totalHosts" ? result[item.key].toLocaleString() : result[item.key as keyof CIDRInfo]}</span>
                    <span className={`text-lg font-bold tracking-wide font-montserrat mt-1 ${style.text}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
            {/* Copy Buttons */}
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <button
                onClick={() => handleCopy(`${result.ipAddress}/${result.networkBits}`, "CIDR")}
                className="px-5 py-2 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors duration-150 flex items-center gap-2 font-montserrat"
              >
                📋 Copy CIDR
              </button>
              <button
                onClick={() => handleCopy(window.location.href, "Link")}
                className="px-5 py-2 rounded-full bg-slate-200 text-blue-700 font-medium hover:bg-blue-100 transition-colors duration-150 flex items-center gap-2 font-montserrat"
              >
                🔗 Copy Share Link
              </button>
            </div>
            {copied && (
              <div className="text-center mt-2 text-green-600 font-semibold animate-fade-in font-montserrat">
                {copied} copied!
              </div>
            )}
            {/* Advanced Info Section */}
            <div className="w-full max-w-5xl mx-auto mt-12 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold font-montserrat mb-6 text-blue-600">Advanced Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x md:divide-slate-100">
                <div className="pr-0 md:pr-8">
                  <div className="mb-3"><span className="font-semibold text-slate-600">Wildcard Mask:</span> <span className="font-mono text-slate-700">{getWildcardMask(result.subnetMask)}</span></div>
                  <div className="mb-3"><span className="font-semibold text-slate-600">IP Class:</span> <span className="font-mono text-slate-700">{getIPClass(result.ipAddress)}</span></div>
                  <div className="mb-3"><span className="font-semibold text-slate-600">Host Address Range:</span> <span className="font-mono text-slate-700">{result.firstHost} - {result.lastHost}</span></div>
                  <div className="mb-3"><span className="font-semibold text-slate-600">Reverse DNS (PTR):</span> <span className="font-mono text-slate-700">{getPTR(result.networkAddress)}</span></div>
                </div>
                <div className="pl-0 md:pl-8 mt-6 md:mt-0">
                  <div className="mb-3"><span className="font-semibold text-slate-600">Subnet Mask (Binary):</span> <span className="font-mono text-slate-700">{toBinary(result.subnetMask)}</span></div>
                  <div className="mb-3"><span className="font-semibold text-slate-600">IP (Hex):</span> <span className="font-mono text-slate-700">{toHex(result.ipAddress)}</span></div>
                  <div className="mb-3"><span className="font-semibold text-slate-600">Subnet Mask (Hex):</span> <span className="font-mono text-slate-700">{toHex(result.subnetMask)}</span></div>
                  <div className="mb-3"><span className="font-semibold text-slate-600">Network Address (Hex):</span> <span className="font-mono text-slate-700">{toHex(result.networkAddress)}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Animations and Fonts */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s cubic-bezier(.4,2,.6,1) both;
        }
        .font-montserrat { font-family: var(--font-montserrat), sans-serif; }
        .font-jetbrains-mono { font-family: var(--font-jetbrains-mono), monospace; }
      `}</style>
    </main>
  );
}

export default function PageWrapper() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}