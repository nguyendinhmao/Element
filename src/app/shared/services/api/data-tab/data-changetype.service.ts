import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreationDataChangeTypeModel, UpdationDataChangeTypeModel } from '../../../models/data-tab/data-change-type.model';

export interface IDataChangeTypeService {
    getDataChangeType(pageIndex: number, pageSize: number, projectKey: string, sortExpression?: string, orderNo?: string): Observable<ApiListResponse>;
  getChangeTypeId(id: string): Observable<UpdationDataChangeTypeModel>;
     updateChangeType(model: UpdationDataChangeTypeModel): Observable<ApiResponse>;
    deleteChangeType(id: string): Observable<ApiResponse>;
    exportToExcel(model: ExportParamModel): Observable<ExportModel>;
    insertChangeTypesViaCsvFile(file: File, projectKey: string): Observable<ApiResponse>;
}

@Injectable({
    providedIn: 'root',
})
export class DataChangeTypeService implements IDataChangeTypeService {
    constructor(
        private http: HttpService
    ) { }
    getDataChangeType(pageNumber: number, pageSize: number, projectKey: string, sortExpression?: string, orderNo?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('pageNumber', pageNumber.toString());
        params = params.append('pageSize', pageSize.toString());
        params = params.append('sortExpression', sortExpression);
        params = params.append('type', orderNo);
        params = params.append('projectKey', projectKey.toString());
        return this.http.HttpGet(ApiUrl.DataGetChangeType, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

     getChangeTypeId(id: string): Observable<UpdationDataChangeTypeModel> {
         let params = new HttpParams();
         params = params.append('id', id.toString());
         return this.http.HttpGet(ApiUrl.GetChangeTypeById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
     }

     createChangeType(model: CreationDataChangeTypeModel): Observable<ApiResponse> {
         return this.http.HttpPost(ApiUrl.CreateChangeType, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
     }

     updateChangeType(model: UpdationDataChangeTypeModel): Observable<ApiResponse> {
         return this.http.HttpPost(ApiUrl.UpdateChangeType, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
     }

    insertChangeTypesViaCsvFile(file: File, projectKey: string): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('file', file);
        formData.append('projectKey', projectKey.toString());
        return this.http.HttpPostFormData(ApiUrl.InsertChangeTiesViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deleteChangeType(id: string): Observable<ApiResponse> {
        var body = {
            Id: id
        };
        return this.http.HttpPost(ApiUrl.DeleteChangeType, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }


    exportToExcel(model: ExportParamModel): Observable<ExportModel> {
        let params = new HttpParams();
        params = params.append('value', JSON.stringify(model));
        return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}
