import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="text-center">
          <p className="text-6xl font-bold text-paper-warm">404</p>
          <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-ink-black">
            Horse Not Found
          </h1>
          <p className="mt-2 text-ink-mid">
            This listing may have been sold, removed, or the URL might be incorrect.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/browse">
                <Search className="mr-2 h-4 w-4" />
                Browse Horses
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
