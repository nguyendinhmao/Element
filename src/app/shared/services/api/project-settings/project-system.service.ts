import { ApiResponse, ApiListResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ProjectSystemCreationModel, ProjectSystemUpdationModel, ProjectSystemDetailModel } from 'src/app/shared/models/project-settings/project-system.model';

export interface IProjectSystemService {
  getProjectSystemList(projectKey: string, pageIndex: number, pageSize: number): Observable<ApiListResponse>;
  createProjectSystem(model: ProjectSystemCreationModel): Observable<ApiResponse>;
  updateProjectSystem(model: ProjectSystemUpdationModel): Observable<ApiResponse>;
  deleteProjectSystem(id: string): Observable<ApiResponse>;
  getProjectSystemById(id: string): Observable<ProjectSystemDetailModel>;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectSystemService implements IProjectSystemService {
  constructor(
    private http: HttpService
  ) { }

  getProjectSystemList(projectKey: string, pageIndex: number, pageSize: number, sortExpression?: string, searchKey?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey);
    params = params.append('pageNumber', pageIndex.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression);
    params = params.append('searchKey', searchKey);
    return this.http.HttpGet(ApiUrl.ProjectSystemList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  createProjectSystem(model: ProjectSystemCreationModel): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    if (model.logo) {
      formData.append('logo', model.logo, model.logo.name);
    }
    formData.append('data', JSON.stringify(model));
    return this.http.HttpPostFormData(ApiUrl.CreateProjectSystem, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateProjectSystem(model: ProjectSystemUpdationModel): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    if (model.logo) {
      formData.append('logo', model.logo, model.logo.name);
    }
    formData.append('data', JSON.stringify(model));
    return this.http.HttpPostFormData(ApiUrl.UpdateProjectSystem, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteProjectSystem(id: string): Observable<ApiResponse> {
    var body = { elementSystemId: id };
    return this.http.HttpPost(ApiUrl.DeleteProjectSystem, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getProjectSystemById(id: string): Observable<ProjectSystemDetailModel> {
    let params = new HttpParams();
    params = params.append('elementSystemId', id.toString());
    return this.http.HttpGet(ApiUrl.GetProjectSystemById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }
}
