"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ImageUpLoading, { ImageListType } from "react-images-uploading";
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
import { Loader2 } from "lucide-react";

//入力データの検証ルールを定義
const schema = z.object({
  name: z.string().min(2, { message: "2文字以上入力する必要があります" }),
  introduction: z.string().optional(),
});

//入力データの型を定義
type InputType = z.infer<typeof schema>;

interface ProfileProps {
  user: User;
}

const Profile = ({ user }: ProfileProps) => {
  const router = useRouter();
  const [imageUpload, setImageUpload] = useState<ImageListType>([
    { dataURL: user.image || "/default.png" },
  ]);

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || "",
      introduction: user.introduction || "",
    },
  });

  //プロフィール編集
  const { mutate: updateUser, isPending } = trpc.user.updateUser.useMutation({
    onSuccess: () => {
      toast.success("プロフィールを編集しました");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
      console.error(error);
    },
  });

  const onSubmit: SubmitHandler<InputType> = (data) => {
    let base64Image;

    if (
      imageUpload[0].dataURL &&
      imageUpload[0].dataURL.startsWith("data:image")
    ) {
      base64Image = imageUpload[0].dataURL;
    }

    updateUser({
      name: data.name,
      introduction: data.introduction,
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
      <div className="text-xl font-bold text-center mb-5">プロフィール</div>
      <Form {...form}>
        <div className="mb-5">
          <ImageUpLoading
            value={imageUpload}
            onChange={onChangeImage}
            maxNumber={1}
            acceptType={["jpg", "png", "jpeg"]}
          >
            {({ imageList, onImageUpdate }) => (
              <div className="w-full flex flex-col items-center justify-center">
                {imageList.map((image, index) => (
                  <div key={index}>
                    {image.dataURL && (
                      <div className="w-24 h-24 relative">
                        <Image
                          fill
                          src={image.dataURL as string}
                          alt={user.name || "avatar"}
                          className="rounded-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
                {imageList.length > 0 && (
                  <div className="text-center mt-3">
                    <Button variant="outline" onClick={() => onImageUpdate(0)}>
                      アバターの変更
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ImageUpLoading>
        </div>
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
          <FormItem>
            <FormLabel>メールアドレス</FormLabel>
            <Input value={user.email!} disabled />
            <FormMessage />
          </FormItem>
          <FormField
            control={form.control}
            name="introduction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>自己紹介</FormLabel>
                <FormControl>
                  <Textarea placeholder="自己紹介" {...field} rows={10} />
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

export default Profile;
