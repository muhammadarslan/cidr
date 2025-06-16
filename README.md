# CIDR Calculator

A modern, visual, and educational CIDR calculator built with Next.js. Instantly calculate and visualize network information from any IPv4 address and prefix.

---

## What is CIDR?

**CIDR** (Classless Inter-Domain Routing) is a method for allocating IP addresses and routing that replaces the old class-based system. CIDR notation uses a format like `192.168.1.0/24`, where the number after the slash (`/24`) indicates how many bits are used for the network portion of the address.

- **Network bits** (before the slash) define the network address.
- **Host bits** (after the network bits) define individual devices on that network.

**Example:**
- `10.0.0.0/8` means the first 8 bits are the network, and the remaining 24 bits are for hosts. This allows for 16,777,214 hosts.

Learn more about CIDR and subnetting on [Wikipedia](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing).

---

## Features
- Visual, color-coded breakdown of IP, subnet, and host information
- Binary, decimal, and hexadecimal representations
- Wildcard mask, IP class, host range, and reverse DNS
- Shareable links with prefilled values
- Educational content and advanced info

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

---

## How to Contribute

1. **Fork this repository** and clone your fork.
2. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b my-feature
   ```
3. **Make your changes** and commit them with clear messages.
4. **Push to your fork** and open a Pull Request on GitHub.
5. Please include screenshots or a clear description of your change!

All contributions are welcome: bug fixes, new features, UI improvements, or documentation updates.

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
