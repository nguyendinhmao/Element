import {
  UpdateTagTabSideMenu,
  ItrAllowcateUpdateModel,
  TagPucnhDetail,
  SynchronizeDataCommand,
} from "src/app/shared/models/tab-tag/tab-tag.model";
import { HttpService, ApiUrl, ApiHelper } from "../..";
import { Observable } from "rxjs";
import {
  ApiResponse,
  ApiListResponse,
} from "src/app/shared/models/api-response/api-response";
import { Injectable } from "@angular/core";
import { catchError, map } from "rxjs/operators";
import { HttpParams } from "@angular/common/http";
import {
  UpdateItrRecordModel,
  RecordSignValidateCommand,
  ApprovedRecordCommand,
} from "../../../models/tab-tag/itr-record.model";
import { TabSideMenuModel } from "src/app/shared/models/tab-tag/tab-side-menu.model";
export interface ITagTabService {
  updateTagNo(model: UpdateTagTabSideMenu): Observable<ApiResponse>;
  getTagItrList(tagId: string): Observable<ApiListResponse>;
  getTagPunchDetail(tagId: string): Observable<TagPucnhDetail>;
  getTagTabSideMenuDetail(tagId: string): Observable<TabSideMenuModel>;
  updateTagItrTabSideMenu(
    model: ItrAllowcateUpdateModel
  ): Observable<ApiListResponse>;
  getItrRecord(recordId: string): Observable<ApiResponse>;
  updateItrRecordDetail(model: UpdateItrRecordModel): Observable<ApiResponse>;
  signValidate(model: RecordSignValidateCommand): Observable<ApiResponse>;
  downloadTagData(projectKey: string, tagIds: string[]): Observable<ApiResponse>;
  lockTags(projectKey: string, tagIds: string[]): Observable<ApiResponse>;
  unlockTags(projectKey: string, tagIds: string[]): Observable<ApiResponse>;
  getTagDrawingList(projectKey: string, tagId: string): Observable<ApiResponse>;
}
@Injectable({
  providedIn: "root",
})
export class TagTabService implements ITagTabService {
  constructor(private http: HttpService) { }
  getTagPunchDetail(tagId: string): Observable<TagPucnhDetail> {
    let params = new HttpParams();
    params = params.append("tagId", tagId);
    return this.http
      .HttpGet(ApiUrl.GetTagPunchDetail, params, true)
      .pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }
  getTagItrList(tagId: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("tagId", tagId);
    return this.http
      .HttpGet(ApiUrl.TagItrList, params, true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  updateTagNo(model: UpdateTagTabSideMenu): Observable<ApiResponse> {
    return this.http
      .HttpPost(ApiUrl.EditTagTabSideMenu, JSON.stringify(model), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  getTagTabSideMenuDetail(tagId: string): Observable<TabSideMenuModel> {
    let params = new HttpParams();
    params = params.append("tagId", tagId);
    return this.http
      .HttpGet(ApiUrl.TabSideMenuDetail, params, true)
      .pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }
  updateTagItrTabSideMenu(
    model: ItrAllowcateUpdateModel
  ): Observable<ApiListResponse> {
    return this.http
      .HttpPost(ApiUrl.UpdateTagItrTabSideMenu, JSON.stringify(model), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getItrRecord(recordId: string): Observable<ApiResponse> {
    let params = new HttpParams();
    params = params.append("recordId", recordId);
    return this.http
      .HttpGet(ApiUrl.ItrRecordDetail, params, true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateItrRecordDetail(model: UpdateItrRecordModel): Observable<ApiResponse> {
    return this.http
      .HttpPost(ApiUrl.UpdateITRRecordDetail, JSON.stringify(model), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  signValidate(model: RecordSignValidateCommand): Observable<ApiResponse> {
    return this.http
      .HttpPost(ApiUrl.SignRecordValidate, JSON.stringify(model), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  approveRecord(model: ApprovedRecordCommand): Observable<ApiResponse> {
    return this.http
      .HttpPost(ApiUrl.ApproveRecord, JSON.stringify(model), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  rejectRecord(id: string, projectKey: string, reason: string): Observable<ApiResponse> {
    var body = {
      recordId: id,
      projectKey: projectKey,
      rejectReason: reason
    };
    return this.http
      .HttpPost(ApiUrl.RejectRecord, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  // downloadTagData(projectKey: string, tagIds: string[]): Observable<ApiResponse> {
  //   var body = {
  //     projectKey: projectKey,
  //     tagIds: tagIds || null,
  //   };
  //   return this.http.HttpPost(ApiUrl.DownloadDataTag, JSON.stringify(body), true)
  //     .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  // }

  downloadTagData(projectKey: string, tagIds: string[]) {
    var body = {
      projectKey: projectKey,
      tagIds: tagIds || null,
    };
    return this.http.HttpPostWithProgress(ApiUrl.DownloadDataTag, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  lockTags(projectKey: string, tagIds: string[]): Observable<ApiResponse> {
    var body = {
      projectKey: projectKey,
      tagIds: tagIds || null,
    };
    return this.http
      .HttpPost(ApiUrl.LockTags, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  unlockTags(projectKey: string, tagIds: string[]): Observable<ApiResponse> {
    var body = {
      projectKey: projectKey,
      tagIds: tagIds || null,
    };
    return this.http
      .HttpPost(ApiUrl.UnlockTags, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  synchronizeDownloadedData(syncDataTagsCommand: SynchronizeDataCommand) {
    return this.http
      .HttpPost(ApiUrl.SynchronizeDataTags, JSON.stringify(syncDataTagsCommand), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getTagDrawingList(projectKey: string, tagId: string): Observable<ApiResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey);
    params = params.append("tagId", tagId);
    return this.http
      .HttpGet(ApiUrl.TagDrawingList, params, true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
