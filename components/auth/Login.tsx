"use client";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
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

//入力データの検証ルールを定義
const schema = z.object({
  email: z.string().email({ message: "メールアドレスの形式ではありません" }),
  password: z.string().min(8, { message: "8文字以上入力する必要があります" }),
});

//入力データの型を定義
type InputType = z.infer<typeof schema>;

const Login = () => {
  const router = useRouter();
  const [isLoading, setIsloading] = useState(false);

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleSignup = async () => {
    try {
      const result = await signIn("google", { callbackUrl: "/" });

      if (result?.error) {
        toast.error("ログインに失敗しました");
      }
    } catch (error) {
      toast.error("ログインに失敗しました");
    }
  };

  const onSubmit: SubmitHandler<InputType> = async (data) => {
    setIsloading(true);

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("ログインに失敗しました");
        return;
      }

      toast.success("ログインに成功しました");
      router.refresh();
      router.push("/");
    } catch (error) {
      toast.error("ログインに失敗しました");
    } finally {
      setIsloading(false);
    }
  };

  return (
    <div className="m-auto max-w-[400px]">
      <div className="text2xl mb-10 items-center text-center font-bold">
        ログイン
      </div>
      <Button variant="outline" className="w-full" onClick={handleGoogleSignup}>
        <FcGoogle className="mr-2 size-4" />
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
          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            ログイン
          </Button>
        </form>
      </Form>
      <div className="mt-5 text-center">
        <Link href="/reset-password" className="text-sm text-blue-500">
          パスワードを忘れた方
        </Link>
      </div>
      <div className="mt-2 text-center">
        <Link href="/login" className="text-sm text-blue-500">
          アカウントを作成する
        </Link>
      </div>
    </div>
  );
};

export default Login;
