import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post an ISO — ManeExchange",
  description:
    "Post an In Search Of request to let sellers know exactly what kind of horse you're looking for on ManeExchange.",
};

export default function IsoNewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
