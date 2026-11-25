import { readLocalUpload } from "@/server/integrations/storage/local";

// Serves images saved by the "local" storage provider. Unused once STORAGE_PROVIDER points to a CDN.
export async function GET(_request: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path } = await ctx.params;
  const file = await readLocalUpload(path);
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
