import NavbarMenu from "./NavbarMenu.tsx";
import { useState, useEffect } from "react";

interface NavbarProps {
  IsOpen?: boolean;
}

export default function Navbar(props: NavbarProps) {
  const [isOpen, setIsOpen] = useState(props.IsOpen === undefined ? false : props.IsOpen);

  function navigationToggleClickHandler() {
      setIsOpen((prevState) => !prevState); 
  }

  const onMenuToggle = (open: boolean) => {
    setIsOpen(open);
  } 

  const headerClasses = () => {
    let baseClasses =
      "sticky top-0 z-1 mx-auto max-w-6xl transition-colors "; 

      if (isOpen) 
        return baseClasses + "bg-primary";
      
    return baseClasses;
  }

  return (
    <header className={headerClasses()}>
      <nav className="h-navbar w-full">
        <div className="flex items-center h-full justify-between">
          <a target="_blanck" href="https://www.meduca.gob.pa"> <img
            className="h-auto w-[20%] min-w-[200px] animate-fade-out fill-both timeline-scroll animate-range-[0%_15%]"
            src="/logos/logo-gobierno.webp"
            alt="Logo Gobierno"
          /> 
          </a>
          <NavbarMenu IsOpen={isOpen} OnMenuToggle={onMenuToggle} />
          <button
            onClick={navigationToggleClickHandler}
            className="p-[10px] bg-primary rounded-xl cursor-pointer block lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 20 20"
            >
              <path
                fill="#ffffff"
                d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
