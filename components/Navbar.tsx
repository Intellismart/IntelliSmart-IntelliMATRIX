"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import UserMenu from "./UserMenu";

export default function Navbar() {
  const pathname = usePathname();
  const linkCls = (href: string) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
    return `px-3 py-2 rounded-md whitespace-nowrap ${active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`;
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        <Link href="/" className="font-semibold text-lg">
          IntelliSMART AI Factory
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <Link href="/" className={linkCls("/")}>Home</Link>
          <Link href="/store" className={linkCls("/store")}>Shop</Link>
          <Link href="/news" className={linkCls("/news")}>News</Link>
          <Link href="/reviews" className={linkCls("/reviews")}>Reviews</Link>
          <Link href="/tips" className={linkCls("/tips")}>Tips</Link>
          <Link href="/support" className={linkCls("/support")}>Support</Link>
          <span className="mx-1 hidden sm:inline-block">|</span>
          <Link href="/portal" className={linkCls("/portal")}>Portal</Link>
          <Link href="/resellers" className={linkCls("/resellers")}>Resellers</Link>
        </nav>
        <UserMenu />
      </div>
    </header>
  );
}
