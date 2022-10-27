export class ProjectSettingsModel {
  projectId: number;
  projectName: string;
  projectKey: string;
  isProjectExist: boolean;
  projectLogoUrl: string;
  companyId: string;
}

export class MilestonesProjectSettingsModel {
  milestoneId: number;
  milestoneVal: string;
  milestoneCheck: boolean;
}
