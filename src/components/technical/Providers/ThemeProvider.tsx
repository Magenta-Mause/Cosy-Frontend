import { useLocalStorage } from "@uidotdev/usehooks";
import { createContext, type ReactNode, useEffect, useState } from "react";

export const ThemeOptions = {
  DAY: "day",
  NIGHT: "night",
} as const;

export type ThemeOptions = (typeof ThemeOptions)[keyof typeof ThemeOptions];

interface ThemeContextType {
  currentTheme: ThemeOptions;
  selectedTheme: ThemeOptions | null;
  setTheme: (newTheme: ThemeOptions | null) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  currentTheme: ThemeOptions.DAY,
  selectedTheme: null,
  setTheme: () => {},
});

function useCurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000 * 60); // update every minute
    return () => clearInterval(id);
  }, []);

  return time;
}

const calculateCurrentTheme = (time: Date) => {
  const hour = time.getHours();
  return hour >= 7 && hour < 19 ? ThemeOptions.DAY : ThemeOptions.NIGHT;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useLocalStorage<ThemeOptions | null>("theme", null);
  const currentTime = useCurrentTime();

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: theme ?? calculateCurrentTheme(currentTime),
        selectedTheme: theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
