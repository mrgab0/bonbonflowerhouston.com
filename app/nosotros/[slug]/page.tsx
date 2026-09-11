import { getPostBySlug } from "@/lib/actions/post";
import { BlogPostDetail } from "@/components/shop/BlogPostDetail";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPostBySlug(slug);

  if (!res.success || !res.data) {
    return {
      title: "Artículo no encontrado | Gabriela's Flowers LLC",
      description: "El artículo solicitado no fue encontrado en Gabriela's Flowers."
    };
  }

  const post = res.data;

  return {
    title: `${post.title} | Gabriela's Flowers LLC`,
    description: post.excerpt || post.title,
    openGraph: {
      title: `${post.title} | Gabriela's Flowers`,
      description: post.excerpt || post.title,
      type: "article",
      publishedTime: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
      images: [post.mainImage || "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200"]
    }
  };
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getPostBySlug(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  return <BlogPostDetail post={res.data} locale="es" />;
}
