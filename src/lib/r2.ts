import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

function isR2Configured(): boolean {
  return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME);
}

function hasPublicUrl(): boolean {
  return !!(R2_PUBLIC_URL && !R2_PUBLIC_URL.includes("cloudflarestorage.com"));
}

function getPublicUrl(key: string): string {
  if (hasPublicUrl()) {
    const base = R2_PUBLIC_URL.replace(/\/$/, "");
    return `${base}/${key}`;
  }
  return `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`;
}

export async function uploadToR2(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "products",
): Promise<string> {
  const key = `${folder}/${fileName}`;

  if (!isR2Configured()) {
    throw new Error("R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in .env");
  }

  if (!hasPublicUrl()) {
    console.warn(
      "[r2] R2_PUBLIC_URL is not set — uploaded objects will not be browser-accessible. " +
        "Enable public access on the bucket in Cloudflare dashboard and set R2_PUBLIC_URL in .env.",
    );
  }

  const client = getR2Client();

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
  } catch (err) {
    const e = err as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } };
    console.error("[r2] PutObject failed", {
      bucket: R2_BUCKET_NAME,
      key,
      name: e.name,
      message: e.message,
      httpStatusCode: e.$metadata?.httpStatusCode,
    });
    throw new Error(`R2 upload failed: ${e.name || "Unknown"} — ${e.message || "no message"}`);
  }

  return getPublicUrl(key);
}

export async function deleteFromR2(url: string): Promise<void> {
  if (!isR2Configured()) return;

  let key = url;
  if (R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL)) {
    key = url.replace(`${R2_PUBLIC_URL.replace(/\/$/, "")}/`, "");
  }
  if (url.startsWith(R2_ENDPOINT)) {
    key = url.replace(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/`, "");
  }

  const client = getR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    }),
  );
}

export { isR2Configured };
