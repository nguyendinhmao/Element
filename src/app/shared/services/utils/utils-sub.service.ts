import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ReloadPageKey, SyncResponse, TypeDownloadRequest } from '../../models/common/common.model';
import { DownloadDetailStatus } from '../../models/tab-tag/tab-tag.model';

@Injectable({
  providedIn: 'root',
})
export class ReloadSideMenuService {
  private emit$ = new Subject<any>();

  sendMessage(isEnable: boolean) {
    this.emit$.next({ isEnable: isEnable });
  }

  getMessage(): Observable<any> {
    return this.emit$.asObservable();
  }
}


@Injectable({
  providedIn: 'root',
})
export class ReloadAfterSynchronizingService {
  private emit$ = new Subject<any>();

  sendMessage(link: string, response = null) {
    this.emit$.next({
      key: this.getLocation(link),
      response: response
    });
  }

  getMessage(): Observable<any> {
    return this.emit$.asObservable();
  }

  // Utils
  getLocation(link: string) {
    let navigationPaths = link.split("/");
    switch (navigationPaths[navigationPaths.length - 1]) {
      case 'tag-tab':
        return ReloadPageKey.tag;
      case 'milestones-tab':
        return ReloadPageKey.milestones;
      case 'preservation-tab':
        return ReloadPageKey.preservation;
      default:
        return null;
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class ConveyData2SyncDetailService {
  private emit$ = new Subject<any>();

  sendMessage(response:
    {
      dataRequest: SyncResponse,
      dataResponse: SyncResponse,
    }, isOpen: boolean = false) {
    this.emit$.next({
      isOpen: isOpen,
      response: response
    });
  }

  getMessage(): Observable<any> {
    return this.emit$.asObservable();
  }
}

@Injectable({
  providedIn: 'root',
})
export class DownloadStatusService {
  private emitProgress$ = new Subject<any>();
  private emitReload$ = new Subject<any>();
  private emitTags$ = new Subject<any>();
  private emitMilestones$ = new Subject<any>();
  private emitPreservation$ = new Subject<any>();
  // Amount of Requests
  private requestTagsAmount = 0;
  private requestMilestoneAmount = 0;
  private requestPreservationAmount = 0;
  // List of Requests
  private totalTags = new Array();
  private downloadedTags = new Array();
  private totalMilestones = new Array();
  private downloadedMilestones = new Array();
  private totalPreservation = new Array();
  private downloadedPreservation = new Array();

  typeRequest = TypeDownloadRequest;

  private increaseRequests(items: DownloadDetailStatus[], type: string = this.typeRequest.tags) {
    switch (type) {
      case this.typeRequest.tags:
        this.requestTagsAmount += 1;
        this.totalTags = this.totalTags.concat([...items]);
        break;
      case this.typeRequest.milestones:
        this.requestMilestoneAmount += 1;
        this.totalMilestones = this.totalMilestones.concat([...items]);
        break;
      case this.typeRequest.preservation:
        this.requestPreservationAmount += 1;
        this.totalPreservation = this.totalPreservation.concat([...items]);
        break;
    }
    this.sendProgress();
  }

  private decreaseRequests(items: DownloadDetailStatus[], type: string = this.typeRequest.tags) {
    switch (type) {
      case this.typeRequest.tags:
        if (this.requestTagsAmount > 0) {
          this.requestTagsAmount -= 1;
        }
        this.downloadedTags = this.downloadedTags.concat([...items]);
        break;
      case this.typeRequest.milestones:
        if (this.requestMilestoneAmount > 0) {
          this.requestMilestoneAmount -= 1;
        }
        this.downloadedMilestones = this.downloadedMilestones.concat([...items]);
        break;
      case this.typeRequest.preservation:
        if (this.requestPreservationAmount > 0) {
          this.requestPreservationAmount -= 1;
        }
        this.downloadedPreservation = this.downloadedPreservation.concat([...items]);
        break;
    }
    this.sendProgress();
  }

  private sendProgress() {
    this.emitProgress$.next({
      totalTags: this.totalTags,
      downloadedTags: this.downloadedTags,
      totalMilestones: this.totalMilestones,
      downloadedMilestones: this.downloadedMilestones,
      totalPreservation: this.totalPreservation,
      downloadedPreservation: this.downloadedPreservation,
    });
  }

  //#region Tags
  sendMessage4Tags(obj: DownloadRequest) {
    obj.isDownloading ? this.increaseRequests(obj.items) : this.decreaseRequests(obj.items);
    this.emitTags$.next({
      requestTagsAmount: this.requestTagsAmount,
      isDownloading: this.isDownloading(obj.isDownloading)
    });
  }

  getMessage4Tags(): Observable<any> {
    return this.emitTags$.asObservable();
  }
  //#endregion Tags

  //#region Milestones
  sendMessage4Milestones(obj: DownloadRequest) {
    obj.isDownloading ? this.increaseRequests(obj.items, this.typeRequest.milestones) : this.decreaseRequests(obj.items, this.typeRequest.milestones);
    this.emitMilestones$.next({
      requestMilestoneAmount: this.requestMilestoneAmount,
      isDownloading: this.isDownloading(obj.isDownloading)
    });
  }

  getMessage4Milestones(): Observable<any> {
    return this.emitMilestones$.asObservable();
  }
  //#endregion Milestones

  //#region Preservation
  sendMessage4Preservation(obj: DownloadRequest) {
    obj.isDownloading ? this.increaseRequests(obj.items, this.typeRequest.preservation) : this.decreaseRequests(obj.items, this.typeRequest.preservation);
    this.emitPreservation$.next({
      requestPreservationAmount: this.requestPreservationAmount,
      isDownloading: this.isDownloading(obj.isDownloading)
    });
  }

  getMessage4Preservation(): Observable<any> {
    return this.emitPreservation$.asObservable();
  }
  //#endregion Preservation

  getProgress(): Observable<any> {
    return this.emitProgress$.asObservable();
  }

  reloadDownloadDetail(isReload) {
    this.emitReload$.next(isReload);
  }

  getReloadDownloadDetail() {
    return this.emitReload$.asObservable();
  }

  resetBy(type: string) {
    switch (type) {
      case this.typeRequest.tags:
        this.requestTagsAmount = 0;
        this.totalTags = new Array();
        this.downloadedTags = new Array();
        break;
      case this.typeRequest.milestones:
        this.requestMilestoneAmount = 0;
        this.totalMilestones = new Array();
        this.downloadedMilestones = new Array();
        break;
      case this.typeRequest.preservation:
        this.requestPreservationAmount = 0;
        this.totalPreservation = new Array();
        this.downloadedPreservation = new Array();
        break;
    }
  }

  reset(type: string = this.typeRequest.all, isSetStatus = false) {
    this.requestTagsAmount = 0;
    this.totalTags = new Array();
    this.downloadedTags = new Array();
    this.requestMilestoneAmount = 0;
    this.totalMilestones = new Array();
    this.downloadedMilestones = new Array();
    this.requestPreservationAmount = 0;
    this.totalPreservation = new Array();
    this.downloadedPreservation = new Array();
    if (isSetStatus) {
      switch (type) {
        case this.typeRequest.tags:
          this.sendMessage4Tags(new DownloadRequest());
          break;
        case this.typeRequest.milestones:
          this.sendMessage4Milestones(new DownloadRequest());
          break;
        case this.typeRequest.preservation:
          this.sendMessage4Preservation(new DownloadRequest());
          break;
        default:
          this.sendMessage4Tags(new DownloadRequest());
          this.sendMessage4Milestones(new DownloadRequest());
          this.sendMessage4Preservation(new DownloadRequest());
          break;
      }

    }
  }

  // Utils
  isDownloading(specificDownloadingV: boolean) {
    if (!specificDownloadingV &&
      (this.totalMilestones.length > this.downloadedMilestones.length
        || this.totalTags.length > this.downloadedTags.length
        || this.totalPreservation.length > this.downloadedPreservation.length)) {
      return true;
    }
    return specificDownloadingV;
  }
}

class DownloadRequest {
  isDownloading: boolean = false;
  items: DownloadDetailStatus[] = new Array();
}

export const RecheckDate = (date1, date2) => {
  const date1utc = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const date2utc = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const day = 1000 * 60 * 60 * 24;
  return (date2utc - date1utc) / day;
}