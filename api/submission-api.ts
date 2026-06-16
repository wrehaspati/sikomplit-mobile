import { encodeFile } from "@/services/encode-file";
import { ApiResponse } from "@/types/response";
import {
  IPublishedSubmission,
  ISubmissionData,
  ISubmissionPost,
} from "@/types/submission";
import { api } from "./api-client";

/**
 * Fetches the active user submissions.
 * @returns Active submission data.
 */
export const activeSubmission = async (): Promise<ISubmissionData[]> => {
  const { data } = await api.get<ApiResponse<ISubmissionData[]>>(
    `/user/recommendations`,
  );
  if (!data.data) throw new Error(data.message);
  return data.data;
};

/**
 * Fetches the published submissions.
 * @returns Published submission data.
 */
export const publishedSubmission = async (): Promise<
  IPublishedSubmission[]
> => {
  const { data } =
    await api.get<ApiResponse<IPublishedSubmission[]>>("/researches");
  if (!data.data) throw new Error(data.message);
  return data.data;
};

/**
 * Submits a new research recommendation application.
 * @param data
 * @returns Request response.
 */
export const applySubmission = async (
  data: ISubmissionPost,
): Promise<ApiResponse<ISubmissionData>> => {
  const payload = {
    research_type_id: data.research_type_id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    national_identity_number: data.national_identity_number,
    date_of_birth: data.date_of_birth,
    gender: data.gender,
    last_education: data.last_education,
    occupation: data.occupation,
    application_letter: await encodeFile(data.application_letter),
    research_proposal: await encodeFile(data.research_proposal),
    ethics_clearance_letter: await encodeFile(data.ethics_clearance_letter),
    final_report_statement_letter: await encodeFile(
      data.final_report_statement_letter,
    ),
  };

  const res = await api.post("/user/recommendations", payload);
  return res.data;
};
