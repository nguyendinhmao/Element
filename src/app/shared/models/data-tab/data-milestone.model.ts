export class MilestoneLookUpModel {
  id: string;
  value: string;
}

export class DataMilestoneModel {
  milestoneId: string;
  milestoneName: string;
  description: string;
  projectId: string;
  projectKey: string;
  phase: string;
  dateStartPlanned: string;
  dateEndPlanned: string;
  dateStartActual: string;
  dateEndActual: string;
  dtStartPlanned: Date;
  dtEndPlanned: Date;
  dtStartActual: Date;
  dtEndActual: Date;
}
export class UpdateMilestoneModel {
  milestoneId: string;
  milestoneName: string;
  description: string;
  projectId: string;
  projectKey: string;
  phase: string;
  dateStartPlanned: string;
  dateEndPlanned: string;
  dateStartActual: string;
  dateEndActual: string;
  dtStartPlanned: Date;
  dtEndPlanned: Date;
  dtStartActual: Date;
  dtEndActual: Date;
}
export class CreateMilestoneModel {
  milestoneName: string;
  description: string;
  projectId: string;
  projectKey: string;
  phase: string;
  dateStartPlanned: string;
  dateEndPlanned: string;
  dateStartActual: string;
  dateEndActual: string;
  dtStartPlanned: Date;
  dtEndPlanned: Date;
  dtStartActual: Date;
  dtEndActual: Date;
}
