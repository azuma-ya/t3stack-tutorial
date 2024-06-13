import { redirect } from "next/navigation";

import PostEdit from "@/components/post/PostEdit";
import { getAuthSession } from "@/lib/auth";
import { trpc } from "@/trpc/client";

interface PostEditPageProps {
  params: {
    postId: string;
  };
}

const PostEditPage = async ({ params }: PostEditPageProps) => {
  const { postId } = params;

  const user = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  const post = await trpc.post.getPostById({ postId });

  if (!post) {
    return (
      <div className="text-center text-sm text-gray-500">投稿はありません</div>
    );
  }

  if (post.userId !== user.id) {
    return (
      <div className="text-center text-sm text-gray-500">投稿はありません</div>
    );
  }

  return <PostEdit post={post} />;
};

export default PostEditPage;
