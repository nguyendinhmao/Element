import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { HttpService } from '../../http/http.service';
import { Injectable } from '@angular/core';
import { ApiUrl } from '../../api-url/api-url';
import { ApiHelper } from '../api-helper';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ExportParamModel, ExportModel } from 'src/app/shared/models/data-tab/data-tab.model';
import { DataDrawingModel, DrawingModel, UpdateAttachmentDrawingFile, UpdateDrawingModel } from 'src/app/shared/models/data-tab/data-drawing.model';

export interface IDataDrawingService {
    getDataDrawing(projectId: string, pageIndex: number, pageSize: number, sortExpression?: string, drawingNo?: string): Observable<ApiListResponse>;
    getDrawingId(id: string): Observable<DataDrawingModel>;
    updateDrawing(model: UpdateDrawingModel, files: File): Observable<ApiResponse>;
    deleteDrawing(id: string): Observable<ApiResponse>;
    exportToExcel(model: ExportParamModel): Observable<ExportModel>;
    insertDrawingsViaCsvFile(projectId: string, file: File): Observable<ApiResponse>;
    getDrawingLookUp(projectKey: string): Observable<ApiListResponse>;
    getLocationDrawingLookUp(projectId: string): Observable<ApiListResponse>;
    createDrawing(model: DrawingModel, files: File): Observable<ApiResponse>;
    updateAttachmentDrawingFile(model: UpdateAttachmentDrawingFile, files: File): Observable<ApiResponse>;
}

@Injectable({
    providedIn: 'root',
})
export class DataDrawingService implements IDataDrawingService {
    constructor(
        private http: HttpService
    ) { }
    getDrawingLookUp(projectKey: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey || '');
        return this.http.HttpGet(ApiUrl.DrawingLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getLocationDrawingLookUp(): Observable<ApiListResponse> {
        return this.http.HttpGet(ApiUrl.LocationDrawingLookUp, null, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getDataDrawing(projectId: string, pageNumber: number, pageSize: number, sortExpression?: string, drawingNo?: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectId', projectId);
        params = params.append('pageNumber', pageNumber.toString());
        params = params.append('pageSize', pageSize.toString());
        params = params.append('sortExpression', sortExpression);
        params = params.append('drawingNo', drawingNo);
        return this.http.HttpGet(ApiUrl.DataDrawingsList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    getDrawingId(id: string): Observable<DataDrawingModel> {
        let params = new HttpParams();
        params = params.append('drawingId', id.toString());
        return this.http.HttpGet(ApiUrl.GetDrawingById, params, true).pipe(map(ApiHelper.extractJsonData), catchError(ApiHelper.onFail));
    }

    createDrawing(model: DrawingModel, file: File): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('data', JSON.stringify(model));
        formData.append('file', file);
        return this.http.HttpPostFormData(ApiUrl.CreateDrawing, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    updateDrawing(model: UpdateDrawingModel, file: File): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('data', JSON.stringify(model));
        formData.append('file', file);
        return this.http.HttpPostFormData(ApiUrl.UpdateDrawing, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    insertDrawingsViaCsvFile(projectId: string, file: File): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('projectId', projectId);
        formData.append('file', file);
        return this.http.HttpPostFormData(ApiUrl.InsertDrawingsViaCsvFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deleteDrawing(id: string): Observable<ApiResponse> {
        var body = {
            drawingId: id
        };
        return this.http.HttpPost(ApiUrl.DeleteDrawing, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    updateAttachmentDrawingFile(model: UpdateAttachmentDrawingFile, file: File): Observable<ApiResponse> {
        let formData: FormData = new FormData();
        formData.append('drawingId', model.drawingId || '');
        formData.append('file', file);
        return this.http.HttpPostFormData(ApiUrl.UpdateAttachmentDrawingFile, formData, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    exportToExcel(model: ExportParamModel): Observable<ExportModel> {
        let params = new HttpParams();
        params = params.append('value', JSON.stringify(model));
        return this.http.HttpGet(ApiUrl.ExportToExcel, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}
