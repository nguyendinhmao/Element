

export class ProjectLevelListItem {
  levelId: number;
  projectLevelId?: string;
  levelValue: string;
  levelName: string;
  isDelete: boolean;
}

export class ProjectLevelUpdationItem {
  levelId: number;
  projectLevelId?: string;
  levelValue: string;
  isDelete: boolean;
}

export class ProjectLevelUpdationModel {
  projectId: string;
  projectLevels: ProjectLevelUpdationItem[]
}
