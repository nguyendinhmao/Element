import { Observable } from 'rxjs';
import { ApiListResponse } from '../models/api-response/api-response';
import { MilestonesProjectSettingsModel } from '../models/project-settings/project-settings.model';
import { ProjectUserModel } from '../models/project-settings/project-user.model';

//--- Milestones ---
let milestonesDatas: MilestonesProjectSettingsModel[] = [
    { milestoneId: 1, milestoneVal: "Mechanical Completion", milestoneCheck: true },
    { milestoneId: 2, milestoneVal: "Static Commissioning", milestoneCheck: true },
    { milestoneId: 3, milestoneVal: "Dynamic Commissioning", milestoneCheck: false },
    { milestoneId: 4, milestoneVal: "Milestone 4", milestoneCheck: true },
    { milestoneId: 5, milestoneVal: "Milestone 5", milestoneCheck: false },
]

export class MockMilestonesProjectSettingsApi {
    public getMilestonesProjectSettingData = (): Observable<ApiListResponse> => {
        let response = <ApiListResponse>{
            status: 1,
            message: '',
            content: <MilestonesProjectSettingsModel[]>[...milestonesDatas]
        };
        return Observable.create(observer => {
            observer.next(response);
            observer.complete();
        });
    }
}

//--- Project User
// let projectUserDatas: ProjectUserModel[] = [
//     { projectUserId: 1, userName: "Robert", role: 'Administrator' },
//     { projectUserId: 2, userName: "Mao Nguyen", role: 'Viewer' },
// ]

// export class MockProjectUserApi {
//     public getProjectUserData = (): Observable<ApiListResponse> => {
//         let response = <ApiListResponse>{
//             status: 1,
//             message: '',
//             content: <ProjectUserModel[]>[...projectUserDatas]
//         };
//         return Observable.create(observer => {
//             observer.next(response);
//             observer.complete();
//         });
//     }
// }