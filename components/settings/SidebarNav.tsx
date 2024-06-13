"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { title: "プロフィール", href: "/settings/profile" },
  { title: "パスワード変更", href: "/settings/password" },
];

const SidebarNav = () => {
  const passname = usePathname();
  return (
    <nav className={cn("flex space-x-2 md:flex-col md:space-x-0 md:space-y-1")}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            passname === item.href
              ? "bg-muted hover:text-muted-foreground"
              : "hover:bg-transparent hover:underline",
            "jusrify-start",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
};

export default SidebarNav;
