import { Observable } from 'rxjs';
import { ApiListResponse } from '../models/api-response/api-response';
import { LimitsTabModel } from '../models/limits-tab/limits-tab.model';

let limitsTabData: LimitsTabModel[] = [
    { drawingNo: 1, description: '', type: '', rev: '' },
    { drawingNo: 2, description: '', type: '', rev: '' },
    { drawingNo: 3, description: '', type: '', rev: '' },
    { drawingNo: 4, description: '', type: '', rev: '' },
    { drawingNo: 5, description: '', type: '', rev: '' },
    { drawingNo: 6, description: '', type: '', rev: '' },
    { drawingNo: 7, description: '', type: '', rev: '' },
    { drawingNo: 8, description: '', type: '', rev: '' },
    { drawingNo: 9, description: '', type: '', rev: '' },
    { drawingNo: 10, description: '', type: '', rev: '' },
    { drawingNo: 11, description: '', type: '', rev: '' },
    { drawingNo: 12, description: '', type: '', rev: '' },
    { drawingNo: 13, description: '', type: '', rev: '' },
    { drawingNo: 14, description: '', type: '', rev: '' },
    { drawingNo: 15, description: '', type: '', rev: '' },
    { drawingNo: 16, description: '', type: '', rev: '' },
    { drawingNo: 17, description: '', type: '', rev: '' },
    { drawingNo: 18, description: '', type: '', rev: '' },
    { drawingNo: 19, description: '', type: '', rev: '' },
    { drawingNo: 20, description: '', type: '', rev: '' },
];

export class MockLimitsTabApi {
    public getLimitsTabData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            content: <LimitsTabModel[]>[...limitsTabData]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}