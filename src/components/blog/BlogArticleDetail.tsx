import { useEffect, useState } from "react";

type ApiResponse<T> = {
  isSuccess?: boolean;
  message?: string;
  data?: T | null;
  IsSuccess?: boolean;
  Message?: string;
  Data?: T | null;
};

type ArticleData = {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  seoTitle: string;
  metaDescription: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string | null;
};

type ArticleDataApi = Partial<ArticleData> & {
  Id?: string;
  Title?: string;
  Slug?: string;
  Content?: string;
  ImageUrl?: string;
  SeoTitle?: string;
  MetaDescription?: string;
  CategoryName?: string;
  CreatedAt?: string;
  UpdatedAt?: string | null;
};

const API_BASE_URL =
  "https://manuel-urbano-ayarza-c4b8d3cffkb0byd9.canadacentral-01.azurewebsites.net";

function normalizeImageUrl(imageUrl: string): string {
  if (!imageUrl) return "/logos/escuela.webp";

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("/") ||
    imageUrl.startsWith("data:image/")
  ) {
    return imageUrl;
  }

  return `${API_BASE_URL}/${imageUrl.replace(/^\/+/, "")}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-PA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizeArticleData(input: ArticleDataApi): ArticleData {
  return {
    id: input.id ?? input.Id ?? "",
    title: input.title ?? input.Title ?? "",
    slug: input.slug ?? input.Slug ?? "",
    content: input.content ?? input.Content ?? "",
    imageUrl: input.imageUrl ?? input.ImageUrl ?? "",
    seoTitle: input.seoTitle ?? input.SeoTitle ?? "",
    metaDescription: input.metaDescription ?? input.MetaDescription ?? "",
    categoryName: input.categoryName ?? input.CategoryName ?? "",
    createdAt: input.createdAt ?? input.CreatedAt ?? "",
    updatedAt: input.updatedAt ?? input.UpdatedAt ?? null,
  };
}

export default function BlogArticleDetail() {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("slug");

      if (!slug) {
        setError("No se encontró el slug del artículo en la URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Article/slug/${encodeURIComponent(slug)}`,
        );

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

        const payload = (await response.json()) as ApiResponse<ArticleDataApi>;
        const isSuccess = payload.isSuccess ?? payload.IsSuccess ?? false;
        const payloadData = payload.data ?? payload.Data ?? null;
        const message = payload.message ?? payload.Message ?? "No se pudo cargar el artículo.";

        if (!isSuccess || !payloadData) {
          throw new Error(message);
        }

        if (!cancelled) {
          setArticle(normalizeArticleData(payloadData));
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Error inesperado";
          setError(message);
          setArticle(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-gray-600">Cargando artículo...</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 text-red-700 p-4 border border-red-100">
        No se pudo cargar el artículo: {error}
      </div>
    );
  }

  if (!article) {
    return <p className="text-gray-600">Artículo no encontrado.</p>;
  }

  return (
    <article className="bg-white p-8 rounded-2xl shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-semibold">
          {article.categoryName}
        </span>
        <span className="text-gray-500 text-sm">{formatDate(article.createdAt)}</span>
      </div>

      <h1 className="font-bernoru font-bold text-4xl md:text-5xl text-primary mb-6">
        {article.title}
      </h1>

      <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
        <img
          className="w-full h-auto"
          src={normalizeImageUrl(article.imageUrl)}
          alt={article.title}
        />
      </div>

      <div
        className="max-w-none text-black leading-relaxed break-words [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_div]:text-black [&_em]:text-black [&_figcaption]:text-gray-600 [&_figcaption]:text-sm [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-black [&_h1]:my-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-black [&_h2]:my-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-black [&_h3]:my-3 [&_img]:rounded-xl [&_img]:my-6 [&_img]:w-full [&_li]:text-black [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:text-black [&_p]:my-4 [&_span]:text-black [&_strong]:text-black [&_table]:w-full [&_table]:my-6 [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:p-2 [&_ul]:list-disc [&_ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}
