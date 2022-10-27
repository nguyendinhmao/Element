import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreateWorkpackModel, DataWorkpackModel, UpdateWorkpackModel } from 'src/app/shared/models/data-tab/data-workpack.model';

export interface IDataWorkpackService {
  getDataWorkpack(pageIndex: number, pageSize: number, sortExpression?: string, workpackNo?: string): Observable<ApiListResponse>;
  getWorkpackId(id: string): Observable<DataWorkpackModel>;
  updateWorkpack(model: UpdateWorkpackModel): Observable<ApiResponse>;
  deleteWorkpack(id: string): Observable<ApiResponse>;
  exportToExcel(model: ExportParamModel): Observable<ExportModel>;
  insertWorkpacksViaCsvFile(file: File, projectKey: string): Observable<ApiResponse>;
  getWorkPackLookUp(projectKey: string): Observable<ApiListResponse>;
}

@Injectable({
  providedIn: 'root',
})
export class DataWorkpackService implements IDataWorkpackService {
  constructor(
    private http: HttpService
  ) { }
  getWorkPackLookUp(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.WorkPackLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getDataWorkpack(pageNumber: number, pageSize: number, projectKey: string, sortExpression?: string, workpackNo?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression);
    params = params.append('workPackNo', workpackNo);
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.DataWorkpacksList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getWorkpackId(id: string): Observable<DataWorkpackModel> {
    let params = new HttpParams();
    params = params.append('workPackId', id.toString());
    return this.http.HttpGet(ApiUrl.GetWorkpackById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  updateWorkpack(model: UpdateWorkpackModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdateWorkpack, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  createWorkpack(model: CreateWorkpackModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.CreateWorkPack, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  insertWorkpacksViaCsvFile(file: File, projectKey: string): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectKey', projectKey.toString());
    return this.http.HttpPostFormData(ApiUrl.InsertWorkpacksViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteWorkpack(id: string): Observable<ApiResponse> {
    var body = {
      workPackId: id
    };
    return this.http.HttpPost(ApiUrl.DeleteWorkpack, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  exportToExcel(model: ExportParamModel): Observable<ExportModel> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
