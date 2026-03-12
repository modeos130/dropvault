import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, products(*)")
    .eq("download_token", params.token)
    .single();

  if (!order) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  if (new Date(order.expires_at) < new Date()) {
    return NextResponse.json({ error: "Download expired" }, { status: 410 });
  }
  if (order.download_count >= order.max_downloads) {
    return NextResponse.json({ error: "Download limit reached" }, { status: 410 });
  }

  const product = order.products as any;
  if (!product?.file_path) {
    return NextResponse.json({ error: "File not available" }, { status: 404 });
  }

  // Increment download count
  await supabase.from("orders").update({ download_count: order.download_count + 1 }).eq("id", order.id);

  // Generate signed URL from Supabase Storage
  const { data: signedUrl } = await supabase.storage
    .from("products")
    .createSignedUrl(product.file_path, 60);

  if (!signedUrl?.signedUrl) {
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
  }

  return NextResponse.redirect(signedUrl.signedUrl);
}
