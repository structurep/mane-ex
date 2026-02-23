import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function ListingNotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center px-4 py-32">
        <h1 className="text-4xl font-bold text-ink-black">Horse not found</h1>
        <p className="mt-2 text-ink-mid">
          This listing may have been removed or the URL is incorrect.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/browse">Browse All Horses</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
}
