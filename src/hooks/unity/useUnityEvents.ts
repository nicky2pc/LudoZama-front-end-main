import { useEffect } from "react";
import type { UnityContextType } from "./useUnityEventSystem";

// Define types for event handlers
export type UnityEventHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => void;
export type UnityEventConfig = {
  eventName: string;
  handler: UnityEventHandler;
  dependencies?: unknown[];
};

/**
 * Hook for managing Unity event listeners
 * @param unityContext The Unity context with addEventListener and removeEventListener methods
 * @param events Array of event configurations
 */
export function useUnityEvents(
  unityContext: UnityContextType,
  events: UnityEventConfig[]
) {
  useEffect(() => {
    // Register all event listeners
    events.forEach(({ eventName, handler }) => {
      unityContext.addEventListener(eventName, handler);
    });

    // Cleanup function to remove event listeners
    return () => {
      events.forEach(({ eventName, handler }) => {
        unityContext.removeEventListener(eventName, handler);
      });
    };
  }, [unityContext.addEventListener, unityContext.removeEventListener, events]);
}
