export class DataWorkpackModel {
  workPackId: string;
  workPackName: string;
  workPackNo: string;
  disciplineId: string;
  disciplineCode: string;
}
export class UpdateWorkpackModel {
  workPackId: string;
  workPackNo: string;
  workPackName: string;
  disciplineId: string;
  disciplineCode: string;
}
export class CreateWorkpackModel {
  projectId: string;
  workPackNo: string;
  workPackName: string;
  disciplineId: string;
  disciplineCode: string;
}
export class WorkPackLookUpModel {
  id: string;
  value: string;
}
