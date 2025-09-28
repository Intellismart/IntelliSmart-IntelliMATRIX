import Link from "next/link";

import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        <Link href="/" className="font-semibold text-lg">
          IntelliSMART AI Factory
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <Link href="/" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground whitespace-nowrap">Home</Link>
          <Link href="/store" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground whitespace-nowrap">Shop</Link>
          <Link href="/news" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground whitespace-nowrap">News</Link>
          <Link href="/reviews" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground whitespace-nowrap">Reviews</Link>
          <Link href="/tips" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground whitespace-nowrap">Tips</Link>
          <Link href="/support" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground whitespace-nowrap">Support</Link>
          <span className="mx-1 hidden sm:inline-block">|</span>
          <Link href="/portal" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground whitespace-nowrap">Portal</Link>
          <Link href="/resellers" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground whitespace-nowrap">Resellers</Link>
        </nav>
        <UserMenu />
      </div>
    </header>
  );
}
