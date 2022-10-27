import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ITRAdminUpdationModel, ITRAdminCreatetionModel, UpdationItrAllocationModel, UpdationItrAllocationCommand } from 'src/app/shared/models/itr-tab/itr-admin.model';
import { EquipmentItrCreationModel, EquipmentItrUpdationModel, ITRAllocationModel } from 'src/app/shared/models/itr-tab/itr-allocation.model';
import { ItrTemplateUpdationModel, ItrTemplateCreationModel } from 'src/app/shared/models/itr-builder/itr-builder-template.model';
import { ItrBuilderUpdationModel, ItrBuilderCreationModel} from 'src/app/shared/models/itr-builder/itr-builder.model';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';

export interface IITRService {
    getITRList(projectKey: string, pageIndex: number, pageSize: number, itrNo?: string,
        description?: string,
        type?: string,
        discipline?: string,
        signatureCount?: string,
        milestone?: string,
        fromDate?: string,
        toDate?: string, sortExpression?: string): Observable<ApiListResponse>;
    getITRListLookup(projectKey: string, pageIndex: number, pageSize: number, itrNo?: string): Observable<ApiListResponse>;
    createITR(model: ITRAdminCreatetionModel): Observable<ApiResponse>;
    updateITR(model: ITRAdminUpdationModel): Observable<ApiResponse>;
    deleteITR(id: string): Observable<ApiResponse>;
    getITRById(id: string): Observable<ITRAdminUpdationModel>;
    getEquipmentItrList(
        pageIndex: number, pageSize: number,
        projectKey: string,
        equipmentCode?: string,
        description?: string): Observable<ApiListResponse>;
    createEquipment(model: EquipmentItrCreationModel): Observable<ApiResponse>;
    ItrTemplateLookUp(type: string, projectKey): Observable<ApiListResponse>;
    getItrTemplateById(id: string): Observable<ItrTemplateUpdationModel>;
    createItrTemplate(model: ItrTemplateCreationModel): Observable<ApiResponse>;
    updateItrTemplate(model: ItrTemplateCreationModel): Observable<ApiResponse>;
    getItrBuilderByItrNo(projectKey: string, itrNo: string): Observable<ItrTemplateUpdationModel>;
    getItrAllocatedList(
        pageIndex: number, pageSize: number,
        projectKey:string,
        equipmentCode?:string,
        sortExpression?:string): Observable<ApiListResponse>;
    getItrEquipmentList(
        pageIndex: number, pageSize: number,
        itrNo?:string,
        projectKey?:string): Observable<ApiListResponse>;
    getEquipmentItrDetail(equipmentCode: string, projectKey: string): Observable<ITRAllocationModel>;
};

@Injectable({
    providedIn: 'root',
})
export class ITRService implements IITRService {
    constructor(
        private http: HttpService,
    ) { }
    getITRListLookup(projectKey: string, pageIndex: number, pageSize: number, itrNo?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey);
        params = params.append('itrNo', itrNo || "");
        params = params.append('pageNumber', pageIndex.toString());
        params = params.append('pageSize', pageSize.toString());
        return this.http.HttpGet(ApiUrl.ItrListLookup, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    getITRList(projectKey: string,
        pageIndex: number, pageSize: number,
        itrNo?: string,
        description?: string,
        type?: string,
        discipline?: string,
        signatureCount?: string,
        milestone?: string,
        fromDate?: string,
        toDate?: string, sortExpression?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('itrNo', itrNo || "");
        params = params.append('description', description || "");
        params = params.append('type', type || "");
        params = params.append('discipline', discipline || "");
        params = params.append('signatureCount', signatureCount || "");
        params = params.append('milestone', milestone || "");
        params = params.append('fromDate', fromDate || "");
        params = params.append('toDate', toDate || "")
        params = params.append('sortExpression', sortExpression);
        params = params.append('projectKey', projectKey);
        params = params.append('pageNumber', pageIndex.toString());
        params = params.append('pageSize', pageSize.toString());
        return this.http.HttpGet(ApiUrl.ITRList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    createITR(model: ITRAdminCreatetionModel): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('data', JSON.stringify(model));
        return this.http.HttpPostFormData(ApiUrl.CreateITR, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    updateITR(model: ITRAdminUpdationModel): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('data', JSON.stringify(model));
        return this.http.HttpPostFormData(ApiUrl.UpdateITR, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deleteITR(id: string): Observable<ApiResponse> {
        var body = {
            ItrId: id
        };
        return this.http.HttpPost(ApiUrl.DeleteITR, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getITRById(id: string): Observable<ITRAdminUpdationModel> {
        let params = new HttpParams();
        params = params.append('itrId', id.toString());
        return this.http.HttpGet(ApiUrl.ITRDetail, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
    }

    getEquipmentItrList(
        pageIndex: number, pageSize: number,
        projectKey: string,
        sortExpression: string,
        equipmentCode?: string,
        description?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey);
        params = params.append('equipmentCode', equipmentCode || "");
        params = params.append('description', description || "");
        params = params.append('sortExpression', sortExpression || "");
        params = params.append('pageNumber', pageIndex.toString());
        params = params.append('pageSize', pageSize.toString());

        return this.http.HttpGet(ApiUrl.EquipmentITRList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));

    }

    createEquipment(model: EquipmentItrCreationModel): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('data', JSON.stringify(model));
        return this.http.HttpPostFormData(ApiUrl.CreateEquipmentItr, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deleteListEquipmet(listEquipmentId: string): Observable<ApiResponse> {
        var body = {
            listEquipmentId: listEquipmentId
        };
        return this.http.HttpPost(ApiUrl.DeleteListEquipmentItr, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
    deleteListItr(listItrId: string): Observable<ApiResponse> {
        var body = {
            listItrId: listItrId
        };
        return this.http.HttpPost(ApiUrl.DeleteListItr, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getImageStorage(): Observable<ApiListResponse> {
        return this.http.HttpGet(ApiUrl.GetListImageStorage, null, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    ItrTemplateLookUp(type: string, projectKey): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('type', type.toString());
        params = params.append('projectKey', projectKey.toString());
        return this.http.HttpGet(ApiUrl.ItrTemplateLookUp, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    getItrTemplateById(id: string): Observable<ItrTemplateUpdationModel> {
        let params = new HttpParams();
        params = params.append('Id', id.toString());
        return this.http.HttpGet(ApiUrl.ItrTemplateDetail, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
    }

    createItrTemplate(model: ItrTemplateCreationModel): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('data', JSON.stringify(model));
        return this.http.HttpPost(ApiUrl.CreateItrTemplate, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    updateItrTemplate(model: ItrTemplateCreationModel): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('data', JSON.stringify(model));
        return this.http.HttpPost(ApiUrl.UpdateItrTemplate, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getItrBuilderByItrNo(projectKey: string, itrNo: string): Observable<ItrTemplateUpdationModel> {
        let params = new HttpParams();
        params = params.append('itrNo', itrNo.toString());
        params = params.append('projectKey', projectKey.toString());
        return this.http.HttpGet(ApiUrl.ItrBuilderDetail, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
    }
    
    deleteItrBuilderTemplate(id: string): Observable<ApiResponse> {
        var body = {
            id: id
        };
        return this.http.HttpPost(ApiUrl.DeleteItrTemplate, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    updateItrBuilder(model: ItrBuilderUpdationModel): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.UpdateItrBuilder, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    createItrBuilder(model: ItrBuilderCreationModel): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.CreateItrBuilder, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getItrEquipmentList(
        pageIndex: number, pageSize: number,
        itrNo?:string,
        projectKey?:string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('itrNo', itrNo || "");
        params = params.append('projectKey', projectKey || "");
        params = params.append('pageNumber', pageIndex.toString());
        params = params.append('pageSize', pageSize.toString());

        return this.http.HttpGet(ApiUrl.ItrEquipmentList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));

    }

    getEquipmentItrDetail(equipmentCode: string, projectKey: string): Observable<ITRAllocationModel> {
        let params = new HttpParams();
        params = params.append('equipmentCode', equipmentCode.toString());
        params = params.append('projectKey', projectKey.toString());
        return this.http.HttpGet(ApiUrl.EquipmentItrDetail, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
    }

    getItrAllocatedList(
        pageIndex: number, pageSize: number,
        projectKey?:string,
        equipmentCode?:string,
        sortExpression?:string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey || "");
        params = params.append('equipmentCode', equipmentCode || "");
        params = params.append('sortExpression',sortExpression || "")
        params = params.append('pageNumber', pageIndex.toString());
        params = params.append('pageSize', pageSize.toString());
        return this.http.HttpGet(ApiUrl.ITRAllocatedList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    updateItrAllocation(model: UpdationItrAllocationCommand): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.UpdateItrAllocation, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getItrSignatureLookUp(projectKey: string, itrNo: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append("projectKey", projectKey.toString());
        params = params.append("itrNo", itrNo.toString());
        return this.http
          .HttpGet(ApiUrl.ItrSignatureLookUp, params, true)
          .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    
    insertRecordsViaCsvFile(projectId:string ,file: File): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('projectId', projectId);
        formData.append('file', file);
        return this.http.HttpPostFormData(ApiUrl.InsertRecordsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    exportToExcel(model: ExportParamModel): Observable<ExportModel> {
        let params = new HttpParams();
        params = params.append('value', JSON.stringify(model));
        return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
    
}
