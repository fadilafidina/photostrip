import { createContext, useContext } from "react";

/** "classic" lives at /, "kidcore" at /kidcore. */
export type Theme = "classic" | "kidcore";

export const ThemeContext = createContext<Theme>("classic");

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export function useIsKidcore(): boolean {
  return useContext(ThemeContext) === "kidcore";
}
