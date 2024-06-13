"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
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

//入力データの検証ルールを定義
const schema = z.object({
  name: z.string().min(2, { message: "2文字以上入力する必要があります" }),
  email: z.string().email({ message: "メールアドレスの形式ではありません" }),
  password: z.string().min(8, { message: "8文字以上入力する必要があります" }),
});

//入力データの型を定義
type InputType = z.infer<typeof schema>;

const Signup = () => {
  const router = useRouter();

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleGoogleSignup = async () => {
    try {
      const result = await signIn("google", { callbackUrl: "/" });

      if (result?.error) {
        toast.error("アカウント作成に失敗しました");
      }
    } catch (error) {
      toast.error("アカウント作成に失敗しました");
    }
  };

  //サインアップ
  const { mutate: signUp, isPending } = trpc.auth.signUp.useMutation({
    onSuccess: () => {
      toast.success("アカウント作成に成功しました!");

      signIn("credentials", {
        email: form.getValues("email"),
        password: form.getValues("password"),
        callbackUrl: "/",
      });

      router.refresh();
    },
    onError: (error) => {
      toast.error("アカウント作成に失敗しました");
      console.error(error);
    },
  });

  const onSubmit: SubmitHandler<InputType> = (data) => {
    signUp(data);
  };

  return (
    <div className="max-w-[400px] m-auto">
      <div className="text2xl font-bold text-center items-center mb-10">
        新規登録
      </div>
      <Button variant="outline" className="w-full" onClick={handleGoogleSignup}>
        <FcGoogle className="mr-2 h-4 w-4" />
        Googleアカウント
      </Button>
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-muted-foreground">OR</span>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>名前</FormLabel>
                <FormControl>
                  <Input placeholder="名前" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input placeholder="xxx@gmail.com" {...field} />
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
                <FormLabel>パスワード</FormLabel>
                <FormControl>
                  <Input placeholder="password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="text-sm text-gray-500">
            サインアップすることで、利用規約、プライバシーポリシーに同意したことになります。
          </div>
          <Button disabled={isPending} type="submit" className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            アカウント作成
          </Button>
        </form>
      </Form>
      <div className="text-center mt-5">
        <Link href="/login" className="text-sm text-blue-500">
          すでにアカウントをお持ちの方
        </Link>
      </div>
    </div>
  );
};

export default Signup;
