import { activeSubmission, publishedSubmission } from '@/api/submission-api';
import { useAuth } from '@/contexts/auth-context';
import { IPublishedSubmission, ISubmissionData } from '@/types/submission';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type SubmissionContextValue = {
  publishedSubmissions: IPublishedSubmission[];
  userSubmissions: ISubmissionData[];
  isRefreshingPublished: boolean;
  isRefreshingUser: boolean;
  refreshPublishedSubmissions: () => Promise<void>;
  refreshUserSubmissions: () => Promise<void>;
  refreshAllSubmissions: () => Promise<void>;
};

const SubmissionContext = createContext<SubmissionContextValue | null>(null);

export function SubmissionProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const userId = auth?.state.user?.id ?? null;
  const [publishedSubmissions, setPublishedSubmissions] = useState<IPublishedSubmission[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<ISubmissionData[]>([]);
  const [isRefreshingPublished, setIsRefreshingPublished] = useState(false);
  const [isRefreshingUser, setIsRefreshingUser] = useState(false);
  const publishedRequest = useRef<Promise<void> | null>(null);
  const userRequest = useRef<Promise<void> | null>(null);

  const refreshPublishedSubmissions = useCallback(async () => {
    if (publishedRequest.current) {
      return publishedRequest.current;
    }

    const request = (async () => {
      setIsRefreshingPublished(true);

      try {
        const res = await publishedSubmission();
        setPublishedSubmissions(res);
      } catch {
        setPublishedSubmissions([]);
      } finally {
        setIsRefreshingPublished(false);
        publishedRequest.current = null;
      }
    })();

    publishedRequest.current = request;
    return request;
  }, []);

  const refreshUserSubmissions = useCallback(async () => {
    if (!userId) {
      setUserSubmissions([]);
      return;
    }

    if (userRequest.current) {
      return userRequest.current;
    }

    const request = (async () => {
      setIsRefreshingUser(true);

      try {
        const res = await activeSubmission();
        setUserSubmissions(res);
      } catch {
        setUserSubmissions([]);
      } finally {
        setIsRefreshingUser(false);
        userRequest.current = null;
      }
    })();

    userRequest.current = request;
    return request;
  }, [userId]);

  useEffect(() => {
    void refreshPublishedSubmissions();
  }, [refreshPublishedSubmissions]);

  useEffect(() => {
    if (auth?.state.isLoading) {
      return;
    }

    if (!userId) {
      userRequest.current = null;
      setUserSubmissions([]);
      setIsRefreshingUser(false);
      return;
    }

    void refreshUserSubmissions();
  }, [auth?.state.isLoading, refreshUserSubmissions, userId]);

  const refreshAllSubmissions = useCallback(async () => {
    await Promise.all([refreshPublishedSubmissions(), refreshUserSubmissions()]);
  }, [refreshPublishedSubmissions, refreshUserSubmissions]);

  const value = useMemo(
    () => ({
      publishedSubmissions,
      userSubmissions,
      isRefreshingPublished,
      isRefreshingUser,
      refreshPublishedSubmissions,
      refreshUserSubmissions,
      refreshAllSubmissions,
    }),
    [
      publishedSubmissions,
      userSubmissions,
      isRefreshingPublished,
      isRefreshingUser,
      refreshPublishedSubmissions,
      refreshUserSubmissions,
      refreshAllSubmissions,
    ]
  );

  return <SubmissionContext.Provider value={value}>{children}</SubmissionContext.Provider>;
}

export const useSubmissions = () => useContext(SubmissionContext);