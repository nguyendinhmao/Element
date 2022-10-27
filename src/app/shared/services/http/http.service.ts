import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { StorageKey } from '../../models/storage-key/storage-key';
import { Configs } from '../../common/configs/configs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class HttpService {
  constructor(
    private http: HttpClient
  ) { }

  HttpGet(url: string, params: HttpParams = null, authenticatedRequest: boolean = false) {
    let headers = authenticatedRequest ?
      new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json, text/javascript, */*; q=0.01', 'Authorization': this.getAuthorizationHeader() }) :
      new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json, text/javascript, */*; q=0.01' });

    let options = { headers: headers, params: params };

    return this.http.get(url, options);
  }

  HttpPost(url: string, body: string, authenticatedRequest: boolean = false) {
    let options = {
      headers: this.getHeaders(authenticatedRequest)
    };
    return this.http.post(url, body, options);
  }

  HttpPostWithProgress(url: string, body: string, authenticatedRequest: boolean = false) {
    const options = {
      headers: this.getHeaders(authenticatedRequest),
      reportProgress: true,
    };
    const req = new HttpRequest('POST', url, body, options);
    return this.http.request(req);
  }

  HttpPostFormData(url: string, body: FormData, authenticatedRequest: boolean = false) {
    var headers = this.getHeaders(authenticatedRequest, true);
    let options = {
      headers: headers
    };
    return this.http.post(url, body, options);
  }

  HttpPut(url: string, body: string, params: HttpParams = null, authenticatedRequest: boolean = false) {
    let options = {
      headers: this.getHeaders(authenticatedRequest),
      params: params
    };
    return this.http.put(url, body, options);
  }

  HttpPostLogin(url: string, body: string): Observable<Object> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let options = {
      headers: headers
    };
    return this.http.post(url, body, options);
  }

  HttpDelete(url: string, params: HttpParams = null, authenticatedRequest: boolean = false) {
    let headers = authenticatedRequest ?
      new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json, text/javascript, */*; q=0.01', 'Authorization': this.getAuthorizationHeader() }) :
      new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json, text/javascript, */*; q=0.01' });

    let options = { headers: headers, params: params };

    return this.http.delete(url, options);
  }

  private getHeaders = (authenticatedRequest: boolean, isFormDataRequest: boolean = false): HttpHeaders => {
    let headers = new HttpHeaders();
    if (!isFormDataRequest) headers = headers.append('Content-Type', 'application/json ; charset=utf-8');
    headers = headers.append('Accept', 'application/json , text/javascript, */*; q=0.01');
    headers = headers.append('Access-Control-Allow-Origin', '*');

    if (authenticatedRequest) {
      headers = headers.append('Authorization', this.getAuthorizationHeader());
    }

    return headers;
  }

  private getAuthorizationHeader() {
    var accessToken = localStorage.getItem(StorageKey.Token);
    return `${Configs.TokenPrefix} ${accessToken}`;
  }
}
