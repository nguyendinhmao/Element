import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreateDisciplineModel, DataDisciplineModel, UpdateDisciplineModel } from 'src/app/shared/models/data-tab/data-discipline.model';

export interface IDatadisciplineService {
    getDataDiscipline(pageIndex: number, pageSize: number, projectKey: string, sortExpression?: string, disciplineCode?: string): Observable<ApiListResponse>;
    getDisciplineId(id: string): Observable<DataDisciplineModel>;
    deleteDiscipline(id: string): Observable<ApiResponse>;
    exportToExcel(model: ExportParamModel): Observable<ExportModel>;
    getDisciplineLookUp(projectKey: string): Observable<ApiListResponse>;
}

@Injectable({
    providedIn: 'root',
})
export class DataDisciplineService implements IDatadisciplineService {
    constructor(
        private http: HttpService
    ) { }
    getDisciplineLookUp(projectKey: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey.toString());
        return this.http.HttpGet(ApiUrl.DisciplineLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
    getDisciplineLookUpTagPage(projectKey: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey.toString());
        return this.http.HttpGet(ApiUrl.DisciplineLookUpTagPage, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
    getDisciplineLookUpPunchPage(projectKey: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey.toString());
        return this.http.HttpGet(ApiUrl.DisciplineLookUpFilterPunchPage, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getDataDiscipline(pageNumber: number, pageSize: number, projectKey: string, sortExpression?: string, disciplineCode?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('pageNumber', pageNumber.toString());
        params = params.append('pageSize', pageSize.toString());
        params = params.append('sortExpression', sortExpression);
        params = params.append('disciplineCode', disciplineCode);
        params = params.append('projectKey', projectKey.toString());
        return this.http.HttpGet(ApiUrl.DataDisciplineList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    getDisciplineId(id: string): Observable<DataDisciplineModel> {
        let params = new HttpParams();
        params = params.append('disciplineId', id.toString());
        return this.http.HttpGet(ApiUrl.GetDisciplineById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
    }

    createDiscipline(model: CreateDisciplineModel): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.CreateDiscipline, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    updateDiscipline(model: UpdateDisciplineModel): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.UpdateDiscipline, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    insertDisciplinesViaCsvFile(file: File, projectKey: string): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('file', file);
        formData.append('projectKey', projectKey.toString());
        return this.http.HttpPostFormData(ApiUrl.InsertDisciplinesViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deleteDiscipline(id: string): Observable<ApiResponse> {
        var body = {
            disciplineId: id
        };
        return this.http.HttpPost(ApiUrl.DeleteDiscipline, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    exportToExcel(model: ExportParamModel): Observable<ExportModel> {
        let params = new HttpParams();
        params = params.append('value', JSON.stringify(model));
        return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}
