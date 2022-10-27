export class UpdateProjectSignatureModel {
    projectId: string
    projectKey: string;
    projectSignatures: ProjectSignatureItem[]
}
export class ProjectSignatureItem {
    number: number;
    id: string;
    description: string;
    roleId: number;
    isDeleted: boolean;
    isUpdated: boolean;
    authorizationId: number;
}