"use client";

import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import CommentDetail from "@/components/comment/CommentDetail";
import { trpc } from "@/trpc/react";
import type { Comment, CommentLike, Post, User } from "@prisma/client";

interface PostDetailProps {
  post: Post & {
    user: Pick<User, "id" | "name" | "image">;
  };
  userId?: string;
  comments: (Comment & { user: Pick<User, "id" | "image" | "name"> } & {
    hasLiked: boolean;
    commentLikeId: string | null;
  } & { likes: CommentLike[] })[];
  pageCount: number;
  totalComments: number;
  isSubscribed: boolean;
}

const PostDetail = ({
  post,
  userId,
  comments,
  pageCount,
  totalComments,
  isSubscribed,
}: PostDetailProps) => {
  const router = useRouter();

  const isSubscribedPost = post.premium && !isSubscribed && post.id !== userId;

  const content =
    isSubscribedPost && post.content.length > 200
      ? post.content.slice(0, 200) + "..."
      : post.content;

  const { mutate: deletePost, isPending } = trpc.post.deletePost.useMutation({
    onSuccess: () => {
      toast.success("投稿を削除しました");
      router.refresh();
      router.push(`/`);
    },
    onError: (error) => {
      toast.error(error.message);
      console.error(error);
    },
  });

  const handleDeletePost = () => {
    if (post.user.id !== userId) {
      toast.error("投稿は削除できません");
      return;
    }

    deletePost({
      postId: post.id,
    });
  };

  return (
    <div className="space-y-5">
      {post.premium && (
        <div className="inline-block rounded-md bg-gradient-radial from-blue-500 to-sky-400 px-3 py-1 text-xs font-semibold text-white">
          有料会員限定
        </div>
      )}
      <div className="break-words text-2xl font-bold">{post.title}</div>
      <div>
        <Link href={`/author/${post.user.id}`}>
          <div className="flex items-center space-x-1">
            <div className="relative size-6 shrink-0">
              <Image
                src={post.user.image || "/default.png"}
                className="rounded-full object-cover"
                alt={post.user.name || "avatar"}
                fill
              />
            </div>
            <div className="min-w-0 break-words text-sm hover:underline">
              {post.user.name} |{" "}
              {format(new Date(post.updatedAt), "yyyy/MM/dd HH:mm")}
            </div>
          </div>
        </Link>
      </div>
      <div className="relative aspect-[16/9]">
        <Image
          fill
          src={post.image || "/noImage.png"}
          alt="thumbnail"
          className="rounded-md object-cover"
        />
      </div>
      <div className="whitespace-pre-wrap break-words leading-relaxed">
        {content}
      </div>
      {userId === post.user.id && (
        <div className="flex items-center justify-end space-x-1">
          <Link href={`/post/${post.id}/edit`}>
            <div className="rounded-full p-2 hover:bg-gray-100">
              <Pencil className="size-5" />
            </div>
          </Link>
          <button
            className="rounded-full p-2 hover:bg-gray-100"
            disabled={isPending}
            onClick={handleDeletePost}
          >
            <Trash2 className="size-5 text-red-500" />
          </button>
        </div>
      )}
      {isSubscribedPost && (
        <div className="space-y-5 rounded-md bg-gradient-radial from-blue-500 to-sky-500 p-5 text-center text-white sm:p-10">
          <div>この記事の続きは有料会員になるとお読みいただけます。</div>
          <div className="inline-block">
            {userId ? (
              <Link href="/payment">
                <div className="w-[300px] rounded-md bg-white py-2 font-bold text-blue-500 shadow hover:bg-white/90">
                  有料プランを見る
                </div>
              </Link>
            ) : (
              <Link href="/login">
                <div className="w-[300px] rounded-md bg-white py-2 font-bold text-blue-500 shadow hover:bg-white/90">
                  ログインする
                </div>
              </Link>
            )}
          </div>
          <div className="text-xs">※いつでも解約可能です</div>
          <div className="font-bold">有料会員特典</div>
          <div className="text-sm">有料記事が読み放題</div>
        </div>
      )}
      <CommentDetail
        userId={userId}
        postId={post.id}
        comments={comments}
        pageCount={pageCount}
        totalComments={totalComments}
      />
    </div>
  );
};

export default PostDetail;
