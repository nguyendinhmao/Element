import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreateTagNoModel, UpdateTagNoModel } from 'src/app/shared/models/data-tab/data-tagno.model';
import { UpdateTagPageModel } from 'src/app/shared/models/tab-tag/tab-tag.model';

export interface IDataTagNoService {
  getDataTagNo(projectKey: string, pageIndex: number, pageSize: number, sortExpression?: string, tagNoCode?: string): Observable<ApiListResponse>;
  getTagNoId(id: string): Observable<UpdateTagNoModel>;
  deleteTagNo(id: string): Observable<ApiResponse>;
  exportToExcel(model: ExportParamModel): Observable<ExportModel>;
  getTagTypeList(): Observable<ApiListResponse>;
  getDataTagPage(projectKey: string,
    pageIndex: number,
    pageSize: number,
    sortExpression?: string,
    system?: string,
    subSystem?: string,
    parent?: string,
    discipline?: string,
    equipmentType?: string,
    status?: string,
    location?: string,
    tagType?: string): Observable<ApiListResponse>;
  applyTagList(tagListModify: UpdateTagPageModel[], dataApplyModel: any): Observable<ApiListResponse>;
  getTagParentLookUp(projectKey: string): Observable<ApiListResponse>;
  getTagDrawingLookup(projectKey: string): Observable<ApiListResponse>;
  createTagNo(model: CreateTagNoModel, images: File[]): Observable<ApiResponse>;
}

@Injectable({
  providedIn: 'root',
})

export class DataTagNoService implements IDataTagNoService {
  constructor(
    private http: HttpService
  ) { }

  getTagDrawingLookup(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    return this.http
      .HttpGet(ApiUrl.TagDrawingLookUp, params, true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  applyTagList(listTagModify: UpdateTagPageModel[], dataApplyModel: any): Observable<ApiListResponse> {
    return this.http.HttpPost(ApiUrl.ApplyTagList, JSON.stringify({ dataApplyModel, listTagModify }), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getDataTagPage(projectKey: string, pageIndex: number, pageSize: number, sortExpression?: string, system?: string, subSystem?: string, parent?: string, discipline?: string, equipmentType?: string, status?: string, location?: string, tagType?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('system', system || "");
    params = params.append('subSystem', subSystem || "");
    params = params.append('parent', parent || "");
    params = params.append('discipline', discipline || "");
    params = params.append('equipmentType', equipmentType || "");
    params = params.append('status', status || "");
    params = params.append('tagType', tagType || "");
    params = params.append('location', location || "")
    params = params.append('sortExpression', sortExpression);
    params = params.append('projectKey', projectKey);
    params = params.append('pageNumber', pageIndex.toString());
    params = params.append('pageSize', pageSize.toString());
    return this.http.HttpGet(ApiUrl.TagPageList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getDataTagNo(projectKey: string, pageNumber: number, pageSize: number, sortExpression?: string, tagNoCode?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('projectKey', projectKey);
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression);
    params = params.append('searchKey', tagNoCode);
    return this.http.HttpGet(ApiUrl.TagList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getTagNoId(id: string): Observable<UpdateTagNoModel> {
    let params = new HttpParams();
    params = params.append('TagId', id.toString());
    return this.http.HttpGet(ApiUrl.TagDetail, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  createTagNo(model: CreateTagNoModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.CreateTag, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateTagNo(model: UpdateTagNoModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdateTag, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  insertTagNosViaCsvFile(projectKey: string, file: File): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectKey', projectKey);
    return this.http.HttpPostFormData(ApiUrl.InsertTagsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  insertTagDrawingViaCsvFile(projectKey: string, file: File): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectKey', projectKey);
    return this.http.HttpPostFormData(ApiUrl.InsertDrawingTagsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteTagNo(id: string): Observable<ApiResponse> {
    var body = {
      TagId: id
    };
    return this.http.HttpPost(ApiUrl.DeleteTag, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getTagLookUp(projectKey: string, tagId?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey.toString());
    params = params.append('tagId', tagId || "");
    return this.http.HttpGet(ApiUrl.TagLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getTagParentLookUp(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.TagParentLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  exportToExcel(model: ExportParamModel): Observable<ExportModel> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getTagTypeList() {
    return this.http.HttpGet(ApiUrl.TagTypeList, null, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }
}
