import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreateJobCardModel, UpdateJobCardModel } from 'src/app/shared/models/data-tab/data-jobcard.model';

export interface IDatadisciplineService {
  getDataJobCard(pageIndex: number, pageSize: number, projectKey: string, sortExpression?: string, disciplineCode?: string): Observable<ApiListResponse>;
  getJobCardId(id: string);
  deleteJobCard(id: string): Observable<ApiResponse>;
  exportToExcel(model: ExportParamModel): Observable<ExportModel>;
}

@Injectable({
  providedIn: 'root',
})
export class DataJobCardService implements IDatadisciplineService {
  constructor(
    private http: HttpService
  ) { }

  getDataJobCard(pageNumber: number, pageSize: number, projectKey: string, sortExpression?: string, jobcardNo?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression);
    params = params.append('jobcardNo', jobcardNo);
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.DataJobCardList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getJobCardId(id: string) {
    let params = new HttpParams();
    params = params.append('jobCardId', id.toString());
    return this.http.HttpGet(ApiUrl.GetJobCardById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  createJobCard(model: CreateJobCardModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.CreateJobCard, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateJobCard(model: UpdateJobCardModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdateJobCard, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  insertJobCardsViaCsvFile(file: File, projectKey: string): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectKey', projectKey.toString());
    return this.http.HttpPostFormData(ApiUrl.InsertJobCardsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteJobCard(id: string): Observable<ApiResponse> {
    var body = {
      jobCardId: id
    };
    return this.http.HttpPost(ApiUrl.DeleteJobCard, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  exportToExcel(model: ExportParamModel): Observable<ExportModel> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
