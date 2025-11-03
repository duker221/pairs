export enum NotificationStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface NotificationResponse {
  status: NotificationStatus;
  message: string;
  error?: string;
}
