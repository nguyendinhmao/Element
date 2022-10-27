import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map } from 'rxjs/operators';
import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { ConditionalAcceptedModel, CreatePartialHandoverModel, MilestoneTabSignOffCommand, UpdateMilestonesTabModel } from 'src/app/shared/models/milestones-tab/milestones-tab.model';
import { ApiUrl } from '../../api-url/api-url';
import { HttpService } from '../../http/http.service';
import { ApiHelper } from '../api-helper';

export interface IMilestonesTabService {
    getMilestonesList(projectKey: string, system: string, subSystem: string, milestoneName: string, pageIndex: number, pageSize: number, sortExpression: string, handoverNo: string): Observable<ApiListResponse>;
    applyMilestones(model: UpdateMilestonesTabModel): Observable<ApiResponse>;
    getItrHandoverLookUp(handoverId: string): Observable<ApiListResponse>;
    getPunchHandoverLookUp(handoverId: string): Observable<ApiListResponse>;
    getChangeHandoverLookUp(handoverId: string): Observable<ApiListResponse>;
    deletePartialHandover(listHandoverId: Array<string>): Observable<ApiResponse>;
    onCheckWalkDownStatus(projectKey: string, handoverId: string): Observable<ApiResponse>;
    createPartialHandover(model: CreatePartialHandoverModel): Observable<ApiResponse>;
    startWalkDownHandover(handoverId: string): Observable<ApiResponse>;
    startWalkDownHandover(handoverId: string): Observable<ApiResponse>;
    signValidate(projectKey: string, handoverId: string): Observable<ApiResponse>;
    signOffWalkDown(milestoneTabSignOffCommand: MilestoneTabSignOffCommand): Observable<ApiResponse>;
    checkConditional(projectKey: string, handoverId: string): Observable<ApiResponse>;
    conditionalAcceptedHandover(model: ConditionalAcceptedModel): Observable<ApiResponse>;
    getDisciplineHandoverLookUp(handoverId: string): Observable<ApiListResponse>;
}

@Injectable({
    providedIn: 'root',
})

export class MilestonesTabService implements IMilestonesTabService {
    constructor(
        private http: HttpService
    ) { }

    getMilestonesList(projectKey: string, system: string, subSystem: string, milestoneName: string, pageIndex: number, pageSize: number, sortExpression: string, handoverNo: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey);
        params = params.append('system', system || "");
        params = params.append('subSystem', subSystem || "");
        params = params.append('milestoneName', milestoneName || "");
        params = params.append('pageNumber', pageIndex.toString());
        params = params.append('pageSize', pageSize.toString());
        params = params.append('sortExpression', sortExpression);
        params = params.append('handoverNo', handoverNo || "");

        return this.http.HttpGet(ApiUrl.MilestonePageList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    applyMilestones(model: UpdateMilestonesTabModel): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.UpdateMilestonePage, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getItrHandoverLookUp(handoverId: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('handoverId', handoverId);

        return this.http.HttpGet(ApiUrl.ItrHandoverLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getPunchHandoverLookUp(handoverId: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('handoverId', handoverId);

        return this.http.HttpGet(ApiUrl.PunchHandoverLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    getChangeHandoverLookUp(handoverId: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('handoverId', handoverId);

        return this.http.HttpGet(ApiUrl.ChangeHandoverLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    deletePartialHandover(listHandoverId: Array<string>): Observable<ApiResponse> {
        var body = {
            handoverIds: listHandoverId
        };
        return this.http.HttpPost(ApiUrl.DeletePartialHandover, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    onCheckWalkDownStatus(projectKey: string, handoverId: string): Observable<ApiResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey);
        params = params.append('handoverId', handoverId);

        return this.http.HttpGet(ApiUrl.CheckWalkDownStatus, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    createPartialHandover(model: CreatePartialHandoverModel): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.CreatePartialHandover, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    startWalkDownHandover(handoverId: string): Observable<ApiResponse> {
        var body = {
            handoverId: handoverId
        };
        return this.http.HttpPost(ApiUrl.StartWalkDownHandover, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    signValidate(projectKey: string, handoverId: string): Observable<ApiResponse> {
        var body = {
            projectKey: projectKey,
            handoverId: handoverId
        };
        return this.http.HttpPost(ApiUrl.MilestoneSignValidate, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    signOffWalkDown(milestoneTabSignOffCommand: MilestoneTabSignOffCommand): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.SignOffWalkDown, JSON.stringify(milestoneTabSignOffCommand), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    checkConditional(projectKey: string, handoverId: string): Observable<ApiResponse> {
        let params = new HttpParams();
        params = params.append('projectKey', projectKey);
        params = params.append('handoverId', handoverId);

        return this.http.HttpGet(ApiUrl.CheckConditional, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    conditionalAcceptedHandover(model: ConditionalAcceptedModel): Observable<ApiResponse> {
        return this.http.HttpPost(ApiUrl.ConditionalAcceptedHandover, JSON.stringify(model), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
    getDisciplineHandoverLookUp(handoverId: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('handoverId', handoverId);
        return this.http.HttpGet(ApiUrl.DisciplineHandoverLookUp, params, true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    downloadHandoverData(projectKey: string, handoverIds: string[]) {
        var body = {
            projectKey: projectKey,
            handoverIds: handoverIds || null,
        };
        return this.http.HttpPostWithProgress(ApiUrl.DownloadDataHandover, JSON.stringify(body), true)
            .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    lockHandovers(projectKey: string, handoverIds: string[]): Observable<ApiResponse> {
        var body = {
            projectKey: projectKey,
            handoverIds: handoverIds || null,
        };
        return this.http
            .HttpPost(ApiUrl.LockHandovers, JSON.stringify(body), true)
            .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }

    unlockHandovers(projectKey: string, handoverIds: string[]): Observable<ApiResponse> {
        var body = {
            projectKey: projectKey,
            handoverIds: handoverIds || null,
        };
        return this.http
            .HttpPost(ApiUrl.UnlockHandovers, JSON.stringify(body), true)
            .pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}