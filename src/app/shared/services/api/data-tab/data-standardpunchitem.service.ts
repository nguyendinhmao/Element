import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { DataPunchTypeModel, UpdatePunchTypeModel } from 'src/app/shared/models/data-tab/data-punchtype.model';
import { CreateStandardPunchItemModel, UpdateStandardPunchItemModel } from 'src/app/shared/models/data-tab/data-standardpunchitem.model';

export interface IDataPunchTypeService {
  getStandardPunchItem(pageIndex: number, pageSize: number, projectKey: string, sortExpression?: string, punchTypeCode?: string): Observable<ApiListResponse>;
  getStandardPunchItemId(id: string): Observable<UpdateStandardPunchItemModel>;
  deletegetStandardPunchItem(id: string): Observable<ApiResponse>;
  exportToExcel(model: ExportParamModel): Observable<ExportModel>;
}

@Injectable({
  providedIn: 'root',
})
export class DataStandardPunchItemService implements IDataPunchTypeService {
  constructor(
    private http: HttpService
  ) { }
  deletegetStandardPunchItem(id: string): Observable<ApiResponse> {
    var body = {
      Id: id
    };
    return this.http.HttpPost(ApiUrl.DeleteStandardPunchItem, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getStandardPunchItem(pageNumber: number, pageSize: number, projectKey: string, sortExpression?: string, punchTypeCode?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression);
    params = params.append('disciplineCode', punchTypeCode);
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.DataStandardPunchItem, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getStandardPunchItemId(id: string): Observable<UpdateStandardPunchItemModel> {
    let params = new HttpParams();
    params = params.append('standardPunchItemId', id.toString());
    return this.http.HttpGet(ApiUrl.StandardPunchItemDetail, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  updateStandardPunchItem(model: UpdateStandardPunchItemModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdateStandardPunchItem, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  createStandardPunchItem(model: CreateStandardPunchItemModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.CreateStandardPunchItem, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  insertStandardPunchItemsViaCsvFile(file: File, projectKey: string): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectKey', projectKey);
    return this.http.HttpPostFormData(ApiUrl.InsertStandardPunchItemsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  exportToExcel(model: ExportParamModel): Observable<ExportModel> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
