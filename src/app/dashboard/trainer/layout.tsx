import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trainer Portal",
};

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
