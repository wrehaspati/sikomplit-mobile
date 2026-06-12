import { File, Paths } from "expo-file-system";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const bookmarkFile = new File(Paths.document, "library-bookmarks.json");

interface IBookmarkContext {
  bookmarkedIds: string[];
  bookmarksLoaded: boolean;
  toggleBookmark: (id: string) => void;
  setValidBookmarks: (validIds: string[]) => void;
}

const BookmarkContext = createContext<IBookmarkContext | null>(null);

/**
 * Read bookmark IDs from local file storage.
 * Returns an empty array when the file does not exist yet.
 */
function readBookmarksFromDisk(): string[] {
  try {
    if (!bookmarkFile.exists) return [];
    const raw = bookmarkFile.textSync();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return [
        ...new Set(parsed.filter((id): id is string => typeof id === "string")),
      ];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Persist bookmark IDs to local file storage.
 */
function writeBookmarksToDisk(ids: string[]): void {
  try {
    bookmarkFile.write(JSON.stringify(ids));
  } catch {
    // Silently ignore write errors to avoid crashing the app
  }
}

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);

  // Load bookmarks from file storage on mount (synchronous read is fine for small JSON)
  useEffect(() => {
    const ids = readBookmarksFromDisk();
    setBookmarkedIds(ids);
    setBookmarksLoaded(true);
  }, []);

  // Persist bookmarks to file storage whenever they change (but only after initial load)
  useEffect(() => {
    if (!bookmarksLoaded) return;
    writeBookmarksToDisk(bookmarkedIds);
  }, [bookmarkedIds, bookmarksLoaded]);

  /**
   * Toggle bookmark status for a given ID.
   */
  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      return exists
        ? prev.filter((bookmarkId) => bookmarkId !== id)
        : [...new Set([...prev, id])];
    });
  }, []);

  /**
   * Remove bookmarks whose IDs no longer exist in the valid set.
   * This is a no-op if bookmarks haven't been loaded yet (prevents the
   * race condition where network data arrives before stored bookmarks).
   */
  const setValidBookmarks = useCallback((validIds: string[]) => {
    setBookmarkedIds((prev) => {
      const validSet = new Set(validIds);
      const next = prev.filter((id) => validSet.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      bookmarkedIds,
      bookmarksLoaded,
      toggleBookmark,
      setValidBookmarks,
    }),
    [bookmarkedIds, bookmarksLoaded, toggleBookmark, setValidBookmarks],
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}

export const useBookmarks = () => useContext(BookmarkContext);
