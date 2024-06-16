"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/react";
import type { Comment } from "@prisma/client";

//入力データの検証ルールを定義
const schema = z.object({
  content: z.string().min(3, { message: "3文字以上入力する必要があります" }),
});

//入力データの型を定義
type InputType = z.infer<typeof schema>;

interface CommentEditProps {
  comment: Comment;
}

const CommentEdit = ({ comment }: CommentEditProps) => {
  const router = useRouter();

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: comment.content || "",
    },
  });

  const { mutate: updateComment, isPending } =
    trpc.comment.updateComment.useMutation({
      onSuccess: ({ postId }) => {
        toast.success("コメントを編集しました");
        router.refresh();
        router.push(`/post/${postId}`);
      },
      onError: (error) => {
        toast.error(error.message);
        console.error(error);
      },
    });

  const onSubmit: SubmitHandler<InputType> = (data) => {
    updateComment({
      commentId: comment.id,
      content: data.content,
    });
  };
  return (
    <div>
      <div className="mb-5 text-center text-2xl font-bold">コメント編集</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="comment"
                    {...field}
                    rows={10}
                    className="bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isPending} type="submit" className="w-full">
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            編集
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CommentEdit;
