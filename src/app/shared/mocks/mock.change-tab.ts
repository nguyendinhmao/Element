// import { Observable } from 'rxjs';
// import { ApiListResponse } from '../models/api-response/api-response';
// import { ChangeTabModel } from '../models/change-tab/change-tab.model';

// let changeTabData: ChangeTabModel[] = [
//     { changeId: 1, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 2, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 3, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 4, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 5, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 6, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 7, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 8, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 9, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 10, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 11, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 12, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 13, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 14, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 15, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 16, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 17, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 18, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 19, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
//     { changeId: 20, changeType: '', changeTitle: '', approvalStatus: '', changeStatus: '', stage: '', system: '', subSystem: '', workpack: '', jobCard: '', signOff1: '', signOff2: '', signOff3: '' },
// ];

// export class MockChangeTabApi {
//     public getChangeTabData = (): Observable<ApiListResponse> => {
//         let response = <ApiListResponse>{
//             status: 1,
//             message: '',
//             content: <ChangeTabModel[]>[...changeTabData]
//         };
//         return Observable.create(observer => {
//             observer.next(response);
//             observer.complete();
//         });
//     }
// }