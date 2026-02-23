import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about buying, selling, payments, and trust & safety on ManeExchange.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
