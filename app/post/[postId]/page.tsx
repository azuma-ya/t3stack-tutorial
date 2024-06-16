import { getSubscription } from "@/actions/subscription";
import PostDetail from "@/components/post/PostDetail";
import { getAuthSession } from "@/lib/auth";
import { commentPerPage } from "@/lib/utils";
import { trpc } from "@/trpc/client";

interface PostDetailPageProps {
  params: {
    postId: string;
  };
  searchParams: {
    [key: string]: string | undefined;
  };
}

const PostDetailPage = async ({
  params,
  searchParams,
}: PostDetailPageProps) => {
  const { postId } = params;
  const { page, perPage } = searchParams;

  const limit =
    typeof perPage === "string" ? parseInt(perPage) : commentPerPage;
  const offset = typeof page === "string" ? (parseInt(page) - 1) * limit : 0;

  const user = await getAuthSession();

  const post = await trpc.post.getPostById({ postId });

  if (!post) {
    return (
      <div className="text-center text-sm text-gray-500">投稿はありません</div>
    );
  }

  const { isSubscribed } = await getSubscription({ userId: user?.id });

  const { comments, totalComments } = await trpc.comment.getComments({
    userId: user?.id,
    postId,
    limit,
    offset,
  });

  const pageCount = Math.ceil(totalComments / limit);

  return (
    <PostDetail
      post={post}
      userId={user?.id}
      comments={comments}
      pageCount={pageCount}
      totalComments={totalComments}
      isSubscribed={isSubscribed}
    />
  );
};

export default PostDetailPage;
