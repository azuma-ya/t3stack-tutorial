"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import ImageUploading, { ImageListType } from "react-images-uploading";
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
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/react";
import Image from "next/image";

//入力データの検証ルールを定義
const schema = z.object({
  title: z.string().min(3, { message: "3文字以上入力する必要があります" }),
  content: z.string().min(3, { message: "3文字以上入力する必要があります" }),
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
      <div className="text-2xl font-bold text-center mb-5">新規投稿</div>
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
              {({ imageList, onImageUpdate, onImageUpload, dragProps }) => (
                <div className="w-full">
                  {imageList.length === 0 && (
                    <button
                      onClick={onImageUpload}
                      className="w-full border-2 border-dashed rounded-md h-32 hover:bg-gray-50 mb-3"
                    >
                      <div className="text-gray-400 font-bold mb-2">
                        ファイル選択またはドラッグ＆ドロップ
                      </div>
                      <div className="text-gray-400 text-xs">
                        ファイル形式：jpg / jpeg / png
                      </div>
                      <div className="text-gray-400 text-xs">
                        ファイルサイズ：5MBまで
                      </div>
                    </button>
                  )}
                  {imageList.map((image, index) => (
                    <div key={index}>
                      {image.dataURL && (
                        <div className="aspect-[16/9] relative">
                          <Image
                            fill
                            src={image.dataURL}
                            alt="thumbnail"
                            className="object-cover runded-md"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {imageList.length > 0 && (
                    <div className="text-center mt-3">
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
          <Button disabled={isPending} type="submit" className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            投稿
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PostNew;
