import { ApiResponse, ApiListResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ProjectRoleCreationModel } from 'src/app/shared/models/project-settings/project-user.model';

export interface IProjectRoleService {
    getProjectRoleList(projectId: string, pageIndex: number,pageSize: number,sortExpression:string): Observable<ApiListResponse>;
    createProjectRole(model: ProjectRoleCreationModel): Observable<ApiResponse>;
    deleteProjectRole(id: string,projectId: string): Observable<ApiResponse>;
}

@Injectable({
    providedIn: 'root',
})
export class ProjectRoleService implements IProjectRoleService {
    constructor(
        private http: HttpService
    ) { }

    getProjectRoleList(projectKey: string, pageIndex: number,pageSize: number,sortExpression:string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey.toString());
        params = params.append('sortExpression', sortExpression || "");
        params = params.append('pageNumber', pageIndex.toString());
        params = params.append('pageSize', pageSize.toString());
        return this.http.HttpGet(ApiUrl.ProjectRoleList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    createProjectRole(model: ProjectRoleCreationModel): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.CreateProjectRole, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deleteProjectRole(id: string,projectId: string): Observable<ApiResponse> {
        var body = { 
            Id: id,
            ProjectId: projectId
        };
        return this.http.HttpPost(ApiUrl.DeleteProjectRole, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getProjectRolesLookup(): Observable<ApiListResponse> {
        return this.http.HttpGet(ApiUrl.GetProjectRolesLookup, null, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}
