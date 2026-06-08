import { encodeFile } from "@/services/encode-file";
import { ApiResponse } from "@/types/response";
import { ISubmissionData } from "@/types/submission";
import { api } from "./api-client";

/**
 * File descriptor for a document picked via expo-document-picker.
 */
export interface ReuploadFile {
  uri: string;
  name: string;
  mimeType?: string | null;
}

/**
 * Allowed document field keys that can be re-uploaded.
 */
export type ReuploadFileType =
  | "application_letter"
  | "research_proposal"
  | "ethics_clearance_letter"
  | "final_report_statement_letter";

/**
 * Re-uploads a single document for an existing submission.
 * Used when a submission is marked as `editable` (revision requested).
 *
 * @param submissionId - The ID of the submission to update.
 * @param fileType - The document field key to replace.
 * @param file - The picked file descriptor (uri, name, mimeType).
 * @returns Updated submission data from the API.
 */
export const reuploadDocument = async (
  submissionId: number,
  fileType: ReuploadFileType,
  file: ReuploadFile,
): Promise<ApiResponse<ISubmissionData>> => {
  const payload = {
    [fileType]: await encodeFile(file),
  };

  const res = await api.post(`/user/recommendations/${submissionId}`, payload, {
    headers: { Accept: "application/json" },
  });
  return res.data;
};
