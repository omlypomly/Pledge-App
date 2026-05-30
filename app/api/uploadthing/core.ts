import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

async function handleAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return { userId };
}

export const uploadRouter = {
  milestoneProof: f({
    image: { maxFileSize: "16MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 2 },
    pdf: { maxFileSize: "8MB", maxFileCount: 3 },
  })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", file.url, "by", metadata.userId);
      return { url: file.url };
    }),

  challengeCover: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),

  profileAvatar: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
