import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "src/app/shared/models/api-response/api-response";
import { HttpService } from "../../http/http.service";
import { ApiHelper } from "../api-helper";
import { map, catchError } from 'rxjs/operators';
import { ApiUrl } from "../../api-url/api-url";
import { DetailItrReportCommand, PunchSummaryReportCommand, SkylineReportCommand, SubSystemReportCommand, SystemReportCommand } from "src/app/shared/models/progress-tab/progress-tab.model";
import { HttpParams } from '@angular/common/http';
import { ExportModel } from "src/app/shared/models/data-tab/data-tab.model";

@Injectable({
  providedIn: 'root',
})
export class ProgressReportService {
  constructor(
    private http: HttpService
  ) { }

  getSkylineReportFile(model: SkylineReportCommand): Observable<ApiResponse> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.GetSkylineReportData, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getSystemReportFile(model: SystemReportCommand): Observable<ApiResponse> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.GetSystemReportData, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getSubSystemReportFile(model: SubSystemReportCommand): Observable<ApiResponse> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.GetSubSystemReportData, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getDetailedItrReportData(model: DetailItrReportCommand): Observable<ApiResponse> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.GetDetailedItrReportData, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getPunchSummaryReportData(model: PunchSummaryReportCommand): Observable<ApiResponse> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.GetPunchSummaryReportData, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  exportSkylineReportToExcel(model: SkylineReportCommand | SystemReportCommand | DetailItrReportCommand | PunchSummaryReportCommand): Observable<ExportModel> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.GetReportExportFile, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}