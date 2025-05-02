import { useEffect } from "react";

// Prevents an input number change by scrolling
export const usePreventNumberInputScroll = () => {
  useEffect(() => {
    const preventScroll = (e: any) => {
      if (e.target.type === "number") {
        e.preventDefault();
      }
    };
    window.addEventListener("wheel", preventScroll, { passive: false });
    return () => {
      window.removeEventListener("wheel", preventScroll);
    };
  }, []);
};

// Returns a number with a comma that separates thousands
export const toUSFormat = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Formats a User Name provided in the nice format: "J. Doe"
export const formatUserName = (username: string) => {
  const firstInitial = username[0].toUpperCase();
  const lastName =
    username.slice(1).charAt(0).toUpperCase() + username.slice(2);
  return `${firstInitial}. ${lastName}`;
};

export const DEBOUNCE_DELAY = 1000;
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null;

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId as NodeJS.Timeout);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
