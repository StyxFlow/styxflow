import { config } from "@/config";
import { v2 as cloudinary } from "cloudinary";
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp: timestamp,
    folder: "user_uploads", // Optional: Organize files in a folder
  };
  const signature = cloudinary.utils.api_sign_request(
    params,
    config.cloudinary.api_secret!
  );
  res.status(200).json({
    signature,
    timestamp,
    apiKey: config.cloudinary.api_key,
    cloudName: config.cloudinary.cloud_name,
  });
}
