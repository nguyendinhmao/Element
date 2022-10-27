import {
  ApiResponse,
  ApiListResponse,
} from "src/app/shared/models/api-response/api-response";
import { HttpService } from "../../http/http.service";
import { Injectable } from "@angular/core";
import { ApiUrl } from "../../api-url/api-url";
import { ApiHelper } from "../api-helper";
import { Observable } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { HttpParams } from "@angular/common/http";
import { ChartCommand } from "src/app/shared/models/dashboard/dashboard.model";

export interface IDashboardService {
  getListSymbol(): Observable<ApiListResponse>;
  getListTableName(): Observable<ApiListResponse>;
  getListField(tableId: number): Observable<ApiListResponse>;
  getDashboardDetail(projectKey: string): Observable<ApiListResponse>;
}

@Injectable({
  providedIn: "root",
})

export class DashboardService implements IDashboardService {
  constructor(private http: HttpService) { }
  getListSymbol(): Observable<ApiListResponse> {
    return this.http.HttpGet(ApiUrl.UnitCharacterList, null, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail))
  }
  getListTableName(): Observable<ApiListResponse> {
    return this.http.HttpGet(ApiUrl.TableDefinitionList, null, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail))
  };
  getListField(tableId: number): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('tableId', tableId.toString());
    return this.http.HttpGet(ApiUrl.FieldConfigurationList, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail))
  };
  getDashboardDetail(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey || '');
    return this.http.HttpGet(ApiUrl.GetDashboardDetail, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail))
  };
  updateDashboardDetail(model: ChartCommand): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdateDashboardChart, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
