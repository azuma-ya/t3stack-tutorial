import { redirect } from "next/navigation";

import CommentEdit from "@/components/comment/CommentEdit";
import { getAuthSession } from "@/lib/auth";
import { trpc } from "@/trpc/client";

interface CommentEditPageProps {
  params: {
    commentId: string;
  };
}

const CommentEditPage = async ({ params }: CommentEditPageProps) => {
  const commentId = params;

  const user = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  const comment = await trpc.comment.getCommentById(commentId);

  if (!comment) {
    return (
      <div className="text-center text-sm text-gray-500">
        コメントはありません
      </div>
    );
  }

  if (comment.userId !== user.id) {
    return <div className="text-center">編集権がありません</div>;
  }

  return <CommentEdit comment={comment} />;
};

export default CommentEditPage;
