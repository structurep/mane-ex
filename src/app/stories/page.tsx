import type { Metadata } from "next";
import { StoriesViewer } from "./stories-viewer";

export const metadata: Metadata = {
  title: "Quick Browse — ManeExchange",
  description: "Swipe through the latest horse listings in full-screen format.",
};

export default function StoriesPage() {
  return <StoriesViewer />;
}
