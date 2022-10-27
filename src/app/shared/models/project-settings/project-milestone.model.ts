

export class ProjectMilestoneSetuptList {
  id: string;
  milestoneName: string;
  milestoneId: string;
  haveSystemHO: boolean;
  haveSubSystemHO: boolean;
  walkDownSignatures: MilestoneSignature[];
  milestoneSignatures: MilestoneSignature[];
  itrType: string;
  punchCategory: string;
}

export class MilestoneSignature {
  id: string;
  authorizationId: string;
  number: number;
  description: string;
  milestoneId: string;
}

export class ProjectMilestoneUpdationModel {
  projectKey: string;
  walkDownSignatures: MilestoneSignature[];
  milestoneSignatures: MilestoneSignature[];
  projectMileStones: ProjectMilestoneSetuptList[];
}

export class ProjectMilestoneModel {
  id: string;
  milestoneId: string;
  isUpdated: boolean = false;
  isDeleted: boolean = false;
  itrType: string;
  punchCategory: string;
}

