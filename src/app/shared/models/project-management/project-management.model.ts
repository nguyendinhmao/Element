export class ProjectManagementModel {
  moduleId: number;
  id: string;
  name: string;
  key: string;
  companyName: string;
  status: string;
  projectLogo: string;
  companyLogo: string;
  asset: string;
  punchSignatureCount: number;
}

export class ProjectCreationModel {
  projectName: string;
  projectKey: string;
  companyId: string;
  projectStatusId: number;
  moduleId: number;
  asset: string;
}

export class ProjectUpdatingModel {
  id: string;
  projectName: string;
  projectKey: string;
  companyId: string;
  projectStatusId: number;
  projectLogoUrl: string;
  moduleId: number;
  asset: string;
  isAdminProject: boolean;
  authLevel: number;
  companyName?: string;
}

export class ProjectStatusModel {
  id: any;
  value: string;
}

export class ProjectByUserAndModuleModel {
  userId: string;
  moduleId: number;
  projectName: string;
  projectId: string;
  projectKey: string;
  logoProject: string;
  companyId: string;
}
export class ProjectLookupModel {
  id: string;
  value: string;
  key: string;
}

export class AuthInProjectDto {
  code: string;
  description: string;
  status: boolean;
}

export class ManagerInProject {
  isAdminProject: boolean;
}

export class AuthSignInProjectModel {
  authLevel: number;
}

export class CompanyInfoModel {
  companyName: string;
}