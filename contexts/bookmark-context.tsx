import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const BOOKMARK_STORAGE_KEY = 'library-bookmarks';

interface IBookmarkContext {
  bookmarkedIds: string[];
  bookmarksLoaded: boolean;
  toggleBookmark: (id: string) => void;
  setValidBookmarks: (validIds: string[]) => void;
}

const BookmarkContext = createContext<IBookmarkContext | null>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);

  // Load bookmarks from secure storage on mount
  useEffect(() => {
    let isActive = true
    const loadBookmarks = async () => {
      try {
        const storedBookmarks = await SecureStore.getItemAsync(BOOKMARK_STORAGE_KEY);
        if (!isActive) return;
        if (storedBookmarks) {
          const parsedBookmarks = JSON.parse(storedBookmarks);
          if (Array.isArray(parsedBookmarks)) {
            setBookmarkedIds([
              ...new Set(parsedBookmarks.filter((bookmarkId): bookmarkId is string => typeof bookmarkId === 'string')),
            ]);
          }
        }
      } catch {
        if (isActive) {
          setBookmarkedIds([]);
        }
      } finally {
        if (isActive) {
          setBookmarksLoaded(true);
        }
      }
    };

    loadBookmarks();
    return () => {
      isActive = false;
    };
  }, []);

  // Persist bookmarks to secure storage whenever they change
  useEffect(() => {
    if (!bookmarksLoaded) return
    SecureStore.setItemAsync(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarkedIds)).catch(() => undefined);
  }, [bookmarkedIds, bookmarksLoaded]);

  /**
   * Toggle bookmark status for a given ID.
   * @param id 
   */
  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      return exists ? prev.filter((bookmarkId) => bookmarkId !== id) : [...new Set([...prev, id])];
    });
  };

  /**
   * Set the list of valid bookmark IDs
   * @param validIds 
   */
  const setValidBookmarks = (validIds: string[]) => {
    setBookmarkedIds((prev) => {
      const validSet = new Set(validIds);
      const next = prev.filter((id) => validSet.has(id));
      return next.length === prev.length ? prev : next;
    });
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ bookmarkedIds, bookmarksLoaded, toggleBookmark, setValidBookmarks }),
    [bookmarkedIds, bookmarksLoaded]
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export const useBookmarks = () => useContext(BookmarkContext);
