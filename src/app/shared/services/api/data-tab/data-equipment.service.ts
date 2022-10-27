import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { CreateEquipmentModel, UpdateEquipmentModel } from 'src/app/shared/models/data-tab/data-equipment.model';

export interface IDataEquipmentService {
  getEquipment(projectKey: string, pageIndex: number, pageSize: number): Observable<ApiListResponse>;
  getEquipmentById(id: string);
  updateEquipment(model: UpdateEquipmentModel);
  deleteEquipment(id: string): Observable<ApiResponse>;
  exportToExcel(model: ExportParamModel): Observable<ExportModel>
  getEquipmentTypeLookUp(projectKey: string): Observable<ApiListResponse>;
  getEquipmentTypeLookUpTagPage(projectKey: string): Observable<ApiListResponse>;
}

@Injectable({
  providedIn: 'root',
})

export class DataEquipmentService implements IDataEquipmentService {
  constructor(
    private http: HttpService
  ) { }
  getEquipmentTypeLookUp(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.EquipmentTypeLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getEquipmentTypeLookUpTagPage(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey.toString());
    return this.http.HttpGet(ApiUrl.EquipmentTypeLookUpTagPage, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getEquipment(projectKey: string, pageIndex: number, pageSize: number, sortExpression?: string, equipmentCode?: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('pageNumber', pageIndex.toString());
    params = params.append('pageSize', pageSize.toString());
    params = params.append('sortExpression', sortExpression || "");
    params = params.append('equipmentCode', equipmentCode || "");
    params = params.append('projectKey', projectKey);
    return this.http.HttpGet(ApiUrl.DataEquipmentList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getEquipmentById(id: string) {
    let params = new HttpParams();
    params = params.append('equipmentId', id.toString());
    return this.http.HttpGet(ApiUrl.GetEquipmentById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  createEquipment(model: CreateEquipmentModel) {
    return this.http.HttpPost(ApiUrl.CreateEquipment, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateEquipment(model: UpdateEquipmentModel) {
    return this.http.HttpPost(ApiUrl.UpdateEquipment, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  insertquipmentsViaCsvFile(file: File, projectKey: string): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectKey', projectKey);
    return this.http.HttpPostFormData(ApiUrl.InsertEquipmentsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteEquipment(id: string): Observable<ApiResponse> {
    var body = {
      equipmentId: id
    };
    return this.http.HttpPost(ApiUrl.DeleteEquipment, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  exportToExcel(model: ExportParamModel): Observable<ExportModel> {
    let params = new HttpParams();
    params = params.append('value', JSON.stringify(model));
    return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

}
