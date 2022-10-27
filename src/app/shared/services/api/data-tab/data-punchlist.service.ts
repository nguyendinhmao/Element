import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { DataPunchListModel, UpdatePunchListModel } from 'src/app/shared/models/data-tab/data-punchlist.model';

export interface IDataPunchListService {
    getDataPunchList(pageIndex: number, pageSize: number, sortExpression?: string, punchListNo?: string): Observable<ApiListResponse>;
    getPunchListId(id: string): Observable<DataPunchListModel>;
    updatePunchList(model: UpdatePunchListModel): Observable<ApiResponse>;
    deletePunchList(id: string): Observable<ApiResponse>;
    exportToExcel(model: ExportParamModel): Observable<ExportModel>;
    insertPunchListsViaCsvFile(file: File): Observable<ApiResponse>;
    getPunchListLookUp(): Observable<ApiListResponse>;
}

@Injectable({
    providedIn: 'root',
})
export class DataPunchListService implements IDataPunchListService {
    constructor(
        private http: HttpService
    ) { }
    // getPunchListLookUp(): Observable<ApiListResponse> {
    //     return this.http.HttpGet(ApiUrl.PunchListLookUp, null, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    // }

    getDataPunchList(pageNumber: number, pageSize: number, sortExpression?: string, punchListNo?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('pageNumber', pageNumber.toString());
        params = params.append('pageSize', pageSize.toString());
        params = params.append('sortExpression', sortExpression);
        params = params.append('punchListNo', punchListNo);
        return this.http.HttpGet(ApiUrl.DataGetPunchList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    getPunchListId(id: string): Observable<DataPunchListModel> {
        let params = new HttpParams();
        params = params.append('punchListId', id.toString());
        return this.http.HttpGet(ApiUrl.GetPunchListById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
    }

    updatePunchList(model: UpdatePunchListModel): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.UpdatePunchList, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    insertPunchListsViaCsvFile(file: File): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('file', file);
        return this.http.HttpPostFormData(ApiUrl.InsertPunchListsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deletePunchList(id: string): Observable<ApiResponse> {
        var body = {
            punchListId: id
        };
        return this.http.HttpPost(ApiUrl.DeletePunchList, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getPunchListLookUp(): Observable<ApiListResponse> {
        return this.http.HttpGet(ApiUrl.PunchListLookUp, null, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    exportToExcel(model: ExportParamModel): Observable<ExportModel> {
        let params = new HttpParams();
        params = params.append('value', JSON.stringify(model));
        return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}
