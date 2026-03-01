// Request DTOs
export interface CreateFAQRequest {
  faqQuestion: string;
  faqAnswer: string;
}

export interface UpdateFAQRequest {
  faqQuestion?: string;
  faqAnswer?: string;
}

// Response DTOs
export interface FAQResponse {
  _id: string;
  faqQuestion: string;
  faqAnswer: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllFAQsResponse {
  success: true;
  data: FAQResponse[];
}

export interface GetSingleFAQResponse {
  success: true;
  data: FAQResponse;
}

export interface CreateFAQResponse {
  success: true;
  message: string;
  data: FAQResponse;
}

export interface UpdateFAQResponse {
  success: true;
  message: string;
  data: FAQResponse;
}

export interface DeleteFAQResponse {
  success: true;
  message: string;
}

export interface ErrorResponse {
  message: string;
  success?: false;
}