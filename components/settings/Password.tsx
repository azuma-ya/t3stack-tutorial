"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/react";
import { Loader2 } from "lucide-react";

//入力データの検証ルールを定義
const schema = z
  .object({
    currentPassword: z
      .string()
      .min(8, { message: "8文字以上入力する必要があります" }),
    password: z.string().min(8, { message: "8文字以上入力する必要があります" }),
    repeatedPassword: z
      .string()
      .min(8, { message: "8文字以上入力する必要があります" }),
  })
  .refine((data) => data.password === data.repeatedPassword, {
    message: "新しいパスワードと確認用パスワードが一致しません",
    path: ["repeatedPassword"],
  });

//入力データの型を定義
type InputType = z.infer<typeof schema>;

const Password = () => {
  const router = useRouter();

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      password: "",
      repeatedPassword: "",
    },
  });

  const { mutate: updatePassword, isPending } =
    trpc.auth.updatePassword.useMutation({
      onSuccess: () => {
        form.reset();
        toast.success("パスワードを変更しました");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
        console.error(error);
      },
    });

  const onSubmit: SubmitHandler<InputType> = (data) => {
    updatePassword({
      currentPassword: data.currentPassword,
      password: data.password,
    });
  };

  return (
    <div>
      <div className="text-xl font-bold text-center mb-5">プロフィール</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>現在のパスワード</FormLabel>
                <FormControl>
                  <Input placeholder="password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>新しいパスワード</FormLabel>
                <FormControl>
                  <Input placeholder="password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="repeatedPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>新しいパスワード(確認用)</FormLabel>
                <FormControl>
                  <Input placeholder="password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isPending} type="submit" className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            変更
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Password;
