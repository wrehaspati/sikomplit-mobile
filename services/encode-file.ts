import { ISubmissionUploadFile } from "@/types/submission";
import { File } from "expo-file-system";

export const encodeFile = async (file?: ISubmissionUploadFile) => {
  if (!file?.uri) {
    return undefined;
  }

  const base64 = await new File(file.uri).base64();

  return {
    name: file.name,
    mimeType: file.mimeType ?? "application/pdf",
    base64,
  };
};
