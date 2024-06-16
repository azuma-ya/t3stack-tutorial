"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import type { ImageListType } from "react-images-uploading";
import ImageUploading from "react-images-uploading";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/react";
import Image from "next/image";

//入力データの検証ルールを定義
const schema = z.object({
  title: z.string().min(3, { message: "3文字以上入力する必要があります" }),
  content: z.string().min(3, { message: "3文字以上入力する必要があります" }),
  premium: z.boolean(),
});

//入力データの型を定義
type InputType = z.infer<typeof schema>;

const PostNew = () => {
  const router = useRouter();
  const [imageUpload, setImageUpload] = useState<ImageListType>([]);

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      premium: false,
    },
  });

  const { mutate: createPost, isPending } = trpc.post.createPost.useMutation({
    onSuccess: ({ id }) => {
      toast.success("投稿しました");
      router.refresh();
      router.push(`/post/${id}`);
    },
    onError: (error) => {
      toast.error(error.message);
      console.error(error);
    },
  });

  const onSubmit: SubmitHandler<InputType> = (data) => {
    let base64Image;

    if (imageUpload[0]?.dataURL) {
      base64Image = imageUpload[0].dataURL;
    }

    createPost({
      title: data.title,
      content: data.content,
      base64Image,
      premium: data.premium,
    });
  };

  const onChangeImage = (imageList: ImageListType) => {
    const file = imageList[0]?.file;
    const maxFileSize = 5 * 1024 * 1014;

    if (file && file.size > maxFileSize) {
      toast.error("ファイルサイズは5MBを超えることはできません");
      return;
    }

    setImageUpload(imageList);
  };

  return (
    <div>
      <div className="mb-5 text-center text-2xl font-bold">新規投稿</div>
      <Form {...form}>
        <div className="mb-3">
          <FormLabel>サムネイル</FormLabel>
          <div className="mt-2">
            <ImageUploading
              value={imageUpload}
              onChange={onChangeImage}
              maxNumber={1}
              acceptType={["jpg", "png", "jpeg"]}
            >
              {({ imageList, onImageUpdate, onImageUpload }) => (
                <div className="w-full">
                  {imageList.length === 0 && (
                    <button
                      onClick={onImageUpload}
                      className="mb-3 h-32 w-full rounded-md border-2 border-dashed hover:bg-gray-50"
                    >
                      <div className="mb-2 font-bold text-gray-400">
                        ファイル選択またはドラッグ＆ドロップ
                      </div>
                      <div className="text-xs text-gray-400">
                        ファイル形式：jpg / jpeg / png
                      </div>
                      <div className="text-xs text-gray-400">
                        ファイルサイズ：5MBまで
                      </div>
                    </button>
                  )}
                  {imageList.map((image, index) => (
                    <div key={index}>
                      {image.dataURL && (
                        <div className="relative aspect-[16/9]">
                          <Image
                            fill
                            src={image.dataURL}
                            alt="thumbnail"
                            className="runded-md object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {imageList.length > 0 && (
                    <div className="mt-3 text-center">
                      <Button
                        variant="outline"
                        onClick={() => onImageUpdate(0)}
                      >
                        画像を変更
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </ImageUploading>
          </div>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タイトル</FormLabel>
                <FormControl>
                  <Input placeholder="title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>内容</FormLabel>
                <FormControl>
                  <Textarea placeholder="content" {...field} rows={15} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="premium"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-5 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-2 leading-none">
                  <FormLabel>有料会員限定</FormLabel>
                  <FormDescription>
                    有料会員のみが閲覧できるようにする
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <Button disabled={isPending} type="submit" className="w-full">
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            投稿
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PostNew;
