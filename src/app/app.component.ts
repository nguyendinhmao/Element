import { Component, NgZone, OnInit } from "@angular/core";
import { StorageKey } from "src/app/shared/models/storage-key/storage-key";
import { StorageService } from "src/app/shared/services/core/storage.service";
import { Router } from "@angular/router";
import { Configs } from "src/app/shared/common";
import { UserModel } from "src/app/shared/models/user/user.model";
import { JwtTokenHelper } from "src/app/shared/common/jwt-token-helper/jwt-token-helper";
import { Idle, DEFAULT_INTERRUPTSOURCES } from "@ng-idle/core";
import { Keepalive } from "@ng-idle/keepalive";

import { DeviceDetectorService } from 'ngx-device-detector';

import { Plugins } from '@capacitor/core';
import { InfoDevice } from './shared/models/common/global-variables';
import { DownloadStatusService, IdbService } from './shared/services';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { NotificationService } from "./shared/services/api/notification/notification.service";
import { TypeDownloadRequest } from "./shared/models/common/common.model";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  userInfo: UserModel = new UserModel();
  idleState = "Not started.";
  timedOut = false;
  lastPing?: Date = null;
  constructor(
    private storageService: StorageService,
    private router: Router,
    private idle: Idle,
    private keepalive: Keepalive,
    private deviceService: DeviceDetectorService,
    private idbService: IdbService, //just to init IdbService
    private updates: SwUpdate,
    private notificationService: NotificationService,
    private downloadStatusService: DownloadStatusService,
  ) {
    this.idbService.connectToIDB();
    if (!this.deviceService.isTablet() || !this.deviceService.isMobile()) { //just support for tester
      idle.setIdle(1);
      idle.setTimeout(Configs.DefaultTimeOut);
      idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

      idle.onIdleEnd.subscribe(() => {
        this.idleState = "No longer idle.";
        this.reset();
      });

      idle.onTimeout.subscribe(() => {
        this.idleState = "Timed out!";
        this.timedOut = true;
        this.onTimeOut();
      });

      idle.onIdleStart.subscribe(() => {
        this.idleState = "You've gone idle!";
      });

      idle.onTimeoutWarning.subscribe((countdown) => {
        this.idleState = "You will time out in " + countdown + " seconds!";
      });

      keepalive.interval(15);
      keepalive.onPing.subscribe(() => {
        this.lastPing = new Date();
      });

      this.reset();
    }
    this.subscribeToEvents();
  }

  async ngOnInit() {
    // let handler = Network.addListener('networkStatusChange', (status) => {
    //   InfoDevice.isOffline = !status.connected;
    //   this.router.navigate([""]);
    // });

    InfoDevice.isOffline = !navigator.onLine;
    InfoDevice.isTablet = this.deviceService.isTablet() || this.deviceService.isMobile();
    this.checkNetwork();
  }

  private subscribeToEvents(): void {
    // if connection exists it can call of method.  
    this.notificationService.connectionEstablished.subscribe(() => {
      console.log("canSendMessage = true");
    });
  }

  onlineEvent: Observable<Event>;
  offlineEvent: Observable<Event>;
  subscriptions: Subscription[] = [];
  connectionStatusMessage: string;
  connectionStatus: string;

  checkNetwork() {
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');
    this.subscriptions.push(this.onlineEvent.subscribe(this.handleConnection));
    this.subscriptions.push(this.offlineEvent.subscribe(this.handleConnection));
  }

  handleConnection = (event) => {
    if (navigator.onLine) {
      // handle online status
      console.log('online');
      InfoDevice.isOffline = false;
      this.router.navigate([""]);
    } else {
      // handle offline status
      console.log('offline');
      InfoDevice.isOffline = true;
      this.router.navigate([""]);
    }
    this.downloadStatusService.reset(TypeDownloadRequest.all, true);
  }

  reset() {
    this.idle.watch();
    this.idleState = "Started.";
    this.timedOut = false;
  }

  onTimeOut = () => {
    this.userInfo = JwtTokenHelper.GetUserInfo();
    if (this.userInfo && this.userInfo.access_token) {
      this.storageService.onRemoveTokens([
        StorageKey.UserInfo,
        StorageKey.Token,
        StorageKey.ModuleProjectDefault,
        StorageKey.ColourBranding,
      ]);
      this.router.navigate(["/login"]);
    }
  };
}
