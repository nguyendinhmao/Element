import { CreationDataOrderModel } from './../../../models/data-tab/data-order.model';
import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { DataOrderModel, UpdationDataOrderModel } from 'src/app/shared/models/data-tab/data-order.model';

export interface IDataOrderService {
    getDataOrder(pageIndex: number, pageSize: number, projectKey: string, sortExpression?: string, orderNo?: string): Observable<ApiListResponse>;
    getOrderId(id: string): Observable<UpdationDataOrderModel>;
    updateOrder(model: UpdationDataOrderModel): Observable<ApiResponse>;
    deleteOrder(id: string): Observable<ApiResponse>;
    exportToExcel(model: ExportParamModel): Observable<ExportModel>;
    insertOrdersViaCsvFile(file: File, projectKey: string): Observable<ApiResponse>;
    getOrderLookUp(projectKey: string): Observable<ApiListResponse>;
}

@Injectable({
    providedIn: 'root',
})
export class DataOrderService implements IDataOrderService {
    constructor(
        private http: HttpService
    ) { }
    getDataOrder(pageNumber: number, pageSize: number, projectKey: string, sortExpression?: string, orderNo?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('pageNumber', pageNumber.toString());
        params = params.append('pageSize', pageSize.toString());
        params = params.append('sortExpression', sortExpression);
        params = params.append('orderNo', orderNo);
        params = params.append('projectKey', projectKey.toString());
        return this.http.HttpGet(ApiUrl.DataGetOrder, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    getOrderId(id: string): Observable<UpdationDataOrderModel> {
        let params = new HttpParams();
        params = params.append('orderId', id.toString());
        return this.http.HttpGet(ApiUrl.GetOrderById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
    }

    createOrder(model: CreationDataOrderModel): Observable<ApiResponse> {
      return this.http.HttpPost(ApiUrl.CreateOrder, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

    updateOrder(model: UpdationDataOrderModel): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.UpdateOrder, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    insertOrdersViaCsvFile(file: File, projectKey: string): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('file', file);
        formData.append('projectKey', projectKey.toString());
        return this.http.HttpPostFormData(ApiUrl.InsertOrdersViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deleteOrder(id: string): Observable<ApiResponse> {
        var body = {
            Id: id
        };
        return this.http.HttpPost(ApiUrl.DeleteOrder, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getOrderLookUp(projectKey: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey.toString());
        return this.http.HttpGet(ApiUrl.OrderLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    exportToExcel(model: ExportParamModel): Observable<ExportModel> {
        let params = new HttpParams();
        params = params.append('value', JSON.stringify(model));
        return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}
