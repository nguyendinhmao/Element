import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreateDrawingTypeModel, DataDrawingTypeModel, UpdateDrawingTypeModel } from 'src/app/shared/models/data-tab/data-drawingtype.model';

export interface IDataDrawingTypeService {
  getDataDrawingType(projectId: string, pageIndex: number, pageSize: number, sortExpression?: string, drawingTypeCode?: string): Observable<ApiListResponse>;
  getDrawingTypeId(id: string): Observable<DataDrawingTypeModel>;
  updateDrawingType(model: UpdateDrawingTypeModel): Observable<ApiResponse>;
  deleteDrawingType(id: string): Observable<ApiResponse>;
  exportToExcel(model: ExportParamModel): Observable<ExportModel>;
  insertDrawingTypesViaCsvFile(projectId: string, file: File): Observable<ApiResponse>;
  getDrawingTypeLookUp(projectId: string): Observable<ApiListResponse>;
}

@Injectable({
  providedIn: 'root',
})
export class DataDrawingTypeService implements IDataDrawingTypeService {
  constructor(
    private http: HttpService
  ) { }
  getDrawingTypeLookUp(projectId: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectId', projectId);
    return this.http.HttpGet(ApiUrl.DrawingTypeLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getDataDrawingType(projectId: string, pageNumber: number, pageSize: number, sortExpression?: string, drawingTypeCode?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectId', projectId);
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression);
    params = params.append('drawingTypeCode', drawingTypeCode);
    return this.http.HttpGet(ApiUrl.DataDrawingTypesList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getDrawingTypeId(id: string): Observable<DataDrawingTypeModel> {
    let params = new HttpParams();
    params = params.append('drawingTypeId', id.toString());
    return this.http.HttpGet(ApiUrl.GetDrawingTypeById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  createDrawingType(model: CreateDrawingTypeModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.CreateDrawingType, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateDrawingType(model: UpdateDrawingTypeModel): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('data', JSON.stringify(model));
    return this.http.HttpPostFormData(ApiUrl.UpdateDrawingType, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  insertDrawingTypesViaCsvFile(projectId: string, file: File): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);
    return this.http.HttpPostFormData(ApiUrl.InsertDrawingTypesViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteDrawingType(id: string): Observable<ApiResponse> {
    var body = {
      drawingTypeId: id
    };
    return this.http.HttpPost(ApiUrl.DeleteDrawingType, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  exportToExcel(model: ExportParamModel): Observable<ExportModel> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
