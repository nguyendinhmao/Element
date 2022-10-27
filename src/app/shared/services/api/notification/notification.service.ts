import { HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ApiListResponse, ApiResponse } from 'src/app/shared/models/api-response/api-response';
import { ApiUrl } from '../../api-url/api-url';
import { HttpService } from '../../http/http.service';
import { map, catchError } from 'rxjs/operators';
import { ApiHelper } from '../api-helper';
import 'signalr';
declare var $: any;

export interface INotificationInterface {
    getNotificationList(pageNumber: number, pageSize: number, isRead: boolean, projectKey: string): Observable<ApiListResponse>;
    readNotification(id: string, projectKey: string): Observable<ApiResponse>;
}

let CONFIGURATION = {
    baseUrls: {
        server: ApiUrl.NotificationRL,
    },
}

@Injectable({
    providedIn: 'root',
})

export class NotificationService implements INotificationInterface {
    private proxy: any;
    private proxyName: string = 'NotificationHub';
    private connection: any;
    public messageReceived: EventEmitter<any>;
    public connectionEstablished: EventEmitter<Boolean>;
    public connectionExists: Boolean;

    constructor(
        private http: HttpService
    ) {
        // Constructor initialization  
        this.connectionEstablished = new EventEmitter<Boolean>();
        this.messageReceived = new EventEmitter<any>();
        this.connectionExists = false;
        // create hub connection  
        this.connection = $.hubConnection(CONFIGURATION.baseUrls.server);
        // create new proxy as name already given in top  
        this.proxy = this.connection.createHubProxy(this.proxyName);
        // register on server events  
        this.registerOnServerEvents();
        // call the connection start method to start the connection to send and receive events.  
        this.startConnection();
    }

    private startConnection(): void {
        this.connection.start().done((data: any) => {
            console.log('Now connected ' + data.transport.name + ', connection ID= ' + data.id);
            this.connectionEstablished.emit(true);
            this.connectionExists = true;
        }).fail((error: any) => {
            console.log('Could not connect ' + error);
            this.connectionEstablished.emit(false);
        });
    }

    private registerOnServerEvents(): void {
        this.proxy.on('setRealTime', (data: any) => {
            console.log('received in SignalRService: ' + JSON.stringify(data));
            this.messageReceived.emit(data);
        });
    }

    getNotificationList(pageNumber: number, pageSize: number, isRead: boolean, projectKey: string): Observable<ApiListResponse> {
        let params = new HttpParams();
        params = params.append('pageNumber', pageNumber.toString());
        params = params.append('pageSize', pageSize.toString());
        params = params.append('isRead', isRead.toString());
        params = params.append('projectKey', projectKey || '');

        return this.http.HttpGet(ApiUrl.NotificationList, params, true).pipe(map(ApiHelper.extractJsonListData), catchError(ApiHelper.onFail));
    }

    readNotification(id: string, projectKey: string): Observable<ApiResponse> {
        var body = {
            'notificationId': id,
            'projectKey': projectKey || ''
        };
        return this.http.HttpPost(ApiUrl.ReadNotification, JSON.stringify(body), true).pipe(map(ApiHelper.extractData), catchError(ApiHelper.onFail));
    }
}