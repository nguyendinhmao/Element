import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreateMilestoneModel, DataMilestoneModel, UpdateMilestoneModel } from 'src/app/shared/models/data-tab/data-milestone.model';

export interface IDataMilestone {
  getMilestoneLookUp(projectKey?: string): Observable<ApiListResponse>;
  getDataMilestone(projectId: string, pageIndex: number, pageSize: number, sortExpression?: string, milestoneName?: string): Observable<ApiListResponse>;
  getMilestoneId(id: string): Observable<DataMilestoneModel>;
  updateMilestone(model: UpdateMilestoneModel): Observable<ApiResponse>;
  deleteMilestone(id: string): Observable<ApiResponse>;
  exportToExcel(model: ExportParamModel): Observable<ExportModel>;
  insertMilestonesViaCsvFile(projectId: string, file: File): Observable<ApiResponse>;
}
@Injectable({
  providedIn: 'root',
})
export class DataMilestoneService implements IDataMilestone {
  constructor(
    private http: HttpService
  ) { }

  getMilestoneLookUp(projectKey?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey || "");
    return this.http.HttpGet(ApiUrl.MilestoneLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  getDataMilestone(projectId: string, pageNumber: number, pageSize: number, sortExpression?: string, milestoneName?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectId', projectId);
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression);
    params = params.append('milestoneName', milestoneName);
    return this.http.HttpGet(ApiUrl.DataMilestonesList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getMilestoneId(id: string): Observable<DataMilestoneModel> {
    let params = new HttpParams();
    params = params.append('milestoneId', id.toString());
    return this.http.HttpGet(ApiUrl.GetMilestoneById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  createMilestone(model: CreateMilestoneModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.CreateMilestone, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateMilestone(model: UpdateMilestoneModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdateMilestone, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  insertMilestonesViaCsvFile(projectId: string, file: File): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);
    return this.http.HttpPostFormData(ApiUrl.InsertMilestonesViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteMilestone(id: string): Observable<ApiResponse> {
    var body = {
      milestoneId: id
    };
    return this.http.HttpPost(ApiUrl.DeleteMilestone, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  exportToExcel(model: ExportParamModel): Observable<ExportModel> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
