import { Component, Inject, OnInit } from "@angular/core";
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from "@angular/router";
import { JwtTokenHelper } from "src/app/shared/common";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { NotificationModel } from "src/app/shared/models/notifications/notifications.model";
import { AuthErrorHandler, ReloadLayoutService } from "src/app/shared/services";
import { NotificationService } from "src/app/shared/services/api/notification/notification.service";
@Component({
    selector: "notification-snackbar",
    templateUrl: "./notification-snackbar.component.html",
    styleUrls: ["./notification-snackbar.component.scss"],
})

export class NotificationSnackbar implements OnInit {
    notification: NotificationModel;
    content: string;
    url: string;

    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: any,
        private router: Router,
        private reloadLayoutService: ReloadLayoutService,
        private notificationService: NotificationService,
        private authErrorHandler: AuthErrorHandler,
    ) { }


    ngOnInit() {
        this.notification = { ...this.data.content };
        this.content = this.notification.message;
    }

    onReadNotification = () => {
        const _n: NotificationModel = this.notification;
        const _mProjectDefault = JwtTokenHelper.GetModuleProjectDefault();
        this.notificationService.readNotification(_n.id, _mProjectDefault.projectKey).subscribe({
            complete: () => {
                this.reloadLayoutService.reloadLayout('reloadNotificationQuantity');
                this.redirectToScreen(_n);
            },
            error: (err: ApiError) => {
                this.authErrorHandler.handleError(err.message);
            },
        })
    }

    redirectToScreen(notification: NotificationModel) {
        switch (notification.referenceType) {
            case ReferenceType.punch:
                this.router.navigate([notification.url], { queryParams: { actionType: notification.actionType } });
                break;
            case ReferenceType.walkdown:
                const _url = (notification.url).split('?');
                const _query = _url[1].split('=');
                this.router.navigate([_url[0]], { queryParams: { handoverNo: _query[1] } });
                break;
            default:
                this.router.navigate([notification.url]);
                break;
        }
    }
}

const ReferenceType = {
    punch: 'Punch',
    change: 'Change',
    walkdown: 'WalkDownHandover',
}