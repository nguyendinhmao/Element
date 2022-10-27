import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { AddCommentPresInfoCommand, DeleteCommentPresInfoCommand, ElementPresTabNewCommand, ElementPresTabStatusCommand, ElementPresTabUpdateImagesCommand, PreservationElementImagesCommand, SignOffPreservationCommand } from 'src/app/shared/models/preservation-tab/preservation-tab.model';
import { ApiUrl } from '../../api-url/api-url';
import { HttpService } from '../../http/http.service';
import { ApiHelper } from '../api-helper';


export interface IPreservationTabServices {
  getPreservationTabList(projectKey: string, tagNo: string, pageIndex: number, pageSize: number, sortExpression: string, elementId?: string, status?: number): Observable<ApiListResponse>;
  updateElementStatus(model: ElementPresTabStatusCommand, status: string): Observable<ApiResponse>;
  uploadElementImages(uploadImages: PreservationElementImagesCommand, images: File[]): Observable<ApiResponse>;
  getPreservationElementLookUpByProjectKey(projectKey: string): Observable<ApiListResponse>;
  addElementInPreservationTab(model: ElementPresTabNewCommand): Observable<ApiListResponse>;
  deleteElementInPreservationTab(preservationIds: string[], projectKey: string): Observable<ApiListResponse>;
  preservationSignValidate(elementId: string, projectKey: string): Observable<ApiResponse>;
  preservationSignOff(signOffPreservationCommand: SignOffPreservationCommand): Observable<ApiResponse>;
  getDataTagPreservationPage(projectKey: string, pageIndex: number, pageSize: number, sortExpression?: string, system?: string, subSystem?: string, description?: string, discipline?: string, equipmentType?: string, status?: string, location?: string,): Observable<ApiListResponse>;
  lookupTagsPreservationPage(projectKey: string, system?: string, subSystem?: string, description?: string, discipline?: string, equipmentType?: string, status?: string, location?: string): Observable<ApiListResponse>;
  deleteCommentPreservationInfo(model: DeleteCommentPresInfoCommand): Observable<ApiListResponse>;
  addCommentPreservationInfo(model: AddCommentPresInfoCommand): Observable<ApiListResponse>
}

@Injectable({
  providedIn: "root",
})
export class PreservationTabServices implements IPreservationTabServices {
  constructor(
    private http: HttpService,
  ) { }
  getPreservationTabList(projectKey: string, tagNo: string, pageIndex: number, pageSize: number, sortExpression: string, elementId?: string, status?: number): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey);
    params = params.append('tagNo', tagNo || "");
    params = params.append('elementId', elementId || "");
    params = params.append('status', status.toString());
    params = params.append('pageNumber', pageIndex.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression || "");
    return this.http.HttpGet(ApiUrl.PreservationList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getDataTagPreservationPage(projectKey: string, pageIndex: number, pageSize: number, sortExpression?: string, system?: string, subSystem?: string, description?: string, discipline?: string, equipmentType?: string, status?: string, location?: string, tagIds?: string[]): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('system', system || "");
    params = params.append('subSystem', subSystem || "");
    params = params.append('discipline', discipline || "");
    params = params.append('equipmentType', equipmentType || "");
    params = params.append('status', status || "");
    params = params.append('location', location || "")
    params = params.append('sortExpression', sortExpression);
    params = params.append('projectKey', projectKey);
    params = params.append('pageNumber', pageIndex.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('description', description || "");
    let _tagIds = '';
    if (tagIds && tagIds.length > 0) {
      _tagIds = tagIds.toString();
    }
    params = params.append('tagIds', _tagIds);
    return this.http.HttpGet(ApiUrl.TagPreservationPageList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  lookupTagsPreservationPage(projectKey: string, system?: string, subSystem?: string, description?: string, discipline?: string, equipmentType?: string, status?: string, location?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey);
    params = params.append('system', system || "");
    params = params.append('subSystem', subSystem || "");
    params = params.append('discipline', discipline || "");
    params = params.append('equipmentType', equipmentType || "");
    params = params.append('status', status || "");
    params = params.append('location', location || "")
    params = params.append('description', description || "");
    return this.http.HttpGet(ApiUrl.TagPreservationLookup, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateElementStatus(model: ElementPresTabStatusCommand, status: string): Observable<ApiResponse> {
    let _url = '';
    switch (status) {
      case 'RESUME':
      case 'PAUSED':
        _url = ApiUrl.ResumePreservation;
        break;
      case 'STOPPED':
        _url = ApiUrl.StopPreservation;
        break;
      default:
        _url = ApiUrl.PausePreservation;
        break;
    }
    return this.http.HttpPost(_url, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  uploadElementImages(uploadImages: PreservationElementImagesCommand, images: File[]): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    images.forEach(element => {
      formData.append("images", element)
    });
    formData.append("model", JSON.stringify(uploadImages));
    return this.http.HttpPostFormData(ApiUrl.UpdateImagePreservation, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  preservationSignValidate(elementId: string, projectKey: string): Observable<ApiResponse> {
    let params = {
      preservationId: elementId,
      projectKey: projectKey || '',
    };
    return this.http.HttpPost(ApiUrl.PreservationSignValidate, JSON.stringify(params), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  preservationSignOff(signOffPreservationCommand: SignOffPreservationCommand): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.SignOffPreservation, JSON.stringify(signOffPreservationCommand), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getPreservationElementLookUpByProjectKey(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey);
    return this.http.HttpGet(ApiUrl.PreservationElementLookUpByProjectKey, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  addElementInPreservationTab(model: ElementPresTabNewCommand): Observable<ApiListResponse> {
    return this.http.HttpPost(ApiUrl.AddPreservation, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  deleteElementInPreservationTab(preservationIds: string[], projectKey: string): Observable<ApiListResponse> {
    let params = {
      "preservationIds": preservationIds,
      "projectKey": projectKey,
    };
    return this.http.HttpPost(ApiUrl.DeletePreservation, JSON.stringify(params), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail))
  }
  addCommentPreservationInfo(model: AddCommentPresInfoCommand): Observable<ApiListResponse> {
    return this.http.HttpPost(ApiUrl.AddCommentPreservation, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  deleteCommentPreservationInfo(model: DeleteCommentPresInfoCommand): Observable<ApiListResponse> {
    return this.http.HttpPost(ApiUrl.DeleteCommentPreservation, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  downloadPreservationData(projectKey: string, tagIds: string[]) {
    var body = {
      projectKey: projectKey,
      tagIds: tagIds || null,
    };
    return this.http.HttpPostWithProgress(ApiUrl.DownloadDataPreservation, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  lockPreservation(projectKey: string, tagIds: string[]): Observable<ApiResponse> {
    var body = {
      projectKey: projectKey,
      tagIds: tagIds || null,
    };
    return this.http
      .HttpPost(ApiUrl.LockTagPreservations, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  unlockPreservation(projectKey: string, tagIds: string[]): Observable<ApiResponse> {
    var body = {
      projectKey: projectKey,
      tagIds: tagIds || null,
    };
    return this.http
      .HttpPost(ApiUrl.UnlockTagPreservations, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}