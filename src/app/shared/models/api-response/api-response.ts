export interface ApiListResponse {
  status: number;
  content: Array<any>;
  items: Array<any>;
  message: string;
  totalItemCount: number;
}

export interface ApiResponse {
  status: number;
  content: Object | any;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  type: string;
  errorType: string;
  error_description: string;
}
