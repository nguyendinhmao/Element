import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreatePreservationElementModel, DataPreservationElementModel, UpdatePreservationElementModel } from 'src/app/shared/models/data-tab/data-preservationelement.model';

export interface IDataPreservationElementService {
  getDataPreservationElement(projectId: string, pageIndex: number, pageSize: number, sortExpression?: string, elementNo?: string): Observable<ApiListResponse>;
  getPreservationElementId(id: string): Observable<DataPreservationElementModel>;
  updatePreservationElement(model: UpdatePreservationElementModel): Observable<ApiResponse>;
  deletePreservationElement(id: string): Observable<ApiResponse>;
  exportToExcel(model: ExportParamModel): Observable<ExportModel>;
  insertPreservationElementsViaCsvFile(projectId: string, file: File): Observable<ApiResponse>;
  getPreservationElementLookUp(projectId: string): Observable<ApiListResponse>;
}

@Injectable({
  providedIn: 'root',
})
export class DataPreservationElementService implements IDataPreservationElementService {
  constructor(
    private http: HttpService
  ) { }
  getPreservationElementLookUp(projectId: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectId', projectId);
    return this.http.HttpGet(ApiUrl.PreservationElementLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getDataPreservationElement(projectId: string, pageNumber: number, pageSize: number, sortExpression?: string, elementNo?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectId', projectId);
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression);
    params = params.append('elementNo', elementNo);
    return this.http.HttpGet(ApiUrl.DataPreservationElementsList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getPreservationElementId(id: string): Observable<DataPreservationElementModel> {
    let params = new HttpParams();
    params = params.append('id', id.toString());
    return this.http.HttpGet(ApiUrl.GetPreservationElementById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  createPreservationElement(model: CreatePreservationElementModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.CreatePreservationElement, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updatePreservationElement(model: UpdatePreservationElementModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdatePreservationElement, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  insertPreservationElementsViaCsvFile(projectId: string, file: File): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);
    return this.http.HttpPostFormData(ApiUrl.InsertPreservationElementsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deletePreservationElement(id: string): Observable<ApiResponse> {
    var body = {
      id: id
    };
    return this.http.HttpPost(ApiUrl.DeletePreservationElement, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  exportToExcel(model: ExportParamModel): Observable<ExportModel> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
