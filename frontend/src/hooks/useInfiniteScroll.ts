"use client";

import { useEffect, useRef, RefObject } from "react";

interface UseInfiniteScrollOptions {
  /**
   * Callback to execute when user scrolls to the bottom
   */
  onLoadMore: () => void;
  
  /**
   * Whether there are more items to load
   */
  hasMore: boolean;
  
  /**
   * Whether a load operation is currently in progress
   */
  isLoading: boolean;
  
  /**
   * Threshold for intersection observer (0.0 to 1.0)
   * Default: 0.1 (triggers when 10% of sentinel is visible)
   */
  threshold?: number;
  
  /**
   * Root margin for intersection observer
   * Default: "100px" (triggers 100px before reaching bottom)
   */
  rootMargin?: string;
}

/**
 * Custom hook for infinite scroll functionality.
 * Uses Intersection Observer API to detect when user scrolls near the bottom.
 * 
 * @returns Ref to attach to a sentinel element at the bottom of the list
 * 
 * @example
 * ```tsx
 * const sentinelRef = useInfiniteScroll({
 *   onLoadMore: loadMore,
 *   hasMore: hasMore,
 *   isLoading: isLoadingMore
 * });
 * 
 * return (
 *   <div>
 *     {items.map(...)}
 *     <div ref={sentinelRef} />
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.1,
  rootMargin = "100px",
}: UseInfiniteScrollOptions): RefObject<HTMLDivElement | null> {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onLoadMore);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Don't observe if no more items or currently loading
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        // Trigger load more when sentinel becomes visible
        if (entry.isIntersecting) {
          callbackRef.current();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(sentinel);

    // Cleanup on unmount or when dependencies change
    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, threshold, rootMargin]);

  return sentinelRef;
}

