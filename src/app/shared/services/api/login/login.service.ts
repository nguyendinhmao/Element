
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { UserLoginModel } from 'src/app/shared/models/user/user.model';
import { ApiHelper, CustomEncoder } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

export interface ILoginInterface {
    login(userLogin: UserLoginModel): Observable<any>;
}

@Injectable({
    providedIn: 'root',
})

export class LoginService implements ILoginInterface {
    constructor(
        private http: HttpService,
    ) { }

    login(userLogin: UserLoginModel): Observable<any> {
        let params = new HttpParams({ encoder: new CustomEncoder() });
        params = params.set('username', userLogin.username);
        params = params.set('password', userLogin.password);
        params = params.set('grant_type', 'password');

        let body = params.toString();

        return this.http.HttpPostLogin(ApiUrl.Login, body).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}
