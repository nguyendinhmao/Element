import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreateSubSystemModel, DataSubSystemModel, UpdateSubSystemModel } from 'src/app/shared/models/data-tab/data-subsystem.model';

export interface IDataSubSystemService {
  getDataSubSystem(projectKey: string, pageIndex: number, pageSize: number, sortExpression?: string, subsystemCode?: string): Observable<ApiListResponse>;
  getSubSystemId(id: string): Observable<DataSubSystemModel>;
  deleteSubSystem(id: string): Observable<ApiResponse>;
  exportToExcel(model: ExportParamModel): Observable<ExportModel>;
  getSubSystemLookUp(projectKey: string, systemId?: string): Observable<ApiListResponse>;
  getSubSystemLookUpTagPage(systemId: string): Observable<ApiListResponse>
}

@Injectable({
  providedIn: 'root',
})
export class DataSubSystemService implements IDataSubSystemService {
  constructor(
    private http: HttpService
  ) { }
  getSubSystemLookUp(projectKey: string, systemId?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey || "");
    params = params.append('systemId', systemId || "");
    return this.http.HttpGet(ApiUrl.SubSystemLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getSubSystemLookUpTagPage(systemId: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('systemId', systemId.toString() || "");
    return this.http.HttpGet(ApiUrl.SubSystemLookUpTagPage, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getDataSubSystem(projectKey: string, pageNumber: number, pageSize: number, sortExpression?: string, searchKey?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey);
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression);
    params = params.append('searchKey', searchKey);
    return this.http.HttpGet(ApiUrl.DataSubSystemList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getSubSystemId(id: string): Observable<DataSubSystemModel> {
    let params = new HttpParams();
    params = params.append('subsystemId', id.toString());
    return this.http.HttpGet(ApiUrl.GetSubSystemById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  createSubSystem(model: CreateSubSystemModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.CreateSubSystem, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateSubSystem(model: UpdateSubSystemModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdateSubSystem, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  insertSubSystemsViaCsvFile(projectKey: string, file: File): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectKey', projectKey);
    return this.http.HttpPostFormData(ApiUrl.InsertSubSystemsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteSubSystem(id: string): Observable<ApiResponse> {
    var body = {
      subsystemId: id
    };
    return this.http.HttpPost(ApiUrl.DeleteSubSystem, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  exportToExcel(model: ExportParamModel): Observable<ExportModel> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
