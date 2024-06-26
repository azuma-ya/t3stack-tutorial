import type { Comment, CommentLike, User } from "@prisma/client";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import CommentLikeDetail from "@/components/comment/CommentLikeDetail";
import { trpc } from "@/trpc/react";

interface CommentItemProps {
  comment: Comment & { user: Pick<User, "id" | "image" | "name"> } & {
    hasLiked: boolean;
    commentLikeId: string | null;
  } & { likes: CommentLike[] };
  userId?: string;
}

const CommentItem = ({ comment, userId }: CommentItemProps) => {
  const router = useRouter();

  const { mutate: deleteComment, isPending } =
    trpc.comment.deleteComment.useMutation({
      onSuccess: () => {
        toast.success("コメントを削除しました");
        router.refresh();
      },
      onError: (error) => {
        toast.error("コメントの削除に失敗しました");
        console.error(error);
      },
    });

  const handleDeleteComment = () => {
    deleteComment({
      commentId: comment.id,
    });
  };
  return (
    <div>
      <div className="flex items-center justify-between border-b p-2 sm:p-5">
        <Link href={`/author/${comment.user.id}`}>
          <div className="flex items-center space-x-1">
            <div className="relative size-6 shrink-0">
              <Image
                src={comment.user.image || "/default.png"}
                className="rounded-full object-cover"
                alt={comment.user.name || "avatar"}
                fill
              />
            </div>
            <div className="text-sm hover:underline">{comment.user.name}</div>
          </div>
        </Link>
        <div className="text-sm">
          {format(new Date(comment.updatedAt), "yyyy/MM/dd HH:mm")}
        </div>
      </div>
      <div className="p2 whitespace-pre-wrap break-words leading-relaxed sm:p-5">
        <div>{comment.content}</div>
        <div className="flex items-center justify-end space-x-1 pb-1 pr-1">
          <CommentLikeDetail comment={comment} userId={comment.userId} />
          {userId === comment.user.id && (
            <>
              <Link href={`/comment/${comment.id}/edit`}>
                <div className="rounded-full p-2 hover:bg-gray-100">
                  <Pencil className="size-5" />
                </div>
              </Link>
              <button
                className="rounded-full p-2 hover:bg-gray-100"
                disabled={isPending}
                onClick={handleDeleteComment}
              >
                <Trash2 className="size-5 text-red-500" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
