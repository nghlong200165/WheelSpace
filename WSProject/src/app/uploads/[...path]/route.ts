import { readUpload } from "@/server/services/storage";

export async function GET(_request: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path } = await ctx.params;
  const file = await readUpload(path);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType,
      // File names are random UUIDs and never reused, so they can be cached forever.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
