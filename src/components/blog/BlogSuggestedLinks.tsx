import { useEffect, useMemo, useState } from "react";

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
};

type FeedItemApi = Partial<FeedItem> & {
  Id?: string;
  Title?: string;
  Slug?: string;
};

type FeedDataApi = {
  items?: FeedItemApi[];
  Items?: FeedItemApi[];
};

const API_BASE_URL =
  "https://manuel-urbano-ayarza-c4b8d3cffkb0byd9.canadacentral-01.azurewebsites.net";

function normalizeItems(input: FeedDataApi | null | undefined): FeedItem[] {
  if (!input) return [];

  const rawItems = input.items ?? input.Items ?? [];

  return rawItems
    .map((item) => ({
      id: item.id ?? item.Id ?? "",
      title: item.title ?? item.Title ?? "",
      slug: item.slug ?? item.Slug ?? "",
    }))
    .filter((x) => x.slug && x.title);
}

export default function BlogSuggestedLinks() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Article/feed?page=1&pageSize=8`,
        );

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

        const payload = (await response.json()) as ApiResponse<FeedDataApi>;
        const isSuccess = payload.isSuccess ?? payload.IsSuccess ?? false;
        const payloadData = payload.data ?? payload.Data ?? null;

        if (!isSuccess || !payloadData) {
          throw new Error(payload.message ?? payload.Message ?? "Error cargando sugeridos");
        }

        if (!cancelled) {
          setItems(normalizeItems(payloadData));
        }
      } catch {
        if (!cancelled) {
          setItems([]);
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

  const suggestedItems = useMemo(() => {
    const currentSlug =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("slug")
        : null;

    return items
      .filter((x) => x.slug !== currentSlug)
      .slice(0, 5);
  }, [items]);

  return (
    <ul className="space-y-2">
      {loading &&
        Array.from({ length: 5 }).map((_, idx) => (
          <li key={`sk-${idx}`} className="animate-pulse">
            <div className="h-6 w-full rounded bg-primary/10" />
          </li>
        ))}

      {!loading && suggestedItems.length === 0 && (
        <li>
          <span className="text-primary/70 text-base">No hay sugerencias por ahora.</span>
        </li>
      )}

      {!loading &&
        suggestedItems.map((item) => (
          <li key={item.id || item.slug}>
            <a
              href={`/blog/articulo?slug=${encodeURIComponent(item.slug)}`}
              className="text-primary text-lg transition-colors"
            >
              › {item.title}
            </a>
          </li>
        ))}
    </ul>
  );
}
