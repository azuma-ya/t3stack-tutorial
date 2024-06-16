import type { Post } from "@prisma/client";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

interface AuthorPostItemProps {
  post: Post;
}

const AuthorPostItem = ({ post }: AuthorPostItemProps) => {
  return (
    <div className="relative rounded-md border">
      <Link href={`/post/${post.id}`} className="grow">
        {post.premium && (
          <div className="absolute top-0 z-10 rounded-md bg-gradient-radial from-blue-500 to-sky-400 px-3 py-1 text-xs font-semibold text-white">
            有料会員限定
          </div>
        )}
        <div className="relative aspect-[16/9] overflow-hidden rounded-t-md">
          <Image
            src={post.image || "/noImage.png"}
            alt="thumbnail"
            className="rounded-t-md object-cover transition-all hover:scale-105"
            fill
          />
        </div>
        <div className="px-3 pt-3">
          <div className="font-bold hover:underline">{post.title}</div>
        </div>
      </Link>
      <div className="p-3 text-sm text-gray-500">
        {format(new Date(post.updatedAt), "yyyy/MM/dd HH:mm")}
      </div>
    </div>
  );
};

export default AuthorPostItem;
