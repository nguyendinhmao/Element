import { Observable } from 'rxjs';
import { ApiListResponse, ApiResponse } from '../models/api-response/api-response';
import { SystemModel } from '../models/system/system.model';

let systemDatas: SystemModel[] = [
    { systemId: 1, systemName: "Oil", systemKey: 'O', systemLogo: '../../../../assets/img/default-thumbnail.jpg'},
    { systemId: 2, systemName: "Gas", systemKey: 'G', systemLogo: '../../../../assets/img/default-thumbnail.jpg'},
    { systemId: 3, systemName: "Produced Water", systemKey: 'PW', systemLogo: '../../../../assets/img/default-thumbnail.jpg'},
    { systemId: 4, systemName: "Power", systemKey: 'P', systemLogo: '../../../../assets/img/default-thumbnail.jpg'},
]

export class MockSystemApi {
    public getSystemData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            content: <SystemModel[]>[...systemDatas]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }

    public getSystemBySystemId = (systemId: number): Observable<ApiResponse> => {
        let data = systemDatas.find((b) => b.systemId == systemId);
        let response = <ApiResponse>{
            status: 1,
            message: '',
            content: <SystemModel>{ ...data }
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}