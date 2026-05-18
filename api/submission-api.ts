import { ApiResponse } from "@/types/response";
import { IPublishedSubmission, ISubmissionData, ISubmissionPost, ISubmissionUploadFile } from "@/types/submission";
import { File } from 'expo-file-system';
import { api } from "./api-client";

/**
 * Fetches the active user submissions.
 * @returns User in progress submission data
 */
export const activeSubmission = async (): Promise<ISubmissionData[]> => {
  const { data } = await api.get<ApiResponse<ISubmissionData[]>>(`/user/recommendations`);
  if (!data.data) throw new Error(data.message);
  return data.data;
}

/**
 * Fetches the published submissions.
 * @returns Published submission data
 */
export const publishedSubmission = async (): Promise<IPublishedSubmission[]> => {
  const { data } = await api.get<ApiResponse<IPublishedSubmission[]>>('/researches');
  if (!data.data) throw new Error(data.message);
  return data.data;
}

/**
 * Submits a new research recommendation application.
 * @param data - The submission data.
 * @returns The response from the server containing the submitted data.
 */
export const applySubmission = async (data: ISubmissionPost): Promise<ApiResponse<ISubmissionData>> => {
  type SubmissionFileField = keyof Pick<ISubmissionPost, 'application_letter' | 'research_proposal' | 'ethics_clearance_letter' | 'final_report_statement_letter'>;

  const encodeFile = async (file?: ISubmissionUploadFile) => {
    if (!file?.uri) {
      return undefined;
    }

    const base64 = await new File(file.uri).base64();

    return {
      name: file.name,
      mimeType: file.mimeType ?? 'application/pdf',
      base64,
    };
  };

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
    final_report_statement_letter: await encodeFile(data.final_report_statement_letter),
  } as Record<SubmissionFileField | Exclude<keyof ISubmissionPost, SubmissionFileField>, unknown>;

  const res = await api.post('/user/recommendations', payload);
  return res.data;
}