// import { Observable } from 'rxjs';
// import { ApiListResponse, ApiResponse } from '../models/api-response/api-response';
// import { ProjectManagementModel } from '../models/project-management/project-management.model';

// let projectManagementData: ProjectManagementModel[] = [
//     { projectId: 1, projectName: 'Oil Rig', projectKey: 'OR', projectLead: 'Robert', company: 'ROC', status: 'Active', category: 'Internal' },
//     { projectId: 2, projectName: 'Project 2', projectKey: 'P2', projectLead: 'User 2', company: 'BMBSoft', status: 'InActive', category: 'Internal' },
//     { projectId: 3, projectName: 'Project 3', projectKey: 'P3', projectLead: 'User 3', company: 'ROC', status: 'Active', category: 'Internal' },
//     { projectId: 4, projectName: 'Project 4', projectKey: 'P4', projectLead: 'User 4', company: 'BMBSoft', status: 'Active', category: 'Internal' },
//     { projectId: 5, projectName: 'Project 5', projectKey: 'P5', projectLead: 'User 5', company: 'ROC', status: 'InActive', category: 'Internal' },

//     { projectId: 6, projectName: 'Project 6', projectKey: 'P6', projectLead: 'User 6', company: 'BMBSoft', status: 'Active', category: 'Internal' },
//     { projectId: 7, projectName: 'Project 7', projectKey: 'P7', projectLead: 'User 7', company: 'ROC', status: 'InActive', category: 'Internal' },
//     { projectId: 8, projectName: 'Project 8', projectKey: 'P8', projectLead: 'User 8', company: 'BMBSoft', status: 'Active', category: 'Internal' },
//     { projectId: 9, projectName: 'Project 9', projectKey: 'P9', projectLead: 'User 9', company: 'ROC', status: 'InActive', category: 'Internal' },
//     { projectId: 10, projectName: 'Project 10', projectKey: 'P10', projectLead: 'User 10', company: 'BMBSoft', status: 'Active', category: 'Internal' },
// ];

// export class MockProjectManagementApi {
//     public getProjectManagementData = (): Observable<ApiListResponse> => {
//         let response = <ApiListResponse>{
//             status: 1,
//             message: '',
//             content: <ProjectManagementModel[]>[...projectManagementData]
//         };
//         return Observable.create(observer => {
//             observer.next(response);
//             observer.complete();
//         });
//     }

//     public getProjectByProjectKey = (projectKey: string): Observable<ApiResponse> => {
//         let data = projectManagementData.find((b) => b.projectKey == projectKey);
//         let response = <ApiResponse>{
//             status: 1,
//             message: '',
//             content: <ProjectManagementModel>{ ...data }
//         };
//         return Observable.create(observer => {
//             observer.next(response);
//             observer.complete();
//         });
//     }
// }