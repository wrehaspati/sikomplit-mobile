import { encodeFile } from "@/services/encode-file";
import { ApiResponse } from "@/types/response";
import { ISubmissionData, ISubmissionUploadFile } from "@/types/submission";
import { api } from "./api-client";

/**
 * Payload for uploading research results.
 */
export interface IResearchUploadPost {
  recommendation_request_id: number;
  title: string;
  abstract: string;
  research_summary: ISubmissionUploadFile;
  flyer: ISubmissionUploadFile;
}

/**
 * Uploads research results (title, abstract, summary PDF, and flyer image)
 *
 * @param data - The research upload payload.
 * @returns Updated submission data from the API.
 */
export const uploadResearch = async (
  data: IResearchUploadPost,
): Promise<ApiResponse<ISubmissionData>> => {
  const payload = {
    recommendation_request_id: data.recommendation_request_id,
    research_summary: await encodeFile(data.research_summary),
    flyer: await encodeFile(data.flyer),
    title: data.title,
    abstract: data.abstract,
  };

  const res = await api.post("/user/research-uploads", payload, {
    headers: { Accept: "application/json" },
  });
  return res.data;
};
