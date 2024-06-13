"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
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

//入力データの検証ルールを定義
const schema = z.object({
  content: z.string().min(3, { message: "3文字以上入力する必要があります" }),
});

//入力データの型を定義
type InputType = z.infer<typeof schema>;

interface CommentNewProps {
  userId?: string;
  postId: string;
}

const CommentNew = ({ userId, postId }: CommentNewProps) => {
  const router = useRouter();

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: "",
    },
  });

  const { mutate: createComment, isPending } =
    trpc.comment.createComment.useMutation({
      onSuccess: () => {
        toast.success("投稿しました");
        form.reset();
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
        console.error(error);
      },
    });

  const onSubmit: SubmitHandler<InputType> = (data) => {
    createComment({
      postId,
      content: data.content,
    });
  };

  return (
    <div className="border rounded-md p-2 sm:p-5 bg-gray-50">
      <div className="text-sm font-bold mb-2 sm:mb-5">コメントする</div>
      {userId ? (
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
                      rows={5}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} type="submit" className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              投稿
            </Button>
          </form>
        </Form>
      ) : (
        <div className="text-center text-sm text-gray-500 my-10">
          コメントするには
          <Link href="/login" className="underline text-sky-500">
            ログイン
          </Link>
          してください
        </div>
      )}
    </div>
  );
};

export default CommentNew;
