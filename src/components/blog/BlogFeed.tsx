import { useEffect, useMemo, useRef, useState } from "react";

type ApiResponse<T> = {
  isSuccess?: boolean;
  message?: string;
  data?: T | null;
  IsSuccess?: boolean;
  Message?: string;
  Data?: T | null;
};

type FeedItem = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  metaDescription: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string | null;
};

type FeedData = {
  items: FeedItem[];
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

type FeedItemApi = Partial<FeedItem> & {
  Id?: string;
  Title?: string;
  Slug?: string;
  ImageUrl?: string;
  MetaDescription?: string;
  CategoryName?: string;
  CreatedAt?: string;
  UpdatedAt?: string | null;
};

type FeedDataApi = Partial<FeedData> & {
  Items?: FeedItemApi[];
  Page?: number;
  PageSize?: number;
  HasNextPage?: boolean;
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
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeFeedData(input: FeedDataApi): FeedData {
  const rawItems = input.items ?? input.Items ?? [];

  return {
    items: rawItems.map((item) => ({
      id: item.id ?? item.Id ?? "",
      title: item.title ?? item.Title ?? "",
      slug: item.slug ?? item.Slug ?? "",
      imageUrl: item.imageUrl ?? item.ImageUrl ?? "",
      metaDescription: item.metaDescription ?? item.MetaDescription ?? "",
      categoryName: item.categoryName ?? item.CategoryName ?? "",
      createdAt: item.createdAt ?? item.CreatedAt ?? "",
      updatedAt: item.updatedAt ?? item.UpdatedAt ?? null,
    })),
    page: input.page ?? input.Page ?? 1,
    pageSize: input.pageSize ?? input.PageSize ?? 10,
    hasNextPage: input.hasNextPage ?? input.HasNextPage ?? false,
  };
}

export default function BlogFeed() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [reloadToken, setReloadToken] = useState(0);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleReload = () => {
    setError(null);
    setReloadToken((prev) => prev + 1);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const startedAt = Date.now();
      if (page === 1) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Article/feed?page=${page}&pageSize=${pageSize}`,
        );

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

        const payload = (await response.json()) as ApiResponse<FeedDataApi>;
        const isSuccess = payload.isSuccess ?? payload.IsSuccess ?? false;
        const payloadData = payload.data ?? payload.Data ?? null;
        const message = payload.message ?? payload.Message ?? "No se pudo cargar el feed.";

        if (!isSuccess || !payloadData) {
          throw new Error(message);
        }

        const normalized = normalizeFeedData(payloadData);

        if (!cancelled) {
          setItems((prev) => {
            if (page === 1) return normalized.items;

            const existing = new Set(prev.map((x) => x.id));
            const nextItems = normalized.items.filter((x) => !existing.has(x.id));
            return [...prev, ...nextItems];
          });
          setHasNextPage(normalized.hasNextPage);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Error inesperado";
          setError(message);
        }
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 800 - elapsed);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }

        if (!cancelled) {
          setLoadingInitial(false);
          setLoadingMore(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, reloadToken]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (loadingInitial || loadingMore || !hasNextPage || error) return;

        setPage((prev) => prev + 1);
      },
      {
        root: null,
        rootMargin: "250px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadingInitial, loadingMore, hasNextPage, error]);

  const empty = useMemo(() => !loadingInitial && items.length === 0, [items.length, loadingInitial]);

  if (loadingInitial) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`skeleton-${idx}`}
            className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
          >
            <div className="h-56 w-full bg-slate-200" />
            <div className="p-5">
              <div className="h-6 w-28 bg-slate-200 rounded-full mb-4" />
              <div className="h-7 w-4/5 bg-slate-200 rounded mb-3" />
              <div className="h-4 w-full bg-slate-200 rounded mb-2" />
              <div className="h-4 w-2/3 bg-slate-200 rounded mb-6" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="rounded-xl bg-red-50 text-red-700 p-5 border border-red-100">
        <p className="text-center">No se pudo cargar el feed: {error}</p>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleReload}
            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-100"
          >
            Volver a cargar
          </button>
        </div>
      </div>
    );
  }

  if (empty) {
    return <p className="text-gray-600">No hay artículos publicados todavía.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((post) => (
          <a
            key={post.id}
            href={`/blog/articulo?slug=${encodeURIComponent(post.slug)}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full"
          >
            <div className="w-full h-56 overflow-hidden">
              <img
                src={normalizeImageUrl(post.imageUrl)}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-5 flex flex-col justify-between flex-1">
              <div>
                <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold mb-3">
                  {post.categoryName}
                </span>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.metaDescription || "Leer artículo completo"}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-gray-400 text-sm">{formatDate(post.createdAt)}</span>
                <span className="text-blue-600 font-semibold group-hover:underline text-sm">
                  Leer más →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {error && items.length > 0 && (
        <div className="rounded-xl bg-red-50 text-red-700 p-5 border border-red-100">
          <p className="text-center">No se pudieron cargar más artículos: {error}</p>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleReload}
              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-100"
            >
              Volver a cargar
            </button>
          </div>
        </div>
      )}

      <div ref={sentinelRef} className="h-4" aria-hidden="true" />

      {loadingMore && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`skeleton-more-${idx}`}
              className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
            >
              <div className="h-40 w-full bg-slate-200" />
              <div className="p-5">
                <div className="h-5 w-24 bg-slate-200 rounded-full mb-3" />
                <div className="h-5 w-3/4 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-full bg-slate-200 rounded mb-5" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
      {!hasNextPage && <p className="text-gray-400 text-sm text-center">No hay más artículos.</p>}
    </div>
  );
}
