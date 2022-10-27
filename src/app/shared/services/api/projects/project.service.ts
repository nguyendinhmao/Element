import { ApiResponse, ApiListResponse } from "src/app/shared/models/api-response/api-response";
import { HttpService } from "../../http/http.service";
import { Injectable } from "@angular/core";
import { ApiUrl } from "../../api-url/api-url";
import { ApiHelper } from "../api-helper";
import { Observable } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { HttpParams } from "@angular/common/http";
import { ProjectCreationModel, ProjectUpdatingModel } from "src/app/shared/models/project-management/project-management.model";
import { UpdateProjectSignatureModel } from 'src/app/shared/models/project-settings/project-signature.model';
import { UpdateProjectStageModel } from 'src/app/shared/models/project-settings/project-stage.model';

export interface IProjectService {
  getListProject(moduleId: number, pageIndex: number): Observable<ApiListResponse>;
  createProject(model: ProjectCreationModel): Observable<ApiResponse>;
  updateProject(model: ProjectUpdatingModel): Observable<ApiResponse>;
  deleteProject(id: string): Observable<ApiResponse>;
  getProjectByKey(projectKey: string): Observable<ProjectUpdatingModel>;
  updateProjectLogo(projectId: string, logo: File, isReset: boolean): Observable<string>;
  getListProjectByUser(userId: string): Observable<ApiListResponse>;
  getListProjectByUserAndModule(userId: string, moduleId: number): Observable<ApiListResponse>;
  getProjectLookup(): Observable<ApiListResponse>;
  updateProjectSignaturePunch(model: UpdateProjectSignatureModel): Observable<ApiListResponse>;
  getAuthInProject(projectKey: string): Observable<ApiListResponse>;
}

@Injectable({
  providedIn: "root",
})
export class ProjectService implements IProjectService {
  constructor(private http: HttpService) { }
  getProjectLookup(): Observable<ApiListResponse> {
    return this.http.HttpGet(ApiUrl.ProjectLookup, null, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getListProject(moduleId: number, pageIndex: number): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("pageNumber", pageIndex.toString());
    params = params.append("moduleId", moduleId.toString());
    return this.http.HttpGet(ApiUrl.ProjectList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  createProject(model: ProjectCreationModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.CreateProject, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateProject(model: ProjectUpdatingModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdateProject, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteProject(id: string): Observable<ApiResponse> {
    var body = { id: id };
    return this.http.HttpPost(ApiUrl.DeleteProject, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getProjectByKey(projectKey: string): Observable<ProjectUpdatingModel> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey);
    return this.http.HttpGet(ApiUrl.GetProjectByKey, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  getProjectStatusLookup(): Observable<ApiListResponse> {
    return this.http.HttpGet(ApiUrl.GetProjectStatusLookup, null, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  updateProjectLogo(projectId: string, logo: File, isReset: ConstrainBoolean): Observable<string> {
    let formData: FormData = new FormData();
    if (logo) {
      formData.append("logo", logo, logo.name);
    }
    formData.append("projectId", projectId);
    formData.append("isReset", isReset + "");
    return this.http.HttpPostFormData(ApiUrl.UpdateProjectLogo, formData, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  getListProjectByUser(userId: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("userId", userId);
    return this.http.HttpGet(ApiUrl.ProjectByUser, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getListProjectByUserAndModule(userId: string, moduleId: number): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("userId", userId);
    params = params.append("moduleId", moduleId.toString());
    return this.http.HttpGet(ApiUrl.ProjectByUserAndModule, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  getProjectSignaturePunch(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey);
    return this.http.HttpGet(ApiUrl.ProjectSignaturePunch, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  getProjectSignatureItr(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey);
    return this.http.HttpGet(ApiUrl.ProjectSignatureItr, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  updateProjectSignaturePunch(model: UpdateProjectSignatureModel): Observable<ApiListResponse> {
    return this.http.HttpPost(ApiUrl.UpdateProjectSignaturePunch, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  updateProjectSignatureItr(model: UpdateProjectSignatureModel): Observable<ApiListResponse> {
    return this.http.HttpPost(ApiUrl.UpdateProjectSignatureItr, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  getProjectSignaturePreservation(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey);
    return this.http.HttpGet(ApiUrl.ProjectSignaturePreservation, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  updateProjectSignaturePreservation(model: UpdateProjectSignatureModel): Observable<ApiListResponse> {
    return this.http.HttpPost(ApiUrl.UpdateProjectSignaturePreservation, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  getAuthInProject(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey);
    return this.http.HttpGet(ApiUrl.AuthInProject, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  getProjectSignatureChange(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey);
    return this.http.HttpGet(ApiUrl.ProjectSignatureChange, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  updateProjectSignatureChange(model: UpdateProjectSignatureModel): Observable<ApiListResponse> {
    return this.http.HttpPost(ApiUrl.UpdateProjectSignatureChange, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  getProjectStageChange(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey);
    return this.http.HttpGet(ApiUrl.ProjectStageChange, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  updateProjectStageChange(model: UpdateProjectStageModel): Observable<ApiListResponse> {
    return this.http.HttpPost(ApiUrl.UpdateProjectStageChange, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
