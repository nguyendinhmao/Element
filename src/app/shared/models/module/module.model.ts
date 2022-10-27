export class ModuleByUserModel {
    moduleId: number;
    moduleName: string;
    moduleKey: string;
    sortOrder: number;
    defaultProjectId: string;
    projectName: string;
    projectKey: string;
    logoProject: string;
    moduleDefault: boolean;
    companyId: string;
}

export class ModuleProjectDefaultModel {
    moduleId: number;
    moduleName: string;
    moduleKey: string;
    defaultProjectId: string;
    projectName: string;
    projectKey: string;
    logoProject: string;
    companyId: string;
}