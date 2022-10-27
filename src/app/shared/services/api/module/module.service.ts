import { Observable } from 'rxjs';
import { ApiListResponse } from 'src/app/shared/models/api-response/api-response';
import { Injectable } from '@angular/core';
import { HttpService } from '../../http/http.service';
import { ApiUrl } from '../../api-url/api-url';
import { map, catchError } from 'rxjs/operators';
import { ApiHelper } from '../api-helper';
import { HttpParams } from '@angular/common/http';

export interface IModuleService {
    getListModule(): Observable<ApiListResponse>;
    getListModuleByUserId(userId: string): Observable<ApiListResponse>;
}

@Injectable({
    providedIn: 'root',
})

export class ModuleService implements IModuleService {
    constructor(
        private http: HttpService,
    ) { }

    getListModule(): Observable<ApiListResponse> {
        return this.http.HttpGet(ApiUrl.ModuleList, null, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    getListModuleByUserId(userId: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('userId', userId.toString());
        return this.http.HttpGet(ApiUrl.GetModuleByUser, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }
}