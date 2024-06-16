import { redirect } from "next/navigation";

import PostNew from "@/components/post/PostNew";
import { getAuthSession } from "@/lib/auth";

const PostNewPage = async () => {
  const user = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    return (
      <div className="text-center text-sm text-gray-500">
        投稿権限はありません
      </div>
    );
  }

  return <PostNew />;
};

export default PostNewPage;
