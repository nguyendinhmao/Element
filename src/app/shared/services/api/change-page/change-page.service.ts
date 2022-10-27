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
  CreateChangeItemModel,
  ChangeFirstStageModel,
  UpdateOrtherStageChangeModel,
  CounterUserChangesModel,
  DetailChangeModel,
  ApproveModel,
  OtherChangeStageModel,
  RejectModel,
  AttachmentModel
} from "src/app/shared/models/change-tab/change-tab.model";

export interface IChangePageService {}
export class ApiListResponseChange {
  status: number;
  content: Array<any>;
  items: Array<any>;
  message: string;
  totalItemCount: number;
  isCanCreateChange: boolean;
}
@Injectable({
  providedIn: "root",
})
export class ChangePageService implements IChangePageService {
  constructor(private http: HttpService) { }

  getDataChangePage(
    projectKey: string,
    pageNumber: number,
    pageSize: number,
    sortExpression?: string,
    changeNo?: string,
    title?: string,
    changeTypeId?: string,
    stage?: string,
    tagNo?: string,
    system?: string,
    subSystem?: string,
    discipline?: string,
  ): Observable<ApiListResponseChange> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    params = params.append("sortExpression", sortExpression || "");
    params = params.append("changeNo", changeNo || "");
    params = params.append("title", title || "");
    params = params.append("changeTypeId", changeTypeId || "");
    params = params.append("stage", stage || "");
    params = params.append("pageNumber", pageNumber.toString());
    params = params.append("tagNo",tagNo);
    params = params.append("pageSize", pageSize.toString());
    params = params.append("systemId", system || "");
    params = params.append("subSystemId", subSystem || "");
    params = params.append("disciplineId", discipline || "");
    return this.http
      .HttpGet(ApiUrl.ListChange, params, true)
      .pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getListSubmittedChanges(
    projectKey: string,
    pageNumber: number,
    pageSize: number,
    sortExpression?: string,
    changeNo?: string,
    title?: string,
    changeTypeId?: string,
    stage?: string,
    system?: string,
    subSystem?: string,
    discipline?: string,
  ): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    params = params.append("pageNumber", pageNumber.toString());
    params = params.append("pageSize", pageSize.toString());
    params = params.append("sortExpression", sortExpression || "");
    params = params.append("changeNo", changeNo || "");
    params = params.append("title", title || "");
    params = params.append("changeTypeId", changeTypeId || "");
    params = params.append("stage", stage || "");
    params = params.append("systemId", system || "");
    params = params.append("subSystemId", subSystem || "");
    params = params.append("disciplineId", discipline || "");
    return this.http
      .HttpGet(ApiUrl.ChangeApproveList, params, true)
      .pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getChangesNeedMySignature(
    projectKey: string,
    pageNumber: number,
    pageSize: number,
    sortExpression?: string,
    changeNo?: string,
    title?: string,
    changeTypeId?: string,
    stage?: string,
    system?: string,
    subSystem?: string,
    discipline?: string,
  ): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    params = params.append("pageNumber", pageNumber.toString());
    params = params.append("pageSize", pageSize.toString());
    params = params.append("sortExpression", sortExpression || "");
    params = params.append("changeNo", changeNo || "");
    params = params.append("title", title || "");
    params = params.append("changeTypeId", changeTypeId || "");
    params = params.append("stage", stage || "");
    params = params.append("systemId", system || "");
    params = params.append("subSystemId", subSystem || "");
    params = params.append("disciplineId", discipline || "");
    return this.http
      .HttpGet(ApiUrl.ChangeSignOffList, params, true)
      .pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getUnSubmittedChanges(
    projectKey: string,
    pageNumber: number,
    pageSize: number,
    sortExpression?: string,
    changeNo?: string,
    title?: string,
    changeTypeId?: string,
    stage?: string,
    system?: string,
    subSystem?: string,
    discipline?: string,
  ): Observable<ApiListResponseChange> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    params = params.append("pageNumber", pageNumber.toString());
    params = params.append("pageSize", pageSize.toString());
    params = params.append("sortExpression", sortExpression || "");
    params = params.append("changeNo", changeNo || "");
    params = params.append("title", title || "");
    params = params.append("changeTypeId", changeTypeId || "");
    params = params.append("stage", stage || "");
    params = params.append("systemId", system || "");
    params = params.append("subSystemId", subSystem || "");
    params = params.append("disciplineId", discipline || "");
    return this.http
      .HttpGet(ApiUrl.ChangeUpdateList, params, true)
      .pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
  }

  getChangeDetail(
    id: string
  ): Observable<DetailChangeModel> {
    let params = new HttpParams();
    params = params.append("id", id.toString());
    return this.http
      .HttpGet(ApiUrl.DetailChange, params, true)
      .pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  getChangeTypeLookup(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
      return this.http
      .HttpGet(ApiUrl.ChangeTypeLookup, params, true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  updateChangeFirstStage(
    model: ChangeFirstStageModel,
  ): Observable<ApiResponse> {
    var body = {
      ...model
    };
    return this.http
      .HttpPost(ApiUrl.UpdateChangeFirstStage, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  updateChangeOrtherStage(
    model: OtherChangeStageModel
  ): Observable<ApiResponse> {
    var body = {
      ...model,
    };
    return this.http
      .HttpPost(ApiUrl.UpdateChangeOtherStage, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  createChangePage(
    model: CreateChangeItemModel,
  ): Observable<ApiResponse> {
    var body = {
      ...model
    };
    return this.http
      .HttpPost(ApiUrl.CreateChange, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  approveChange(approvelModel: ApproveModel): Observable<ApiResponse> {
    var body = {
      ...approvelModel
    };
    return this.http
      .HttpPost(ApiUrl.ApproveChangeStage, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  rejectChange(rejectModel: RejectModel
  ): Observable<ApiResponse> {
    var body = {
      ...rejectModel
    };
    return this.http
      .HttpPost(ApiUrl.RejectChangeStage, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  deleteChanges(
    ids: string[],
    projectKey: string
  ): Observable<ApiResponse> {
    var body = {
      changeIds : ids,
      projectKey
    };
    return this.http
      .HttpPost(ApiUrl.DeleteChanges, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  signValidate(ids: string[], projectKey: string): Observable<ApiResponse> {
    var body = {
      ChangeIds: ids,
      projectKey: projectKey,
    };
    return this.http
      .HttpPost(ApiUrl.SignValidateChange, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  signOffChanges(
    ids: string[],
    projectKey: string,
    pinCode: number
  ): Observable<ApiResponse> {
    var body = {
      ChangeIds: ids,
      projectKey: projectKey,
      pinCode: pinCode,
    };
    return this.http
      .HttpPost(ApiUrl.SignOffChanges, JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  getCountUserChange(
    projectKey: string
  ): Observable<CounterUserChangesModel> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey.toString());
    return this.http
      .HttpGet(ApiUrl.CountUserChange, params, true)
      .pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
  }

  getChangeAttachment(changeId: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("changeId", changeId);
      return this.http
      .HttpGet(ApiUrl.ListAttachmentChange, params, true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  updateChangeAttachment(changeId: string, files: File[]): Observable<ApiListResponse> {
    let formData: FormData = new FormData();
    files.forEach(element => {
      formData.append("files", element)
    });
    formData.append("changeId", changeId);
    return this.http.HttpPostFormData(ApiUrl.UpdateAttachment, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }

  removeChangeAttachment(
    attachmentId: string,
    changeId: string
  ): Observable<ApiResponse> {
    var body = {
    attachmentId: attachmentId,
    changeId: changeId,
  };
    return this.http
      .HttpPost(ApiUrl.RemoveChangeAttachment,  JSON.stringify(body), true)
      .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
  }
  
  getChangeStageLookUp(projectKey: string): Observable<ApiListResponse> {
    let params = new HttpParams();
    params = params.append("projectKey", projectKey);
    return this.http.HttpGet(ApiUrl.ChangeStageLookup, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
}
}
