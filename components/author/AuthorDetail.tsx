import Image from "next/image";

import AuthorPostItem from "@/components/author/AuthorPostItem";
import PaginationButton from "@/components/pagers/PaginationButton";
import { userPostPerPage } from "@/lib/utils";
import type { Post, User } from "@prisma/client";

interface AuthorDetailProps {
  user: User & {
    posts: Post[];
  };
  pageCount: number;
  totalPosts: number;
}

const AuthorDetail = ({ user, pageCount, totalPosts }: AuthorDetailProps) => {
  return (
    <div>
      <div className="mb-5 flex justify-center">
        <div className="relative size-28 shrink-0">
          <Image
            src={user.image || "/default.png"}
            className="rounded-full object-cover"
            alt={user.name || "avatar"}
            fill
          />
        </div>
      </div>
      <div className="mb-5 space-y-5 whitespace-pre-wrap break-words">
        <div className="text-center text-xl font-bold">{user.name}</div>
        <div className="leading-relaxed">{user.introduction}</div>
      </div>
      <div className="space-y-5">
        <div>
          <div className="mb-1 font-bold">投稿 {totalPosts}</div>
          <hr />
        </div>
        {user.posts.length === 0 ? (
          <div className="text-center text-sm text-gray-500">
            投稿はありません
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 break-words sm:grid-cols-3">
            {user.posts.map((post) => (
              <AuthorPostItem key={post.id} post={post} />
            ))}
          </div>
        )}
        {user.posts.length !== 0 && (
          <PaginationButton
            pageCount={pageCount}
            displayPerPage={userPostPerPage}
          />
        )}
      </div>
    </div>
  );
};

export default AuthorDetail;
