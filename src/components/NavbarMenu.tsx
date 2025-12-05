import { useEffect, useState, useRef, type MouseEventHandler} from "react";
import {navigate} from "astro:transitions/client";
interface NavbarMenuProps {

  IsOpen ?: boolean;

}

export default function NavbarMenu(props: NavbarMenuProps) {

      const cancelResize = useRef<NodeJS.Timeout | null>(null);
      const menuContainer = useRef<HTMLDivElement | null>(null);
      const menu  = useRef<HTMLUListElement | null>(null); 
      const anchors = useRef<HTMLAnchorElement[]>([]);

 // ----------------------------------------------Estados-------------------------------------------------------
 
      const [windowWidth, setWindowWidth] = useState<number>(0);
      const [currentPath,setCurrentPath] = useState("/");
      const [isOpen, setIsOpen] = useState(props.IsOpen);
      
 // -----------------------------------------------Efectos-----------------------------------------------

        useEffect(() => {

          
          anchors.current = Array.from(menu.current.querySelectorAll("a"));

          const handlePageLoad = ()=> setCurrentPath(window.location.pathname);
          document.addEventListener("astro:page-load", handlePageLoad);

          setWindowWidth(window.innerWidth);

          const handleResize = ()=> {

           clearTimeout(cancelResize.current);
           cancelResize.current = setTimeout(()=> onResize(window.innerWidth), 60);

          } 

          window.addEventListener("load",()=>  onResize(window.innerWidth));
          window.addEventListener("resize", handleResize);

          return()=>{
            

            window.removeEventListener("load",()=>  onResize(window.innerWidth));
            document.removeEventListener("astro:page-load", handlePageLoad);
            window.removeEventListener("resize", handleResize );
          } 
        }, []); 

        useEffect(()=> {

          if(props.IsOpen === undefined)
            return; 

            setIsOpen(props.IsOpen);
            navigationToggleClickHandler();

        },[props.IsOpen]); 

  // -----------------------------------------------Funciones----------------------------------------------------------------------------------------------------

        const getLinkClasses = (path: string): string => {
          const baseClasses =
          "rounded-xl p-2 min-w-auto lg:min-w-[130px] max-w-auto lg:max-w-[130px] w-full lg:w-[130px] flex justify-center items-center font-bold transition duration-150 hover:animate-menu-link-hover";
          const hoverClasses = "hover:bg-secondary hover:text-primary";

          // Aplica estilos 'activos' si la ruta coincide
          const activeClasses =
          currentPath === path
                  ? "bg-secondary text-primary"
                  : "text-white";

          return `${baseClasses} ${hoverClasses} ${activeClasses}`;

        };

        const onResize = (size: number)=> {

          setWindowWidth(size);

         if(size <= 1024){
           menuContainer.current.classList.remove("flex");
           menuContainer.current.classList.add("hidden");
           setIsOpen(false);

         }
         else{
            menuContainer.current.classList.remove("hidden");
            menuContainer.current.classList.add("flex");
            setIsOpen(true);
         }
          
        };

        const navigationToggleClickHandler = ()=>{

          if(isOpen){

            //Cerrar menu
            menuContainer.current.classList.add("hidden"); 
            menuContainer.current.classList.remove("flex");

            menu.current.classList.add("hidden");
            menu.current.classList.remove("flex-col");
            menu.current.classList.remove("flex");
            
          }
          else{

            //Abrir menu
            menuContainer.current.classList.remove("hidden"); 
            menuContainer.current.classList.add("flex");

             menu.current.classList.remove("hidden");
             menu.current.classList.add("flex-col");
             menu.current.classList.add("flex");
          }
        } 

        const linkClickHandler: MouseEventHandler<HTMLAnchorElement> = async (event)=>{

           event.preventDefault();
          
           const href = event.currentTarget.getAttribute("href"); 

           if(windowWidth <= 1024){
              menuContainer.current.classList.remove("flex");
              menuContainer.current.classList.add("hidden");
           }

          setIsOpen(false); 
          setCurrentPath(href);
          navigate(href, {history: "push"});
          
        }
        
     

  return (
    <div ref={menuContainer} className="flex justify-end w-full lg:w-auto gap-x-[10px] h-[calc(100dvh-var(--size-navbar-height))] lg:h-auto bg-background lg:bg-transparent lg:static absolute top-[var(--size-navbar-height)] left-0 lg:top-0 lg:left-0 z-50 lg:z-auto px-[10px] lg:px-0 py-[10px] lg:py-0 shadow-lg lg:shadow-none">
      <ul ref={menu}  className="hidden lg:flex lg:flex-row justify-start lg:w-auto lg:justify-end w-full gap-[10px]">
        <li className="w-full lg:w-auto">
          <a onClick={linkClickHandler} className={getLinkClasses("/")} href="/">
            Inicio
          </a>
        </li>
        <li className="w-full lg:w-auto">
          <a onClick={linkClickHandler}  className={getLinkClasses("/about")} href="/about">
            Acerca de
          </a>
        </li>
        <li className="relative w-full lg:w-auto">
          <a onClick={linkClickHandler} className={getLinkClasses("/robotics")} href="/robotics">
            Robótica
          </a>
        </li>
      </ul>
    </div>
  );
}

