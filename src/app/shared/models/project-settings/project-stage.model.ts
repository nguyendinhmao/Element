export class UpdateProjectStageModel {
    projectKey: string;
    projectStages: ProjectStageItem[]
}
export class ProjectStageItem {
    number: number;
    id: string;
    description: string;
    roleId: number;
    isDeleted: boolean;
    isUpdated: boolean;
    authorizationId: number;
}