"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@prisma/client";

interface UserNavigationProps {
  user: User;
}

const UserNavigation = ({ user }: UserNavigationProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="relative size-10 shrink-0">
          <Image
            src={user.image || "/default.png"}
            className="object-fit rounded-full"
            alt={user.name || "avatar"}
            fill
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] bg-white p-2" align="end">
        <Link href={`/author/${user.id}`}>
          <DropdownMenuItem className="cursor-pointer">
            <div className="min-w-0 break-words">
              <div className="mb-2">{user.name || ""}</div>
              <div className="text-gary-500">{user.email || ""}</div>
            </div>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        {user.isAdmin && (
          <Link href="/post/new">
            <DropdownMenuItem className="cursor-pointer">
              新規投稿
            </DropdownMenuItem>
          </Link>
        )}
        <Link href="/settings/profile">
          <DropdownMenuItem className="cursor-pointer">
            アカウント設定
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          onSelect={async (event) => {
            event.preventDefault();
            await signOut({ callbackUrl: "/" });
          }}
          className="cursor-pointer text-red-600"
        >
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNavigation;
