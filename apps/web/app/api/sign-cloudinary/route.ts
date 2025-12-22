import { config } from "@/config";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp: timestamp,
    folder: "user_uploads",
  };
  console.log(req?.url);
  const signature = cloudinary.utils.api_sign_request(
    params,
    config.cloudinary.api_secret!
  );
  return NextResponse.json({
    signature,
    timestamp,
    apiKey: config.cloudinary.api_key,
    cloudName: config.cloudinary.cloud_name,
  });
}
