export class NotificationModel {
    id: string;
    referenceId: string;
    referenceType: string;
    actionType: string;
    message: string;
    url: string;
    isRead: boolean;
    createdDate: Date
}