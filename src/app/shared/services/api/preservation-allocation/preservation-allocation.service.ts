import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { ElementStatusCommand, ElementUpdationCommand } from 'src/app/shared/models/itr-tab/preservation-allocation.model';
import { ApiUrl } from '../../api-url/api-url';
import { HttpService } from '../../http/http.service';
import { ApiHelper } from '../api-helper';


export interface IPresservationServices {
    getPreservationAllocatedList(projectKey: string, equipmentCode: string, pageIndex: number, pageSize: number, sortExpression: string): Observable<ApiListResponse>;
    updateStatusAllocation(model: ElementStatusCommand, status: string): Observable<ApiResponse>;
    updateElementsAllocation(model: ElementUpdationCommand): Observable<ApiResponse>;

}

@Injectable({
    providedIn: 'root',
})
export class PresservationServices implements IPresservationServices {
    constructor(
        private http: HttpService,
    ) { }

    getPreservationAllocatedList(projectKey: string, equipmentCode: string, pageIndex: number, pageSize: number, sortExpression?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey);
        params = params.append('equipmentCode', equipmentCode || "");
        params = params.append('pageNumber', pageIndex.toString());
        params = params.append('pageSize', pageSize.toString());
        params = params.append('sortExpression', sortExpression || "");

        return this.http.HttpGet(ApiUrl.PreservationAllocatedList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    updateStatusAllocation(model: ElementStatusCommand, status: string): Observable<ApiResponse> {
        let _url = '';
        switch (status) {
            case 'ACTIVE':
                _url = ApiUrl.ResumePreservationAllocation;
                break;
            case 'PAUSED':
                _url = ApiUrl.PausePreservationAllocation;
                break;
            case 'STOPPED':
                _url = ApiUrl.StopPreservationAllocation;
                break;
        }
        return this.http.HttpPost(_url, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    updateElementsAllocation(model: ElementUpdationCommand): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.UpdatePreservationAllocation, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}