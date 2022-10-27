import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreateMaterialModel, DataMaterialModel, UpdateMaterialModel } from 'src/app/shared/models/data-tab/data-material.model';

export interface IDataMaterialService {
    getDataMaterial(pageIndex: number, pageSize: number, projectKey: string, sortExpression?: string, materialCode?: string): Observable<ApiListResponse>;
    getMaterialId(id: string): Observable<DataMaterialModel>;
    updateMaterial(model: UpdateMaterialModel): Observable<ApiResponse>;
    deleteMaterial(id: string): Observable<ApiResponse>;
    exportToExcel(model: ExportParamModel): Observable<ExportModel>;
    insertMaterialsViaCsvFile(file: File, projectKey: string): Observable<ApiResponse>;
    getMaterialLookUp(projectKey: string): Observable<ApiListResponse>;
}

@Injectable({
    providedIn: 'root',
})
export class DataMaterialService implements IDataMaterialService {
    constructor(
        private http: HttpService
    ) { }
    getMaterialLookUp(projectKey: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey.toString());
        return this.http.HttpGet(ApiUrl.MaterialLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getDataMaterial(pageNumber: number, pageSize: number, projectKey: string, sortExpression?: string, materialCode?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey.toString());
        params = params.append('pageNumber', pageNumber.toString());
        params = params.append('pageSize', pageSize.toString());
        params = params.append('sortExpression', sortExpression);
        params = params.append('materialCode', materialCode);
        return this.http.HttpGet(ApiUrl.DataMaterialsList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    getMaterialId(id: string): Observable<DataMaterialModel> {
        let params = new HttpParams();
        params = params.append('materialId', id.toString());
        return this.http.HttpGet(ApiUrl.GetMaterialById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
    }

    createMaterial(model: CreateMaterialModel): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('data', JSON.stringify(model));
        return this.http.HttpPostFormData(ApiUrl.CreateMaterial, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    updateMaterial(model: UpdateMaterialModel): Observable<ApiResponse> {
      let formData: FormData = new FormData();
      formData.append('data', JSON.stringify(model));
      return this.http.HttpPostFormData(ApiUrl.UpdateMaterial, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    insertMaterialsViaCsvFile(file: File, projectKey: string): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('projectKey', projectKey.toString());
        formData.append('file', file);
        return this.http.HttpPostFormData(ApiUrl.InsertMaterialsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deleteMaterial(id: string): Observable<ApiResponse> {
        var body = {
            materialId: id
        };
        return this.http.HttpPost(ApiUrl.DeleteMaterial, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    exportToExcel(model: ExportParamModel): Observable<ExportModel> {
        let params = new HttpParams();
        params = params.append('value', JSON.stringify(model));
        return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}
