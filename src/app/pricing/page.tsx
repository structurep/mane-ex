import { Metadata } from "next";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "ManeExchange pricing — free at launch. Zero listing fees. Zero transaction fees.",
};

export default function PricingPage() {
  return <PricingContent />;
}
