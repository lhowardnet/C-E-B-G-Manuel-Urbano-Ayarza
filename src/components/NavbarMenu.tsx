import { useEffect, useState, useRef, type MouseEventHandler } from "react";
import { navigate } from "astro:transitions/client";
interface NavbarMenuProps {
  IsOpen?: boolean;
}

export default function NavbarMenu(props: NavbarMenuProps) {
  const cancelResize = useRef<NodeJS.Timeout | null>(null);
  const body = useRef<HTMLBodyElement | null>(null);
  const html = useRef<HTMLHtmlElement | null>(null);
  const menu = useRef<HTMLUListElement | null>(null);
  const anchors = useRef<HTMLAnchorElement[]>([]);

  // ----------------------------------------------Estados-------------------------------------------------------

  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [currentPath, setCurrentPath] = useState("");
  const [isOpen, setIsOpen] = useState(props.IsOpen);

  // -----------------------------------------------Efectos-----------------------------------------------

  useEffect(() => {
    body.current = window.document.querySelector("body");
    html.current = window.document.querySelector("html");

    anchors.current = Array.from(menu.current.querySelectorAll("a"));

    const handlePageLoad = () => setCurrentPath(window.location.pathname);
    document.addEventListener("astro:page-load", handlePageLoad);

    const initialWidth = window.innerWidth;
    setWindowWidth(initialWidth);
    setIsOpen(initialWidth > 1024);

    const handleResize = () => {
      clearTimeout(cancelResize.current);
      cancelResize.current = setTimeout(() => onResize(window.innerWidth), 60);
    };

    window.addEventListener("load", () => onResize(window.innerWidth));
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("load", () => onResize(window.innerWidth));
      document.removeEventListener("astro:page-load", handlePageLoad);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (props.IsOpen === undefined) return;

    setIsOpen(props.IsOpen);
    navigationToggleClickHandler();
  }, [props.IsOpen]);

  // -----------------------------------------------Funciones----------------------------------------------------------------------------------------------------

  const getLinkClasses = (path: string): string => {
    const baseClasses =
      "rounded-2xl p-2 min-w-auto lg:min-w-[130px] max-w-auto lg:max-w-[130px] w-full lg:w-[130px] flex justify-center items-center font-bold transition duration-150 hover:animate-menu-link-hover";
    const hoverClasses = "hover:bg-secondary hover:text-primary";

    // Aplica estilos 'activos' si la ruta coincide
    const activeClasses =
      currentPath === path ? "bg-secondary text-primary" : "text-white";

    return `${baseClasses} ${hoverClasses} ${activeClasses}`;
  };

  const onResize = (size: number) => {
    if (windowWidth === size) {
      return;
    }

    setWindowWidth(size);

    // Para pantallas pequeñas, ocultar el menú y cerrarlo
    if (size <= 1024) {
      setIsOpen(false);
      activeScroll();
    } else {
      // Para pantallas grandes, mostrar el menú y abrirlo
      setIsOpen(true);
    }
  };

  const navigationToggleClickHandler = () => {
    if (isOpen) {
      //Cerrar menu
      setIsOpen(false);
      activeScroll();
    } else {
      //Abrir menu
      setIsOpen(true);
      disableScroll();
    }
  };

  const linkClickHandler: MouseEventHandler<HTMLAnchorElement> = async (
    event
  ) => {
    event.preventDefault();

    const href = event.currentTarget.getAttribute("href");

    if (windowWidth <= 1024) {
      setIsOpen(false);
      activeScroll();
    }

    setCurrentPath(href);
    navigate(href, { history: "push" });
  };

  const activeScroll = () => {
    body.current.style.overflow = "auto";
    html.current.style.overflow = "auto";
  };

  const disableScroll = () => {
    body.current.style.overflow = "hidden";
    html.current.style.overflow = "hidden";
  };

  const menuClasses = () => {
    let baseClasses =
      "flex gap-x-[10px] gap-y-[10px] lg:gap-y-[0px] w-full h-[calc(100dvh-var(--size-navbar-height))] bg-primary absolute z-50 top-[var(--size-navbar-height)] left-0 shadow-lg lg:h-auto lg:w-auto lg:bg-primary/50 lg:px-6 lg:py-2 rounded-4xl lg:static lg:top-0 lg:left-0 lg:z-auto lg:px-0 lg:py-0 lg:shadow-none";

    // Ocultar el menú en pantallas pequeñas si no está abierto
    if (!isOpen && windowWidth <= 1024) {
      baseClasses += " hidden";
      return baseClasses;
    }

    // Mostrar el menú en fila en pantallas grandes si está abierto
    if (isOpen && windowWidth > 1024) {
      baseClasses += " lg:flex-row";
      return baseClasses;
    }

    // Mostrar el menú en columna en pantallas pequeñas si esta abierto
    if (isOpen && windowWidth <= 1024) {
      baseClasses += " flex-col";
      return baseClasses;
    }
  };

  return (
   
      <ul ref={menu} className={menuClasses()}>
        <li className="w-full lg:w-auto">
          <a
            onClick={linkClickHandler}
            className={getLinkClasses("/")}
            href="/"
          >
            Inicio
          </a>
        </li>
        <li className="w-full lg:w-auto">
          <a
            onClick={linkClickHandler}
            className={getLinkClasses("/about")}
            href="/about"
          >
            Acerca de
          </a>
        </li>
        <li className="relative w-full lg:w-auto">
          <a
            onClick={linkClickHandler}
            className={getLinkClasses("/robotics")}
            href="/robotics"
          >
            Robótica
          </a>
        </li>
      </ul>
  );
}
