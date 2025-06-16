'use client';

import { useState, useEffect } from 'react';
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

const subnetColors = [
  "bg-blue-100 border-blue-200 text-blue-800",
  "bg-green-100 border-green-200 text-green-800",
  "bg-purple-100 border-purple-200 text-purple-800",
  "bg-orange-100 border-orange-200 text-orange-800",
  "bg-teal-100 border-teal-200 text-teal-800",
  "bg-pink-100 border-pink-200 text-pink-800",
  "bg-yellow-100 border-yellow-200 text-yellow-800",
  "bg-red-100 border-red-200 text-red-800",
];

const binaryOctetColors = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-orange-100 text-orange-800 border-orange-200",
];

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ipAddress, setIpAddress] = useState('');
  const [prefixLength, setPrefixLength] = useState(24);
  const [result, setResult] = useState<CIDRInfo | null>(null);
  const [error, setError] = useState('');
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
    setError("");
    setResult(null);
    if (!isValidIP(ipAddress)) {
      setError("Please enter a valid IP address (e.g., 192.168.1.1)");
      return;
    }
    if (!isValidPrefixLength(prefixLength)) {
      setError("Prefix length must be between 0 and 32");
      return;
    }
    try {
      const cidrInfo = calculateCIDR(ipAddress, prefixLength);
      setResult(cidrInfo);
    } catch (err) {
      setError("An error occurred while calculating CIDR information");
    }
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
              {resultLabels.slice(0, 3).map((item, idx) => {
                const style = resultStyles[idx];
                return (
                  <div
                    key={item.key}
                    className={`flex flex-col items-center justify-center px-8 py-8 rounded-2xl border min-w-[260px] bg-white ${style.bg} ${style.border} shadow-sm`}
                  >
                    <span className={`text-2xl mb-2`}>{item.icon}</span>
                    <span className={`text-2xl font-jetbrains-mono font-bold mb-1 ${style.text}`}>{result[item.key as keyof CIDRInfo]}</span>
                    <span className={`text-lg font-bold tracking-wide font-montserrat mt-1 ${style.text}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mt-6">
              {resultLabels.slice(3, 6).map((item, idx) => {
                const style = resultStyles[idx + 3];
                return (
                  <div
                    key={item.key}
                    className={`flex flex-col items-center justify-center px-8 py-8 rounded-2xl border min-w-[260px] bg-white ${style.bg} ${style.border} shadow-sm`}
                  >
                    <span className={`text-2xl mb-2`}>{item.icon}</span>
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