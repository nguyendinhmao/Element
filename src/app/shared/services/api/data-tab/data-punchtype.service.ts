import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreatePunchTypeModel, DataPunchTypeModel, UpdatePunchTypeModel } from 'src/app/shared/models/data-tab/data-punchtype.model';

export interface IDataPunchTypeService {
  getDataPunchType(pageIndex: number, pageSize: number, projectKey: string, sortExpression?: string, punchTypeCode?: string): Observable<ApiListResponse>;
  getPunchTypeId(id: string): Observable<DataPunchTypeModel>;
  deletePunchType(id: string): Observable<ApiResponse>;
  exportToExcel(model: ExportParamModel): Observable<ExportModel>;
  getPunchTypeLookUp(projectKey: string): Observable<ApiListResponse>;
}

@Injectable({
  providedIn: 'root',
})
export class DataPunchTypeService implements IDataPunchTypeService {
  constructor(
    private http: HttpService
  ) { }
  getPunchTypeLookUp(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.PunchTypeLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getDataPunchType(pageNumber: number, pageSize: number, projectKey: string, sortExpression?: string, punchTypeCode?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression);
    params = params.append('type', punchTypeCode);
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.DataPunchTypeList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getPunchTypeId(id: string): Observable<DataPunchTypeModel> {
    let params = new HttpParams();
    params = params.append('punchTypeId', id.toString());
    return this.http.HttpGet(ApiUrl.GetPunchTypeById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  updatePunchType(model: UpdatePunchTypeModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdatePunchType, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  createPunchType(model: CreatePunchTypeModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.CreatePunchType, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  insertPunchTypesViaCsvFile(file: File, projectKey: string): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectKey', projectKey.toString());
    return this.http.HttpPostFormData(ApiUrl.InsertPunchTypesViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deletePunchType(id: string): Observable<ApiResponse> {
    var body = {
      punchTypeId: id
    };
    return this.http.HttpPost(ApiUrl.DeletePunchType, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  exportToExcel(model: ExportParamModel): Observable<ExportModel> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
