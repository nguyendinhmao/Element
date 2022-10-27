import { ApiResponse, ApiListResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ProjectMemberCreationModel, ProjectMemberUpdatingModel, ProjectMemberDetailModel } from 'src/app/shared/models/project-settings/project-user.model';

export interface IProjectMemberService {
  getProjectMemberList(projectId: string, pageIndex: number,pageSize:number,sortExpression:string): Observable<ApiListResponse>;
  createProjectMember(model: ProjectMemberCreationModel): Observable<ApiResponse>;
  updateProjectMember(model: ProjectMemberUpdatingModel): Observable<ApiResponse>;
  deleteProjectMember(id: string): Observable<ApiResponse>;
  getProjectMemberById(id: string): Observable<ProjectMemberUpdatingModel>;
}

@Injectable({
  providedIn: 'root',
})

export class ProjectMemberService implements IProjectMemberService {
  constructor(
    private http: HttpService
  ) { }

  getProjectMemberList(projectId: string, pageIndex: number,pageSize:number,sortExpression:string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectId', projectId.toString());
    params = params.append('sortExpression', sortExpression || '');
    params = params.append('pageNumber', pageIndex.toString());
    params = params.append('pageSize',pageSize.toString());
    return this.http.HttpGet(ApiUrl.ProjectMemberList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  createProjectMember(model: ProjectMemberCreationModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.CreateProjectMember, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateProjectMember(model: ProjectMemberUpdatingModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdateProjectMember, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteProjectMember(id: string): Observable<ApiResponse> {
    var body = { projectMemberId: id };
    return this.http.HttpPost(ApiUrl.DeleteProjectMember, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getProjectMemberById(id: string): Observable<ProjectMemberUpdatingModel> {
    let params = new HttpParams();
    params = params.append('projectMemberId', id.toString());
    return this.http.HttpGet(ApiUrl.GetProjectMemberById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  getProjectRolesLookup(): Observable<ApiListResponse> {
    return this.http.HttpGet(ApiUrl.GetProjectRolesLookup, null, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getAuthorizationLevelLookup(): Observable<ApiListResponse> {
    return this.http.HttpGet(ApiUrl.GetAuthorizationLevelLookup, null, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getProjectMemberLookup(): Observable<ApiListResponse> {
    return this.http.HttpGet(ApiUrl.GetProjectMembersLookup, null, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }
  
  getProjectRolesLookupByProject(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey);
    return this.http.HttpGet(ApiUrl.GetProjectRoleLookupByProjectKey, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
