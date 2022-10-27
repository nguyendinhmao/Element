import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { UpdateHandoverModel } from 'src/app/shared/models/data-tab/data-handover.model';

export interface IDatadisciplineService {
    getDataHandover(projectKey:string,pageIndex: number, pageSize: number, sortExpression?: string, disciplineCode?: string): Observable<ApiListResponse>;
    getHandoverId(id: string);
    deleteHandover(id: string): Observable<ApiResponse>;
    exportToExcel(model: ExportParamModel): Observable<ExportModel>;
}

@Injectable({
    providedIn: 'root',
})
export class DataHandoverService implements IDatadisciplineService {
    constructor(
        private http: HttpService
    ) { }

    getDataHandover(projectKey:string,pageNumber: number, pageSize: number, sortExpression?: string, handoverNo?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey);
        params = params.append('pageNumber', pageNumber.toString());
        params = params.append('pageSize', pageSize.toString());
        params = params.append('sortExpression', sortExpression);
        params = params.append('handoverNo', handoverNo);
        return this.http.HttpGet(ApiUrl.DataHandoverList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    getHandoverId(id: string){
        let params = new HttpParams();
        params = params.append('handoverId', id.toString());
        return this.http.HttpGet(ApiUrl.GetHandoverById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
    }

    updateHandover(model: UpdateHandoverModel): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.UpdateHandover, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    insertHandoversViaCsvFile(projectKey: string, file: File): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('file', file);
        formData.append('projectKey', projectKey);
        return this.http.HttpPostFormData(ApiUrl.InsertHandoversViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deleteHandover(id: string): Observable<ApiResponse> {
        var body = {
            handoverId: id
        };
        return this.http.HttpPost(ApiUrl.DeleteHandover, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    exportToExcel(model: ExportParamModel): Observable<ExportModel> {
        let params = new HttpParams();
        params = params.append('value', JSON.stringify(model));
        return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}