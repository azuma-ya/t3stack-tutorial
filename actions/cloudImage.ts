import { TRPCError } from "@trpc/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createCloudImage = async (base64Image: string) => {
  try {
    const imageResponse = await cloudinary.uploader.upload(base64Image, {
      resource_type: "image",
      folder: "t3stack-tutorial",
    });

    return imageResponse.secure_url;
  } catch (error) {
    console.log(error);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "画像のアップロードに失敗しました",
    });
  }
};

export const deleteCloudImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "画像の削除に失敗しました",
    });
  }
};
