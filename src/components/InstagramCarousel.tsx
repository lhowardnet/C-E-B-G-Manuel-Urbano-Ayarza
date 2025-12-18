import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

interface Post {
  id: string;
  timestamp: string;
  permalink: string;
  mediaType: string;
  isReel: boolean;
  mediaUrl: string;
  thumbnailUrl: string;
  sizes: {
    small: { mediaUrl: string; height: number; width: number };
    medium: { mediaUrl: string; height: number; width: number };
    large: { mediaUrl: string; height: number; width: number };
    full: { mediaUrl: string; height: number; width: number };
  };
  caption: string;
  colorPalette: {
    dominant: string;
    muted: string;
    mutedLight: string;
    mutedDark: string;
    vibrant: string;
    vibrantLight: string;
    vibrantDark: string;
  };
}

export default function InstagramCarousel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "https://feeds.behold.so/MfLk7E1RITtwXD9TMfI4"
        );
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError("Error cargando los posts de Instagram");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="w-full max-w-4xl mx-auto"
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              1024: {
                slidesPerView: 1.5,
              },
            }}
          >
        {posts.map((post) => (
          <SwiperSlide key={post.id} className="flex items-center justify-center">
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-fit rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2"
            >

              {/* Imagen/Thumbnail */}
              <div className="relative h-96 overflow-hidden bg-gray-900">
                <img
                  src={post.sizes.large.mediaUrl}
                  alt={post.caption || "Instagram post"}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Overlay oscuro en hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  {/* Play button para videos */}
                  {post.mediaType === "VIDEO" && (
                    <svg
                      className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Info card */}
              <div className="relative bg-secondary p-6 text-primary">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/80 backdrop-blur">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {post.mediaType === "VIDEO" ? (
                        <path d="M8 5v14l11-7z" />
                      ) : (
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      )}
                    </svg>
                    {post.isReel ? "Reel" : post.mediaType}
                  </span>
                  <span className="text-xs text-primary">
                    {formatDate(post.timestamp)}
                  </span>
                </div>

                {post.caption && (
                  <>
                  <hr className="bg-primary"/>
                  <p className="text-sm line-clamp-2 mb-3 text-primary">
                    {post.caption}
                  </p>
                  </>
                )}
              </div>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
  );
}
