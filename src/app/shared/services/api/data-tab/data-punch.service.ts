import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { DataPunchModel, UpdatePunchModel } from 'src/app/shared/models/data-tab/data-punch.model';

export interface IDataPunchService {
    getDataPunch(projectKey: string, pageIndex: number, pageSize: number, sortExpression?: string, punchNo?: string): Observable<ApiListResponse>;
    getPunchId(id: string, projectKey: string): Observable<UpdatePunchModel>;
    updatePunch(model: UpdatePunchModel): Observable<ApiResponse>;
    deletePunch(id: string): Observable<ApiResponse>;
    exportToExcel(model: ExportParamModel): Observable<ExportModel>;
    insertPunchesViaCsvFile(projectId: string, file: File): Observable<ApiResponse>;
    getPunchLookUp(projectKey?: string): Observable<ApiListResponse>;
}

@Injectable({
    providedIn: 'root',
})
export class DataPunchService implements IDataPunchService {
    constructor(
        private http: HttpService
    ) { }
    getPunchLookUp(projectKey?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
    params = params.append('projectKey', projectKey || "");
        return this.http.HttpGet(ApiUrl.PunchLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getDataPunch(projectKey: string, pageNumber: number, pageSize: number, sortExpression?: string, punchNo?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey);
        params = params.append('pageNumber', pageNumber.toString());
        params = params.append('pageSize', pageSize.toString());
        params = params.append('sortExpression', sortExpression);
        params = params.append('punchNo', punchNo);
        return this.http.HttpGet(ApiUrl.DataListPunchItem, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    getPunchId(id: string, projectKey: string): Observable<UpdatePunchModel> {
        let params = new HttpParams();
        params = params.append('punchId', id.toString());
        params = params.append('projectKey', projectKey.toString());
        return this.http.HttpGet(ApiUrl.GetPunchById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
    }

    updatePunch(model: UpdatePunchModel): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.UpdatePunch, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    insertPunchesViaCsvFile(projectKey: string, file: File): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('projectKey', projectKey);
        formData.append('file', file);
        return this.http.HttpPostFormData(ApiUrl.InsertPunchesViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deletePunch(id: string): Observable<ApiResponse> {
        var body = {
            punchId: id
        };
        return this.http.HttpPost(ApiUrl.DeletePunch, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    exportToExcel(model: ExportParamModel): Observable<ExportModel> {
        let params = new HttpParams();
        params = params.append('value', JSON.stringify(model));
        return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}
