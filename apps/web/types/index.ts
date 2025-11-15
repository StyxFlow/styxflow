export interface IServerResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  error?: {
    message: string;
    path?: string;
  };
}
