"use client";

import type { Comment, CommentLike, User } from "@prisma/client";

import CommentItem from "@/components/comment/CommentItem";
import CommentNew from "@/components/comment/CommentNew";
import PaginationButton from "@/components/pagers/PaginationButton";
import { commentPerPage } from "@/lib/utils";

interface CommentDetailProps {
  userId?: string;
  postId: string;
  comments: (Comment & { user: Pick<User, "id" | "image" | "name"> } & {
    hasLiked: boolean;
    commentLikeId: string | null;
  } & { likes: CommentLike[] })[];
  pageCount: number;
  totalComments: number;
}

const CommentDetail = ({
  userId,
  postId,
  comments,
  pageCount,
  totalComments,
}: CommentDetailProps) => {
  return (
    <div className="space-y-5">
      <CommentNew userId={userId} postId={postId} />
      <div className="rounded-md border">
        <div className="rounded-t-xl border-b bg-gray-50 p-2 text-sm font-bold sm:p-5">
          コメント {totalComments}
        </div>
        {comments.length === 0 ? (
          <div className="my-10 text-center text-sm text-gray-500">
            コメントはありません
          </div>
        ) : (
          <div>
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className={index !== comments.length - 1 ? "border-b" : ""}
              >
                <CommentItem comment={comment} userId={userId} />
              </div>
            ))}
          </div>
        )}
      </div>
      {comments.length !== 0 && (
        <PaginationButton
          pageCount={pageCount}
          displayPerPage={commentPerPage}
        />
      )}
    </div>
  );
};

export default CommentDetail;
