import { useState, useEffect } from "react";

export default function useDarkMode() {
  
  const [isDark, setIsDark] = useState(() => {
    try {
      const savedTheme = window.localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
     
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (error) {
      return false; 
    }
  });

  
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDark) {
      root.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return [isDark, setIsDark];
}