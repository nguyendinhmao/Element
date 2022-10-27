import { Observable } from 'rxjs';
import { ApiListResponse } from '../models/api-response/api-response';
import { PunchListModel } from '../models/punch-list/punch-list.model';

let punchListData: PunchListModel[] = [
    { punchListId: 1, punchList: '8820-01', punchListDescription: '', system: 'Oil', subSystem: 'LP Compressor 3100-01' },
    { punchListId: 2, punchList: '8820-02', punchListDescription: '', system: 'Oil', subSystem: 'LP Compressor 3100-01' },
    { punchListId: 3, punchList: '8820-03', punchListDescription: '', system: 'Oil', subSystem: 'LP Compressor 3100-01' },
    { punchListId: 4, punchList: '8820-04', punchListDescription: '', system: 'Oil', subSystem: 'LP Compressor 3100-01' },
    { punchListId: 5, punchList: '8820-05', punchListDescription: '', system: 'Oil', subSystem: 'LP Compressor 3100-01' },
    { punchListId: 6, punchList: '8820-06', punchListDescription: '', system: 'Gas', subSystem: 'MP Compressor 3100-02' },
    { punchListId: 7, punchList: '8820-07', punchListDescription: '', system: 'Gas', subSystem: 'MP Compressor 3100-02' },
    { punchListId: 8, punchList: '8820-08', punchListDescription: '', system: 'Gas', subSystem: 'MP Compressor 3100-02' },
    { punchListId: 9, punchList: '8820-09', punchListDescription: '', system: 'Gas', subSystem: 'MP Compressor 3100-02' },
    { punchListId: 10, punchList: '8820-10', punchListDescription: '', system: 'Gas', subSystem: 'MP Compressor 3100-02' },
    { punchListId: 11, punchList: '8820-11', punchListDescription: '', system: 'Produced Water', subSystem: 'LP Compressor 3100-01' },
    { punchListId: 12, punchList: '8820-12', punchListDescription: '', system: 'Produced Water', subSystem: 'LP Compressor 3100-01' },
    { punchListId: 13, punchList: '8820-13', punchListDescription: '', system: 'Produced Water', subSystem: 'LP Compressor 3100-01' },
    { punchListId: 14, punchList: '8820-14', punchListDescription: '', system: 'Produced Water', subSystem: 'LP Compressor 3100-01' },
    { punchListId: 15, punchList: '8820-15', punchListDescription: '', system: 'Produced Water', subSystem: 'LP Compressor 3100-01' },
    { punchListId: 16, punchList: '8820-16', punchListDescription: '', system: 'Power', subSystem: 'MP Compressor 3100-02' },
    { punchListId: 17, punchList: '8820-17', punchListDescription: '', system: 'Power', subSystem: 'MP Compressor 3100-02' },
    { punchListId: 18, punchList: '8820-18', punchListDescription: '', system: 'Power', subSystem: 'MP Compressor 3100-02' },
    { punchListId: 19, punchList: '8820-19', punchListDescription: '', system: 'Power', subSystem: 'MP Compressor 3100-02' },
    { punchListId: 20, punchList: '8820-20', punchListDescription: '', system: 'Power', subSystem: 'MP Compressor 3100-02' },
];

export class MockPunchListApi {
    public getPunchListData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            content: <PunchListModel[]>[...punchListData]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}