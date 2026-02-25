import Image from "next/image";
import Link from "next/link";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper-white">
      {/* Minimal header */}
      <header className="border-b border-crease-light px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.svg" alt="ManeExchange" width={24} height={24} />
            <span className="font-heading text-base font-semibold tracking-tight text-ink-black">
              Mane<span className="font-normal text-ink-mid">Exchange</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Centered content */}
      <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
