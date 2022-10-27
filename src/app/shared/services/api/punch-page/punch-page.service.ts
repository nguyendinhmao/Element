import {
  ApiListResponse,
  ApiResponse,
} from "src/app/shared/models/api-response/api-response";
import { HttpService } from "../../http/http.service";
import { Injectable } from "@angular/core";
import { ApiUrl } from "../../api-url/api-url";
import { ApiHelper } from "../api-helper";
import { Observable } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { HttpParams } from "@angular/common/http";
import {
  CreatePunchItemModel,
  UpdatePunchItemModel,
  CounterUserPunchesModel
} from "src/app/shared/models/punch-page/punch-page.model";

export interface IPunchPageService { }

@Injectable({
  providedIn: "root",
})
export class PunchPageService implements IPunchPageService {
  constructor(private http: HttpService) { }

  getDataPunchPage(
    projectKey: string,
    tagNo: string,
    pageNumber: number,
    pageSize: number,
    system?: string,
    subSystem?: string,
    discipline?: string,
    category?: string,
    materialRequired?: boolean,
    location?: string,
    status?: string,
    sortExpression?: string,
    punchNo?: string
  ): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    params = params.append("tagNo", tagNo || "");
    params = params.append("pageNumber", pageNumber.toString());
    params = params.append("pageSize", pageSize.toString());
    params = params.append("sortExpression", sortExpression || "");
    params = params.append("system", system || "");
    params = params.append("subSystem", subSystem || "");
    params = params.append("discipline", discipline || "");
    params = params.append("category", category || "");
    params = params.append("materialRequired", materialRequired != null ? materialRequired.toString() : "");
    params = params.append("location", location || "");
    params = params.append("status", status || "");
    params = params.append("punchNo", punchNo || "");
    return this.http
      .HttpGet(ApiUrl.ListPunchPageItem, params, true)
      .pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getMySubmittedPunches(
    projectKey: string,
    tagNo: string,
    pageNumber: number,
    pageSize: number,
    system?: string,
    subSystem?: string,
    discipline?: string,
    category?: string,
    materialRequired?: boolean,
    location?: string,
    status?: string,
    sortExpression?: string,
    punchNo?: string
  ): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    params = params.append("tagNo", tagNo || "");
    params = params.append("pageNumber", pageNumber.toString());
    params = params.append("pageSize", pageSize.toString());
    params = params.append("sortExpression", sortExpression || "");
    params = params.append("system", system || "");
    params = params.append("subSystem", subSystem || "");
    params = params.append("discipline", discipline || "");
    params = params.append("category", category || "");
    params = params.append("materialRequired", materialRequired != null ? materialRequired.toString() : "");
    params = params.append("location", location || "");
    params = params.append("status", status || "");
    params = params.append("punchNo", punchNo || "");
    return this.http
      .HttpGet(ApiUrl.MySubmittedPunches, params, true)
      .pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getListSubmittedPunches(
    projectKey: string,
    tagNo: string,
    pageNumber: number,
    pageSize: number,
    system?: string,
    subSystem?: string,
    discipline?: string,
    category?: string,
    materialRequired?: boolean,
    location?: string,
    status?: string,
    sortExpression?: string,
    punchNo?: string
  ): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    params = params.append("tagNo", tagNo.toString());
    params = params.append("pageNumber", pageNumber.toString());
    params = params.append("pageSize", pageSize.toString());
    params = params.append("sortExpression", sortExpression || "");
    params = params.append("system", system || "");
    params = params.append("subSystem", subSystem || "");
    params = params.append("discipline", discipline || "");
    params = params.append("category", category || "");
    params = params.append("materialRequired", materialRequired != null ? materialRequired.toString() : "");
    params = params.append("location", location || "");
    params = params.append("status", status || "");
    params = params.append("punchNo", punchNo || "");
    return this.http
      .HttpGet(ApiUrl.ListSubmittedPunches, params, true)
      .pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getPunchesNeedMySignature(
    projectKey: string,
    tagNo: string,
    pageNumber: number,
    pageSize: number,
    system?: string,
    subSystem?: string,
    discipline?: string,
    category?: string,
    materialRequired?: boolean,
    location?: string,
    status?: string,
    sortExpression?: string,
    punchNo?: string
  ): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    params = params.append("tagNo", tagNo.toString());
    params = params.append("pageNumber", pageNumber.toString());
    params = params.append("pageSize", pageSize.toString());
    params = params.append("sortExpression", sortExpression || "");
    params = params.append("system", system || "");
    params = params.append("subSystem", subSystem || "");
    params = params.append("discipline", discipline || "");
    params = params.append("category", category || "");
    params = params.append("materialRequired", materialRequired != null ? materialRequired.toString() : "");
    params = params.append("location", location || "");
    params = params.append("status", status || "");
    params = params.append("punchNo", punchNo || "");
    return this.http
      .HttpGet(ApiUrl.PunchesNeedMySignature, params, true)
      .pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getUnSubmittedPunches(
    projectKey: string,
    tagNo: string,
    pageNumber: number,
    pageSize: number,
    system?: string,
    subSystem?: string,
    discipline?: string,
    category?: string,
    materialRequired?: boolean,
    location?: string,
    status?: string,
    sortExpression?: string,
    punchNo?: string
  ): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    params = params.append("tagNo", tagNo.toString());
    params = params.append("pageNumber", pageNumber.toString());
    params = params.append("pageSize", pageSize.toString());
    params = params.append("sortExpression", sortExpression || "");
    params = params.append("system", system || "");
    params = params.append("subSystem", subSystem || "");
    params = params.append("discipline", discipline || "");
    params = params.append("category", category || "");
    params = params.append("materialRequired", materialRequired != null ? materialRequired.toString() : "");
    params = params.append("location", location || "");
    params = params.append("status", status || "");
    params = params.append("punchNo", punchNo || "");
    return this.http
      .HttpGet(ApiUrl.UnSubmittedPunches, params, true)
      .pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getPunchDetail(
    projectKey: string,
    id: string
  ): Observable<UpdatePunchItemModel> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    params = params.append("punchId", id.toString());
    return this.http
      .HttpGet(ApiUrl.PunchDetail, params, true)
      .pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  getTagLookUpPunchPage(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    return this.http
      .HttpGet(ApiUrl.TagLookUpPunchPage, params, true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getDrawingLookUpPunchPage(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    return this.http
      .HttpGet(ApiUrl.DrawingLookUpPunchPage, params, true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getDisciplineLookUpPunchPage(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append('projectKey', projectKey.toString());
    return this.http
      .HttpGet(ApiUrl.DisciplineLookUpPunchPage, params, true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updatePunchPage(
    model: UpdatePunchItemModel,
    images: File[]
  ): Observable<ApiResponse> {
    // var body = {
    //   ...model,
    //   projectKey: projectKey,
    // };
    let formData: FormData = new FormData();
    images.forEach(element => {
      formData.append("images", element)
    });
    formData.append("model", JSON.stringify(model));
    // return this.http
    //   .HttpPost(ApiUrl.UpdatePunchPage, JSON.stringify(body), true)
    //   .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));

    return this.http.HttpPostFormData(ApiUrl.UpdatePunchPage, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  createPunchPage(
    model: CreatePunchItemModel, images: File[]): Observable<ApiResponse> {
    // var body = {
    //   ...model
    // };
    let formData: FormData = new FormData();
    images.forEach(element => {
      formData.append("images", element)
    });
    formData.append("model", JSON.stringify(model));
    // return this.http
    //   .HttpPost(ApiUrl.CreatePunchPage, JSON.stringify(body), true)
    //   .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    return this.http.HttpPostFormData(ApiUrl.CreatePunchPage, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deletePunchPage(ids: string[], projectKey: string): Observable<ApiResponse> {
    var body = {
      PunchIds: ids,
      projectKey: projectKey,
    };
    return this.http
      .HttpPost(ApiUrl.DeletePunchPage, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  approvePunches(ids: string[], projectKey: string): Observable<ApiResponse> {
    var body = {
      PunchIds: ids,
      projectKey: projectKey,
    };
    return this.http
      .HttpPost(ApiUrl.ApprovePunches, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  rejectPunches(
    ids: string[],
    reason: string = "",
    projectKey: string
  ): Observable<ApiResponse> {
    var body = {
      PunchIds: ids,
      Reason: reason,
      projectKey: projectKey,
    };
    return this.http
      .HttpPost(ApiUrl.RejectPunches, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deletePunches(
    ids: string[],
    reason: string = "",
    projectKey: string
  ): Observable<ApiResponse> {
    var body = {
      PunchIds: ids,
      Reason: reason,
      projectKey: projectKey,
    };
    return this.http
      .HttpPost(ApiUrl.DeletePunches, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  signValidate(ids: string[], projectKey: string): Observable<ApiResponse> {
    var body = {
      PunchIds: ids,
      projectKey: projectKey,
    };
    return this.http
      .HttpPost(ApiUrl.SignValidate, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  signOffPunches(
    ids: string[],
    projectKey: string,
    pinCode: number
  ): Observable<ApiResponse> {
    var body = {
      PunchIds: ids,
      projectKey: projectKey,
      pinCode: pinCode,
    };
    return this.http
      .HttpPost(ApiUrl.SignOffPunches, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getCountUserPunch(
    projectKey: string,
    tagNo: string,
  ): Observable<CounterUserPunchesModel> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    params = params.append("tagNo", tagNo.toString());
    return this.http
      .HttpGet(ApiUrl.CountUserPunch, params, true)
      .pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  downloadPunchLookup(projectKey: string): Observable<ApiResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    return this.http
      .HttpGet(ApiUrl.DownloadDataLookUp, params, true)
      .pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }
}
