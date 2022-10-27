import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreateLocationModel, DataLocationModel, UpdateLocationModel } from 'src/app/shared/models/data-tab/data-location.model';

export interface IDataLocationService {
  getDataLocation(pageNumber: number, pageSize: number, projectKey: string, sortExpression?: string, locationCode?: string): Observable<ApiListResponse>;
  getLocationId(id: string): Observable<DataLocationModel>;
  deleteLocation(id: string): Observable<ApiResponse>;
  exportToExcel(model: ExportParamModel): Observable<ExportModel>;
  getLocationLookUp(projectKey: string): Observable<ApiListResponse>;
  getLocationLookUpTagPage(projectKey: string): Observable<ApiListResponse>;
}

@Injectable({
  providedIn: 'root',
})
export class DataLocationService implements IDataLocationService {
  constructor(
    private http: HttpService
  ) { }

  getDataLocation(pageNumber: number, pageSize: number, projectKey: string, sortExpression?: string, locationCode?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression);
    params = params.append('locationCode', locationCode);
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.DataLocationList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getLocationId(id: string): Observable<DataLocationModel> {
    let params = new HttpParams();
    params = params.append('locationId', id.toString());
    return this.http.HttpGet(ApiUrl.GetLocationById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  updateLocation(model: UpdateLocationModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.UpdateLocation, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  createLocation(model: CreateLocationModel): Observable<ApiResponse> {
    return this.http.HttpPost(ApiUrl.CreateLocation, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  insertLocationsViaCsvFile(file: File, projectKey: string): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectKey', projectKey.toString());
    return this.http.HttpPostFormData(ApiUrl.InsertLocationsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteLocation(id: string): Observable<ApiResponse> {
    var body = {
      locationId: id
    };
    return this.http.HttpPost(ApiUrl.DeleteLocation, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  exportToExcel(model: ExportParamModel): Observable<ExportModel> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  getLocationLookUp(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.LocationsLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getLocationLookUpTagPage(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.LocationsLookUpTagPage, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  getLocationLookUpPunchPage(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.LocationsLookUpPunchPage, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
}
