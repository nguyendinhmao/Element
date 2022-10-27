import { ReportTypeModel } from "../models/report-type/report-type";
import { Observable } from 'rxjs';
import { ApiListResponse } from '../models/api-response/api-response';

let reportTypeData: ReportTypeModel[] = [
    { reportTypeId: 1, key: '', reportTypeName: "Skyline" },
    { reportTypeId: 2, key: '', reportTypeName: "Punch List" },
    { reportTypeId: 3, key: '', reportTypeName: "System Summary" },
    { reportTypeId: 4, key: '', reportTypeName: "Sub-system summary" },
    { reportTypeId: 5, key: '', reportTypeName: "Outstanding ITRs" },
    { reportTypeId: 6, key: '', reportTypeName: "Milestone Summary" },
    { reportTypeId: 7, key: '', reportTypeName: "Daily Progress" },
    { reportTypeId: 8, key: '', reportTypeName: "Handover Status" },
    { reportTypeId: 9, key: '', reportTypeName: "Outstanding Change" }
]

const lookupData = {
    systems: [
        { id: 1, value: 'system No 1' },
        { id: 2, value: 'system No 2' },
        { id: 3, value: 'system No 3' },
        { id: 4, value: 'system No 4' },
        { id: 5, value: 'system No 5' },
        { id: 6, value: 'system No 6' }
    ],
    subsystems: [
        { id: 1, value: 'subsystem No 1' },
        { id: 2, value: 'subsystem No 2' },
        { id: 3, value: 'subsystem No 3' },
        { id: 4, value: 'subsystem No 4' },
        { id: 5, value: 'subsystem No 5' },
        { id: 6, value: 'subsystem No 6' }
    ],
    tags: [
        { id: 1, value: 'tag No 1' },
        { id: 2, value: 'tag No 2' },
        { id: 3, value: 'tag No 3' },
        { id: 4, value: 'tag No 4' },
        { id: 5, value: 'tag No 5' },
        { id: 6, value: 'tag No 6' }
    ],
    workPacks: [
        { id: 1, value: 'work pack No 1' },
        { id: 2, value: 'work pack No 2' },
        { id: 3, value: 'work pack No 3' },
        { id: 4, value: 'work pack No 4' },
        { id: 5, value: 'work pack No 5' },
        { id: 6, value: 'work pack No 6' }
    ],
    jobCards: [
        { id: 1, value: 'job card No 1' },
        { id: 2, value: 'job card No 2' },
        { id: 3, value: 'job card No 3' },
        { id: 4, value: 'job card No 4' },
        { id: 5, value: 'job card No 5' },
        { id: 6, value: 'job card No 6' }
    ],
    disciplines: [
        { id: 1, value: 'discipline No 1' },
        { id: 2, value: 'discipline No 2' },
        { id: 3, value: 'discipline No 3' },
        { id: 4, value: 'discipline No 4' },
        { id: 5, value: 'discipline No 5' },
        { id: 6, value: 'discipline No 6' }
    ],
    locations: [
        { id: 1, value: 'location No 1' },
        { id: 2, value: 'location No 2' },
        { id: 3, value: 'location No 3' },
        { id: 4, value: 'location No 4' },
        { id: 5, value: 'location No 5' },
        { id: 6, value: 'location No 6' }
    ],
    drawings: [
        { id: 1, value: 'drawing No 1' },
        { id: 2, value: 'drawing No 2' },
        { id: 3, value: 'drawing No 3' },
        { id: 4, value: 'drawing No 4' },
        { id: 5, value: 'drawing No 5' },
        { id: 6, value: 'drawing No 6' }
    ],
    milestones: [
        { id: 1, value: 'Milestone Name 1' },
        { id: 2, value: 'Milestone Name 2' },
        { id: 3, value: 'Milestone Name 3' },
        { id: 4, value: 'Milestone Name 4' },
        { id: 5, value: 'Milestone Name 5' },
        { id: 6, value: 'Milestone Name 6' }
    ]
}

export class MockReportTypeApi {
    public getReportTypeData = (): Observable<ApiListResponse> => {

        let response = <ApiListResponse>{
            status: 1,
            message: '',
            content: <ReportTypeModel[]>[...reportTypeData]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }

    public getLookups = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            content: <any>{ ...lookupData }
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}