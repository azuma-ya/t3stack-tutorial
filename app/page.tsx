import PaginationButton from "@/components/pagers/PaginationButton";
import PostItem from "@/components/post/PostItem";
import { postPerPage } from "@/lib/utils";
import { trpc } from "@/trpc/client";

export const revalidate = 0;

interface HomeProps {
  searchParams: {
    [key: string]: string | undefined;
  };
}

const Home = async ({ searchParams }: HomeProps) => {
  const { page, perPage } = searchParams;

  const limit = typeof perPage === "string" ? parseInt(perPage) : postPerPage;
  const offset = typeof page === "string" ? (parseInt(page) - 1) * limit : 0;

  const { posts, totalPosts } = await trpc.post.getPosts({ limit, offset });

  if (posts.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500">投稿はありません</div>
    );
  }

  const pageCount = Math.ceil(totalPosts / limit);

  return (
    <div className="space-y-5">
      <div className="space-y-5">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
      {posts.length !== 0 && (
        <PaginationButton pageCount={pageCount} displayPerPage={postPerPage} />
      )}
    </div>
  );
};

export default Home;
