import { ApiResponse } from "@/types/response";
import { IPublishedSubmission } from "@/types/submission";
import { api } from "./api-client";

export const activeSubmission = async (id: number): Promise<void> => {
  // TODO: Implement API call to activate submission
}

export const publishedSubmission = async (): Promise<IPublishedSubmission[]> => {
  const { data } = await api.get<ApiResponse<IPublishedSubmission[]>>('/researches');
  if (!data.data) throw new Error(data.message);
  return data.data;
}