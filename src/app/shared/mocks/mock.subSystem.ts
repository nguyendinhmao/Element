import { Observable } from 'rxjs';
import { ApiListResponse, ApiResponse } from '../models/api-response/api-response';
import { SubSystemModel } from '../models/sub-sytem/sub-sytem.model';

let subSystemDatas: SubSystemModel[] = [
    { subSystemId: 1, subSystemName: 'LP Compressor 3100-01', status: 'Active' },
    { subSystemId: 2, subSystemName: 'MP Compressor 3100-02', status: 'Active' },
]

export class MockSubSystemApi {
    public getSubSystemData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            content: <SubSystemModel[]>[...subSystemDatas]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }

    public getSubSystemById = (subSystemId: number): Observable<ApiResponse> => {
        let data = subSystemDatas.find((b) => b.subSystemId == subSystemId);
        let response = <ApiResponse>{
            status: 1,
            message: '',
            content: <SubSystemModel>{ ...data }
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}