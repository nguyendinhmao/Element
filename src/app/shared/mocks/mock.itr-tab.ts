import { Observable } from 'rxjs';
import { ApiListResponse } from '../models/api-response/api-response';
import { ITRAdminModel } from '../models/itr-tab/itr-admin.model';
import { ITRAllocationModel } from '../models/itr-tab/itr-allocation.model';
import { EquipmentLookUpModel } from '../models/equipment/equipment.model';
import { PreservationAllocationDetailModel, PreservationAllocationModel, PreservationEquipmentAllocate } from '../models/itr-tab/preservation-allocation.model';
// import { ITRAllocationDetailModel } from '../models/itr-tab/itr-allocation-detail.model';

// // let itrAdminData: ITRAdminModel[] = [
// //     { itrId: "1", itrNo: 'E01', description: 'LV Cable Test', type: 'A', disciplineId: 'Electrical', noOfSignatures: 2, milestoneId: 'Mechanical Completion' },
// //     { itrId: "2", itrNo: 'E02', description: 'HV Cable Test', type: 'A', disciplineId: 'Electrical', noOfSignatures: 2, milestoneId: 'Mechanical Completion' },
// //     { itrId: "3", itrNo: 'E03', description: 'Cable Rack Installation', type: 'A', disciplineId: 'Electrical', noOfSignatures: 2, milestoneId: 'Mechanical Completion' },
// //     { itrId: "4", itrNo: 'E04', description: 'Panel Installation', type: 'A', disciplineId: 'Electrical', noOfSignatures: 2, milestoneId: 'Mechanical Completion' },
// //     { itrId: "5", itrNo: 'E05', description: 'ACB/VCB Function Test', type: 'A', disciplineId: 'Electrical', noOfSignatures: 2, milestoneId: 'Mechanical Completion' },
// //     { itrId: "6", itrNo: 'E06', description: 'Pressure Test', type: 'A', disciplineId: 'Electrical', noOfSignatures: 2, milestoneId: 'Mechanical Completion' },
// // ];

// // export class MockITRAdminApi {
// //     public getITRTabData = (): Observable<ApiListResponse> => {
// //         let response = <ApiListResponse>{
// //             status: 1,
// //             message: '',
// //             content: <ITRAdminModel[]>[...itrAdminData]
// //         };
// //         return Observable.create(observer => {
// //             observer.next(response);
// //             observer.complete();
// //         });
// //     }
// // }

// let itrAllocationData: ITRAllocationModel[] = [
//     { equipmentTypeId: 1, equipmentTypeCode: 'ACB', description: 'Air Circuit Breaker', noOfAssociatedTags: 1 },
//     { equipmentTypeId: 2, equipmentTypeCode: 'COP', description: 'Corrosion Probe', noOfAssociatedTags: 2 },
//     { equipmentTypeId: 3, equipmentTypeCode: 'CIT', description: 'LV Cable Test', noOfAssociatedTags: 3 },
//     { equipmentTypeId: 4, equipmentTypeCode: 'FIT', description: 'LV Cable Test', noOfAssociatedTags: 4 },
//     { equipmentTypeId: 5, equipmentTypeCode: 'FZIT', description: 'LV Cable Test', noOfAssociatedTags: 5 },
//     { equipmentTypeId: 6, equipmentTypeCode: 'LIT', description: 'LV Cable Test', noOfAssociatedTags: 6 },
// ];

// export class MockITRAllocationApi {
//     public getITRTabData = (): Observable<ApiListResponse> => {
//         let response = <ApiListResponse>{
//             status: 1,
//             message: '',
//             content: <ITRAllocationModel[]>[...itrAllocationData]
//         };
//         return Observable.create(observer => {
//             observer.next(response);
//             observer.complete();
//         });
//     }
// }

let equipmentData: PreservationAllocationModel = {"equipmentTypeId":"8487912b-0978-4520-b496-0c19c241b905","equipmentTypeCode":"EQ003","description":"des3fdgffd","noOfAssociatedTags":0};

export class MockEquipmentApi {
    public getEquimentCode = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            items: <PreservationAllocationModel[]>[equipmentData]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}

let presAllocationDetailData: PreservationEquipmentAllocate[] = [
    { preservationElementId: "1", elementNo: 'I01', description: 'Instrument Cable Test',status:'', isAllocated: true, isPause: true, isStop: false },
    { preservationElementId: "2", elementNo: 'I02', description: 'Instrument Loop Check',status:'', isAllocated: true, isPause: true, isStop: true },
    { preservationElementId: "3", elementNo: 'I03', description: 'Cause and Effect',status:'', isAllocated: true, isPause: false, isStop: false },
    { preservationElementId: "4", elementNo: 'E01', description: 'LV Cable Test',status:'', isAllocated: false, isPause: false, isStop: false },
    { preservationElementId: "5", elementNo: 'E02', description: 'HV Cable Test',status:'', isAllocated: false, isPause: true, isStop: false },
    { preservationElementId: "6", elementNo: 'E03', description: 'Cable Rack Installation',status:'', isAllocated: false, isPause: true, isStop: false },
];

export class MockPreservationAllocationDetailApi {
    public getPresAllocationDetailData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            items: <PreservationEquipmentAllocate[]>[...presAllocationDetailData]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}


let itrAllocationData: PreservationAllocationModel[] = [
    { equipmentTypeId: '1', equipmentTypeCode: 'ACB', description: 'Air Circuit Breaker', noOfAssociatedTags: 1 },
    { equipmentTypeId: '2', equipmentTypeCode: 'COP', description: 'Corrosion Probe', noOfAssociatedTags: 2 },
    { equipmentTypeId: '3', equipmentTypeCode: 'CIT', description: 'LV Cable Test', noOfAssociatedTags: 3 },
    { equipmentTypeId: '4', equipmentTypeCode: 'FIT', description: 'LV Cable Test', noOfAssociatedTags: 4 },
    { equipmentTypeId: '5', equipmentTypeCode: 'FZIT', description: 'LV Cable Test', noOfAssociatedTags: 5 },
    { equipmentTypeId: '6', equipmentTypeCode: 'LIT', description: 'LV Cable Test', noOfAssociatedTags: 6 },
];

export class MockPreservationAllocationApi {
    public getITRTabData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            items: <PreservationAllocationModel[]>[...itrAllocationData]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}