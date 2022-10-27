import { ApiResponse, ApiListResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ProjectMilestoneSetuptList, ProjectMilestoneUpdationModel } from 'src/app/shared/models/project-settings/project-milestone.model';

export interface IProjectMilestoneService {
  getProjectMilestoneList(projectId: string): Observable<ApiListResponse>;
  updateProjectMilestone(model: ProjectMilestoneUpdationModel): Observable<ApiListResponse>;
  resetProjectMilestone(projectId: string): Observable<ApiResponse>;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectMilestoneService implements IProjectMilestoneService {
  constructor(
    private http: HttpService
  ) { }


  getProjectMilestoneList(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey);
    return this.http.HttpGet(ApiUrl.ProjectMilestoneSetupList, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateProjectMilestone(model: ProjectMilestoneUpdationModel): Observable<ApiListResponse> {
    return this.http.HttpPost(ApiUrl.UpdateProjectMilestones, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  resetProjectMilestone(projectId: string): Observable<ApiResponse> {
    var body = {
      projectId: projectId
    };
    return this.http.HttpPost(ApiUrl.ResetProjectMileStones, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
