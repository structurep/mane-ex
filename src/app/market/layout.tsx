import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Intelligence",
  description:
    "Real-time pricing data, demand trends, and market insights from the ManeExchange equestrian marketplace.",
};

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return children;
}
