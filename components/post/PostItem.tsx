"use client";

import type { Post, User } from "@prisma/client";
import { formatDistance } from "date-fns";
import { ja } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";

interface PostItemProps {
  post: Post & {
    user: Pick<User, "id" | "name" | "image">;
  };
}

const PostItem = ({ post }: PostItemProps) => {
  const content =
    post.content.length > 60 ? post.content.slice(0, 60) + "..." : post.content;

  const updateAt = new Date(post.updatedAt ?? 0);
  const now = new Date();
  const date = formatDistance(updateAt, now, { addSuffix: true, locale: ja });

  return (
    <div>
      <div className="grid grid-cols-1 space-y-3 sm:grid-cols-3 sm:gap-3 sm:space-y-0">
        <Link href={`/post/${post.id}`} className="relative">
          {post.premium && (
            <div className="absolute top-0 z-10 rounded-md bg-gradient-radial from-blue-500 to-sky-400 px-3 py-1 text-xs font-semibold text-white">
              有料会員限定
            </div>
          )}
          <div className="relative col-span-3 aspect-[16/9] overflow-hidden rounded-md sm:col-span-1">
            <Image
              fill
              src={post.image || "/noImage.png"}
              alt="thumbnail"
              className="rounded-md object-cover transition-all hover:scale-105"
            />
          </div>
        </Link>
        <div className="col-span-1 space-y-3 break-words sm:col-span-2">
          <div className="text-lg font-bold hover:underline">
            <Link href={`/post/${post.id}`}>{post.title}</Link>
          </div>
          <div className="hover:underline">
            <Link href={`/post/${post.id}`}>{content}</Link>
          </div>
          <div>
            <Link href={`/author/${post.user.id}`}>
              <div className="flex items-center space-x-1">
                <div className="relative size-6 shrink-0">
                  <Image
                    src={post.user.image || "/default.png"}
                    className="rounded-full object-cover"
                    alt={post.user.name || "avatar"}
                    fill
                  />
                </div>
                <div className="min-w-0 break-words text-sm hover:underline">
                  {post.user.name} | {date}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
