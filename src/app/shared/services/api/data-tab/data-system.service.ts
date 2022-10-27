import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { ApiResponse, ApiListResponse } from 'src/app/shared/models/api-response/api-response';

export interface IDataSystemService {
    getDataSystem(projectKey: string, pageNumber: number, pageSize: number, sortExpression?: string, searchKey?: string): Observable<ApiListResponse>;
    exportToExcel(model: ExportParamModel): Observable<ExportModel>;
    getElementSystemLookUp(): Observable<ApiListResponse>;
}
@Injectable({
    providedIn: 'root',
})

export class DataSystemService implements IDataSystemService {

    constructor(
        private http: HttpService
    ) { }
    getElementSystemLookUp(projectKey?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey || "");
        return this.http.HttpGet(ApiUrl.ElementSystemLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
    getElementSystemLookUpTagPage(projectKey?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey || "");
        return this.http.HttpGet(ApiUrl.GetSystemLookUpTagPage, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
    getElementSystemLookUpPunchPage(projectKey?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey || "");
        return this.http.HttpGet(ApiUrl.GetSystemLookUpPunchPage, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getDataSystem(projectKey: string, pageNumber: number, pageSize: number, sortExpression?: string, searchKey?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey);
        params = params.append('pageNumber', pageNumber.toString());
        params = params.append('pageSize', pageSize.toString());
        params = params.append('sortExpression', sortExpression);
        params = params.append('searchKey', searchKey);
        return this.http.HttpGet(ApiUrl.DataSystemList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    exportToExcel(model: ExportParamModel): Observable<ExportModel> {
        let params = new HttpParams();
        params = params.append('value', JSON.stringify(model));
        return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    insertSystemsViaCsvFile(projectId: string, file: File): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('projectId', projectId);
        formData.append('file', file);
        return this.http.HttpPostFormData(ApiUrl.InsertSystemsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

}