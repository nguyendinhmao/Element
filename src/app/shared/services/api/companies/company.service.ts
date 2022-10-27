import { ApiResponse, ApiListResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { CompanyCreationModel, CompanyUpdationModel } from 'src/app/shared/models/company-management/company-management.model';
import { AuthErrorHandler } from '../../auth/auth.error-handler';

export interface ICompanyService {
  getCompanyList(pageIndex: number, pageSize: number): Observable<ApiListResponse>;
  createCompany(model: CompanyCreationModel): Observable<ApiResponse>;
  updateCompany(model: CompanyUpdationModel): Observable<ApiResponse>;
  deleteCompany(id: string): Observable<ApiResponse>;
  getCompanyById(id: string): Observable<CompanyUpdationModel>;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyService implements ICompanyService {
  constructor(
    private http: HttpService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  getCompanyList(pageIndex: number, pageSize: number): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('pageNumber', pageIndex.toString());
    params = params.append('pageSize', pageSize.toString());
    return this.http.HttpGet(ApiUrl.CompanyList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  createCompany(model: CompanyCreationModel): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    if (model.logo) {
      formData.append('logo', model.logo, model.logo.name);
    }
    formData.append('data', JSON.stringify(model));
    return this.http.HttpPostFormData(ApiUrl.CreateCompany, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateCompany(model: CompanyUpdationModel): Observable<ApiResponse> {
    let formData: FormData = new FormData();
    if (model.logo) {
      formData.append('logo', model.logo, model.logo.name);
    }
    formData.append('data', JSON.stringify(model));
    return this.http.HttpPostFormData(ApiUrl.UpdateCompany, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteCompany(id: string): Observable<ApiResponse> {
    var body = {
      companyId: id
    };
    return this.http.HttpPost(ApiUrl.DeleteCompany, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getCompanyById(id: string): Observable<CompanyUpdationModel> {
    let params = new HttpParams();
    params = params.append('companyId', id.toString());
    return this.http.HttpGet(ApiUrl.GetCompanyById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  getCompanyLookupData(): Observable<ApiListResponse> {
    return this.http.HttpGet(ApiUrl.CompanyLookup, null, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail))
  }
}
