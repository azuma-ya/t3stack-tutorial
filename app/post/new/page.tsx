import { redirect } from "next/navigation";

import PostNew from "@/components/post/PostNew";
import { getAuthSession } from "@/lib/auth";

const PostNewPage = async () => {
  const user = await getAuthSession();

  if (!user) {
    redirect("/");
  }

  return <PostNew />;
};

export default PostNewPage;
