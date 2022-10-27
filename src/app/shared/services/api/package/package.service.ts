import { Observable } from 'rxjs';
import { ApiListResponse } from 'src/app/shared/models/api-response/api-response';
import { Injectable } from '@angular/core';
import { HttpService } from '../../http/http.service';
import { ApiUrl } from '../../api-url/api-url';
import { map, catchError } from 'rxjs/operators';
import { ApiHelper } from '../api-helper';

export interface IModuleService {
    getListPackage(): Observable<ApiListResponse>;
}

@Injectable({
    providedIn: 'root',
})

export class PackageService implements IModuleService {
    constructor(
        private http: HttpService,
    ) { }

    getListPackage(): Observable<ApiListResponse> {
        return this.http.HttpGet(ApiUrl.PackageLookUp, null, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}