import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const BOOKMARKS_STORAGE_KEY = "library_bookmarks";

interface IBookmarkContext {
  bookmarkedIds: string[];
  bookmarksLoaded: boolean;
  toggleBookmark: (id: string) => void;
  setValidBookmarks: (validIds: string[]) => void;
}

const BookmarkContext = createContext<IBookmarkContext | null>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[] | null>(null);

  // Load bookmarks from SecureStore on mount
  useEffect(() => {
    async function loadBookmarks() {
      try {
        const raw = await SecureStore.getItemAsync(BOOKMARKS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setBookmarkedIds([...new Set(parsed)]);
            return;
          }
        }
        setBookmarkedIds([]);
      } catch (error) {
        console.error("Failed to load bookmarks from SecureStore:", error);
        setBookmarkedIds([]);
      }
    }
    loadBookmarks();
  }, []);

  // Persist bookmarks to SecureStore whenever they change (but only after they are loaded)
  useEffect(() => {
    if (bookmarkedIds === null) return;
    async function saveBookmarks() {
      try {
        await SecureStore.setItemAsync(
          BOOKMARKS_STORAGE_KEY,
          JSON.stringify(bookmarkedIds),
        );
      } catch (error) {
        console.error("Failed to save bookmarks to SecureStore:", error);
      }
    }
    saveBookmarks();
  }, [bookmarkedIds]);

  /**
   * Toggle bookmark status for a given ID.
   */
  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const current = prev ?? [];
      const exists = current.includes(id);
      return exists
        ? current.filter((bookmarkId) => bookmarkId !== id)
        : [...new Set([...current, id])];
    });
  }, []);

  /**
   * Remove bookmarks whose IDs no longer exist in the valid set.
   */
  const setValidBookmarks = useCallback((validIds: string[]) => {
    setBookmarkedIds((prev) => {
      if (prev === null) return null;
      const validSet = new Set(validIds);
      const next = prev.filter((id) => validSet.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      bookmarkedIds: bookmarkedIds ?? [],
      bookmarksLoaded: bookmarkedIds !== null,
      toggleBookmark,
      setValidBookmarks,
    }),
    [bookmarkedIds, toggleBookmark, setValidBookmarks],
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}

export const useBookmarks = () => useContext(BookmarkContext);
