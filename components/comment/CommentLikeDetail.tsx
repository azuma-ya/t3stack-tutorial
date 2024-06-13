"use client";

import { Comment, CommentLike, User } from "@prisma/client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/react";
import { Heart } from "lucide-react";

interface CommentLikeDetailProps {
  comment: Comment & { user: Pick<User, "id" | "image" | "name"> } & {
    hasLiked: boolean;
    commentLikeId: string | null;
  } & { likes: CommentLike[] };
  userId?: string;
}

const CommentLikeDetail = ({ comment, userId }: CommentLikeDetailProps) => {
  const router = useRouter();
  const [hasLiked, setHasLiked] = useState<boolean>(comment.hasLiked);
  const [likeCount, setLikeCount] = useState<number>(comment.likes.length);

  const { mutate: createCommentLike, isPending: createCommentLikeLoading } =
    trpc.comment.createCommentLike.useMutation({
      onSuccess: () => {
        router.refresh();
      },
      onError: (error) => {
        console.error(error);
        //いいねをロールバック
        if (likeCount > 0) {
          setHasLiked(false);
          setLikeCount(likeCount - 1);
        }
      },
    });

  const { mutate: deleteCommentLike, isPending: deleteCommentLikeLoading } =
    trpc.comment.deleteCommentLike.useMutation({
      onSuccess: () => {
        router.refresh();
      },
      onError: (error) => {
        console.error(error);
        //いいねをロールバック
        setHasLiked(true);
        setLikeCount(likeCount + 1);
      },
    });

  const handleCreateCommentLike = () => {
    setHasLiked(true);
    setLikeCount(likeCount + 1);
    createCommentLike({
      commentId: comment.id,
    });
  };

  const handleDeleteCommentLike = () => {
    if (!comment.commentLikeId) {
      return;
    }

    setHasLiked(false);
    setLikeCount(likeCount - 1);
    deleteCommentLike({
      commentLikeId: comment.commentLikeId,
    });
  };

  return (
    <div className="flex items-center">
      {hasLiked ? (
        <button
          className="hover:bg-gray-100 p-2 rounded-full"
          disabled={createCommentLikeLoading || deleteCommentLikeLoading}
          onClick={handleDeleteCommentLike}
        >
          <Heart fill="rgb(236, 72, 153)" className="w-5 h-5 text-pink-500" />
        </button>
      ) : (
        <button
          className={cn("p-2", userId && "hover:bg-gray-100 p-2 rounded-full")}
          disabled={
            !userId || createCommentLikeLoading || deleteCommentLikeLoading
          }
          onClick={handleCreateCommentLike}
        >
          <Heart className="w-5 h-5" />
        </button>
      )}
      {likeCount > 0 && <div className="pr-1">{likeCount}</div>}
    </div>
  );
};

export default CommentLikeDetail;
