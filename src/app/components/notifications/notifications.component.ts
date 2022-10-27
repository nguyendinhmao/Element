import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { JwtTokenHelper } from 'src/app/shared/common';
import { ApiError, ApiListResponse } from 'src/app/shared/models/api-response/api-response';
import { NotificationModel } from 'src/app/shared/models/notifications/notifications.model';
import { NotificationService } from 'src/app/shared/services/api/notification/notification.service';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';
import { ReloadLayoutService } from 'src/app/shared/services/core/reload-layout.service';

@Component({
    selector: 'notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ["./notifications.component.scss"],
})

export class NotificationsComponent implements OnInit {
    @Input() isReloadNotification: boolean;

    //--- Boolean
    isShowUnread: boolean = true;
    isShowRead: boolean = false;
    isLoadNotificationData: boolean;
    isReloadNotificationTemp: boolean;
    isEnableLoadMore: boolean;

    //--- Model
    public notificationModels: NotificationModel[] = [];
    public notificationTempModels: NotificationModel[] = [];

    //--- Variables
    currentPageNumber: number = 1;
    currentPageSize: number = 10;
    currentIsRead: boolean = false;

    constructor(
        private authErrorHandler: AuthErrorHandler,
        private notificationService: NotificationService,
        private router: Router,
        private reloadLayoutService: ReloadLayoutService,
    ) { }

    ngOnInit(): void {
        //--- Get notification
        this.reloadLayoutService.getEmitter().subscribe((message) => {
            if (message === "reloadNotification") {
                this.isShowUnread = true;
                this.isShowRead = false;
                this.currentIsRead = false;
                this.currentPageNumber = 1;
                this.onGetNotification();
            }
        })
    }

    //--- Get notification
    onGetNotification = (pageNumber?: number, isRead?: boolean, isReload?: boolean) => {
        this.isLoadNotificationData = true;
        this.isReloadNotificationTemp = this.isReloadNotification;
        const _mProjectDefault = JwtTokenHelper.GetModuleProjectDefault();

        if (pageNumber >= 0) this.currentPageNumber = pageNumber;
        isRead = this.currentIsRead;

        this.notificationService.getNotificationList(pageNumber || this.currentPageNumber, this.currentPageSize, isRead, _mProjectDefault.projectKey).subscribe(
            (res) => {
                this.notificationModels = res.items ? <NotificationModel[]>[...res.items] : [];

                if (!isReload) {
                    this.notificationTempModels = [];
                    this.currentPageNumber = 1;
                }
                this.notificationTempModels = this.notificationTempModels.concat(this.notificationModels);

                //--- Enable load more
                if (this.notificationTempModels.length === res.totalItemCount) {
                    this.isEnableLoadMore = false;
                } else {
                    this.isEnableLoadMore = true;
                }

                this.isLoadNotificationData = false;
            },
            (err: ApiError) => {
                this.authErrorHandler.handleError(err.message);
            }
        )
    }

    //--- Show unread
    showUnreadNotification = ($event: any) => {
        $event.stopPropagation();
        this.isShowUnread = true;
        this.isShowRead = false;
        this.currentIsRead = false;
        this.currentPageNumber = 1;
        this.onGetNotification();
    }

    //--- Show read
    showReadNotification = ($event: any) => {
        $event.stopPropagation();
        this.isShowRead = true;
        this.isShowUnread = false;
        this.currentIsRead = true;
        this.currentPageNumber = 1;
        this.onGetNotification();
    }

    //--- Set read notification
    onReadNotification = (notification: NotificationModel) => {
        if (notification.isRead) {
            this.redirectToScreen(notification);
            return;
        }

        const _mProjectDefault = JwtTokenHelper.GetModuleProjectDefault();
        this.notificationService.readNotification(notification.id, _mProjectDefault.projectKey).subscribe({
            complete: () => {
                this.reloadLayoutService.reloadLayout('reloadNotificationQuantity');
                this.redirectToScreen(notification);
                this.onGetNotification();
            },
            error: (err: ApiError) => {
                this.authErrorHandler.handleError(err.message);
            },
        })
    }

    moveUnreadNotification2Read(notification: NotificationModel) {
        const _mProjectDefault = JwtTokenHelper.GetModuleProjectDefault();
        this.notificationService.readNotification(notification.id, _mProjectDefault.projectKey).subscribe({
            complete: () => {
                this.reloadLayoutService.reloadLayout('reloadNotificationQuantity');
                this.onGetNotification();
            },
            error: (err: ApiError) => {
                this.authErrorHandler.handleError(err.message);
            },
        })
    }

    //--- Load more
    loadMoreNotification = ($event: any) => {
        $event.stopPropagation();
        this.currentPageNumber = this.currentPageNumber + 1;
        this.onGetNotification(this.currentPageNumber, this.currentIsRead, true);
    }

    redirectToScreen(notification: NotificationModel) {
        switch (notification.referenceType) {
            case ReferenceType.punch:
                this.redirectTo(notification.url, { queryParams: { actionType: notification.actionType } });
                break;
            case ReferenceType.walkdown:
                const _url = (notification.url).split('?');
                const _query = _url[1].split('=');
                this.redirectTo(_url[0], { queryParams: { handoverNo: _query[1] } });
                break;
            default:
                this.redirectTo(notification.url);
                break;
        }
    }

    redirectTo(uri: string, queryParams?: any) {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            !!queryParams ? this.router.navigate([uri], queryParams) : this.router.navigate([uri]);
        });
    }
}

const ReferenceType = {
    punch: 'Punch',
    change: 'Change',
    walkdown: 'WalkDownHandover',
}