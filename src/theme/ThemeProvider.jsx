import { createContext, useContext, useEffect } from "react";

const DARK_MODE = "dark-mode";
const getDarkMode = () => JSON.parse(localStorage.getItem(DARK_MODE)) || false;
export const ThemeContext = createContext();
const ThemeProvider = ({ children }) => {
  useEffect(() => {
    if (localStorage.getItem(DARK_MODE) === null) {
      localStorage.setItem(DARK_MODE, true);
      window.location.reload(false);
    }
    if (getDarkMode()) {
      import("./DarkTheme.css");
    } else {
      import("./LightTheme.css");
    }
  }, []);
  const setThemeDark = (isDark) => {
    localStorage.setItem(DARK_MODE, isDark);
    window.location.reload(false);
  };
  return <ThemeContext.Provider value={{ isDark: getDarkMode(), setThemeDark }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext);
export default ThemeProvider;
