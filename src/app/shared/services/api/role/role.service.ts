import { ApiResponse, ApiListResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { AddRoleManagementModel, UpdateRoleManagementModel } from 'src/app/shared/models/role-management/role-management.model';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';

export interface IRoleInterface {
    getRoleList(searchKey: string, sortExpression: string, pageNumber: number, pageSize: number): Observable<ApiListResponse>;
    createRole(addRoleManagementModel: AddRoleManagementModel): Observable<ApiResponse>;
    updateRole(updateRoleManagementModel: UpdateRoleManagementModel): Observable<ApiResponse>;
    deleteRole(roleId: number[]): Observable<ApiResponse>;
    detailRole(roleId: number): Observable<UpdateRoleManagementModel>;
    insertRolesViaCsvFile(file: File): Observable<ApiListResponse>;
    exportToExcel(model: ExportParamModel): Observable<ExportModel>;
}

@Injectable({
    providedIn: 'root',
})

export class RoleService implements IRoleInterface {
    constructor(
        private http: HttpService
    ) { }

    getRoleList(searchKey: string, sortExpression: string, pageNumber: number, pageSize: number): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('searchKey', searchKey || "");
        params = params.append('sortExpression', sortExpression || "");
        params = params.append('pageNumber', pageNumber.toString());
        params = params.append('pageSize', pageSize.toString());

        return this.http.HttpGet(ApiUrl.RoleManagementList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    createRole(addRoleManagementModel: AddRoleManagementModel): Observable<ApiResponse> {
        let body = JSON.stringify(addRoleManagementModel);
        return this.http.HttpPost(ApiUrl.AddRoleManagement, body, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    updateRole(updateRoleManagementModel: UpdateRoleManagementModel): Observable<ApiResponse> {
        let body = JSON.stringify(updateRoleManagementModel);
        return this.http.HttpPost(ApiUrl.EditRoleManagement, body, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deleteRole(roleId: number[]): Observable<ApiResponse> {
        var body = {
            'Ids': roleId
        };
        return this.http.HttpPost(ApiUrl.DeleteRoleManagement, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    detailRole(roleId: number): Observable<UpdateRoleManagementModel> {
        let params = new HttpParams();
        params = params.append('id', roleId.toString());

        return this.http.HttpGet(ApiUrl.DetailRole, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
    }

    insertRolesViaCsvFile(file: File): Observable<ApiListResponse> {
        let formData: FormData = new FormData();
        formData.append('file', file);
        return this.http.HttpPostFormData(ApiUrl.ImportRole, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    exportToExcel(model: ExportParamModel): Observable<ExportModel> {
        let params = new HttpParams();
        params = params.append('value', JSON.stringify(model));
        return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}