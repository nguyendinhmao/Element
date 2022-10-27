import { Observable } from 'rxjs';
import { ApiListResponse } from '../models/api-response/api-response';
import { UpdatePreservationElementModel } from '../models/data-tab/data-preservationelement.model';
import { DetailPreservationTabModel, PreservationModel } from '../models/preservation-tab/preservation-tab.model';
import { ProjectSignatureItem } from '../models/project-settings/project-signature.model';

//--- Preservation Tab
let preservationModelData: PreservationModel[] = [
    {
        tagId: 'pres1',
        tagNo: 'Pres 1',
        tagName: 'Preservation one',
        system: '123',
        subSystem: '456',
        locationCode: 'UK',
        discipline: 'INk',
        equipmentType: 'IR',
        status: 'Completed',
    },
    {
        tagId: 'pres2',
        tagNo: 'Pres 2',
        tagName: 'Preservation two',
        system: '123',
        subSystem: '456',
        locationCode: 'UK',
        discipline: 'INk',
        equipmentType: 'IR',
        status: 'Due',
    },
    {
        tagId: 'pres3',
        tagNo: 'Pres 3',
        tagName: 'Preservation three',
        system: '123',
        subSystem: '456',
        locationCode: 'UK',
        discipline: 'INk',
        equipmentType: 'IR',
        status: 'Overdue',
    },
    {
        tagId: 'pres4',
        tagNo: 'Pres 4',
        tagName: 'Preservation four',
        system: '123',
        subSystem: '456',
        locationCode: 'UK',
        discipline: 'INk',
        equipmentType: 'IR',
        status: 'Inactive',
    },

];

export class MockPreservationTabApi {
    public getPreservationTabData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            items: <PreservationModel[]>[...preservationModelData]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}

//--- Detail Preservation Tab

let detailPreservationData: DetailPreservationTabModel[] = [
    // {
    //     preservationId: 'pres1',
    //     element: 'Pres 1 testing',
    //     frequency: '12',
    //     type: 'Inital',
    //     dateDue: new Date(),
    //     status: 'Completed',
    //     isPause: true,
    //     isStop: false,
    //     isAllocated: false,
    //     signatures: [],
    //     images: [],
    //     dateComplete: new Date(),
    // },
    // {
    //     preservationId: 'pres2',
    //     element: 'Pres 2 testing',
    //     frequency: '10',
    //     type: 'Periodic',
    //     dateDue: new Date(),
    //     status: 'Due',
    //     isPause: false,
    //     isStop: false,
    //     isAllocated: true,
    //     signatures: [{ "number": 1, "description": "Administrator 1", "signedName": "Admin Elements", "signDate": new Date('2020-07-16T14:29:23.13'), "isTurn": false }, { "number": 2, "description": "Signature of administrator 2", "signedName": "Admin Elements", "signDate": new Date("2020-08-05T14:51:15.753"), "isTurn": false }, { "number": 3, "description": "admin 3", "signedName": " ", "signDate": null, "isTurn": true }, { "number": 4, "description": "2", "signedName": " ", "signDate": null, "isTurn": false }],
    //     images: [{ "drawingId": "cc7030b7-1c2a-4917-a747-38340c709dce", "url": "https://elementstorage.blob.core.windows.net/attachment/637387834710504197_test.png", "name": "test.png" }],
    //     dateComplete: new Date(),
    // }
];

export class MockDetailPreservationTabApi {
    public getDetailData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            items: <DetailPreservationTabModel[]>[...detailPreservationData]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}

//--- Element Preservation Info

let elementPreservationModel: UpdatePreservationElementModel = { "id": "3fa546b4-3c63-4cbb-824e-5abec253f242", "elementNo": "PE-0003", "task": "abcdefghik0123456789012345678901234567890123456789123", "description": "Description", "type": "Initial", "frequencyInWeeks": null }
export class MockElementPreservationInfoApi {
    public getInfoData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            items: <UpdatePreservationElementModel[]>[elementPreservationModel]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}

//--- Preservation Signatures

let preservationSignature = [
    { "id": "f355270f-88b8-4efc-81d5-16c96a0cc171", "authorizationId": "1", "number": 1, "description": "Administrator 1", "roleId": 5, isDeleted: false, isUpdated:false },
    { "id": "81f0c1e9-503d-47e6-9cb4-88a7f866676e", "authorizationId": "2", "number": 1, "description": "Signature of Approver",  "roleId": 5, isDeleted: false, isUpdated:false },
]

export class MockPreservationSignatureApi {
    public getSignatureData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            items: [...preservationSignature]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}