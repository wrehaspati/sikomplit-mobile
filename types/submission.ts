export interface ISubmissionData {
  id: number;
  request_number: string;
  research_type: string;
  progress_status: string;
  editable: boolean;
  application_letter: string;
  research_proposal: string;
  ethics_clearance_letter?: string | null;
  final_report_statement_letter?: string | null;
  recommendation_letter?: string | null;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  last_education: string;
  occupation: string;
  created_at: string;
  updated_at: string;
  research_upload: {
    recommendation_request_id: string;
    title: string;
    abstract?: string | null;
    research_summary: string;
    flyer: string;
    is_published?: string;
  };
}

export interface ISubmissionPost {
  research_type_id: string;
  application_letter: ISubmissionUploadFile;
  research_proposal?: ISubmissionUploadFile;
  ethics_clearance_letter?: ISubmissionUploadFile;
  final_report_statement_letter?: ISubmissionUploadFile;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  last_education: string;
  occupation: string;
}

export interface ISubmissionUploadFile {
  uri: string;
  name: string;
  mimeType?: string | null;
}

export interface IPublishedSubmission {
  id: string;
  title: string;
  slug: string;
  research_summary: string;
  flyer: string;
  abstract?: string | null;
  is_published: "Published" | "Unpublished";
  created_at: string;
  updated_at: string;
}

export interface IPoster {
  id: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}
