import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping",
  description:
    "Find verified horse transporters, track shipments, and manage transport quotes on ManeExchange.",
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
