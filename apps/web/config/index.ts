export const config = {
  node_env: process.env.NODE_ENV,
  client_url: process.env.NEXT_PUBLIC_CLIENT_URL,
  server_url: process.env.NEXT_PUBLIC_SERVER_URL,
  better_auth_key: process.env.BETTER_AUTH_TOKEN_KEY,
  vapi_workflow_id: process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,
  vapi_public_key: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    api_key: process.env.CLOUDINARY_API_KEY,
  },
};
