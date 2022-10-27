import { ApiResponse, ApiListResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ProjectLevelUpdationModel } from 'src/app/shared/models/project-settings/project-level.model';

export interface IProjectLevelService {
  getProjectLevelList(projectId: string): Observable<ApiListResponse>;
  updateProjectLevel(model: ProjectLevelUpdationModel): Observable<ApiResponse>;
  resetProjectLevel(projectId: string): Observable<ApiResponse>;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectLevelService implements IProjectLevelService {
  constructor(
    private http: HttpService
  ) { }

  getProjectLevelList(projectId: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectId', projectId.toString());
    return this.http.HttpGet(ApiUrl.ProjectLevelList, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateProjectLevel(model: ProjectLevelUpdationModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdateProjectLevels, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  resetProjectLevel(projectId: string): Observable<ApiResponse> {
    var body = {
      projectId: projectId
    };
    return this.http.HttpPost(ApiUrl.ResetProjectMileStones, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
