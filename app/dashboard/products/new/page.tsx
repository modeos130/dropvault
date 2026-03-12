"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export default function NewProductPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", coverUrl: "", slug: "" });

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const slug = form.slug || generateSlug(form.name);
    const { error } = await supabase.from("products").insert({
      user_id: user.id,
      name: form.name,
      description: form.description,
      price: Math.round(parseFloat(form.price) * 100),
      cover_url: form.coverUrl || null,
      slug,
    });

    if (error) { alert(error.message); setLoading(false); return; }
    router.push("/dashboard/products");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Create Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" placeholder="My Awesome Product" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">dropvault.app/p/</span>
            <input type="text" required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none" placeholder="Describe your product..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
          <input type="number" required min="0.50" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" placeholder="9.99" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
          <input type="url" value={form.coverUrl} onChange={e => setForm({ ...form, coverUrl: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" placeholder="https://..." />
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 mb-1">Upload digital file</p>
          <p className="text-xs text-gray-400">Supabase Storage integration needed. Add file upload here.</p>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-brand-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-600 transition disabled:opacity-50">
            {loading ? "Creating..." : "Create Product"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition">Cancel</button>
        </div>
      </form>
    </div>
  );
}
