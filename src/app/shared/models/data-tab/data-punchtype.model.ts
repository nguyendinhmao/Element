export class DataPunchTypeModel {
  punchTypeId: string;
  type: string;
  description: string;
}
export class UpdatePunchTypeModel {
  punchTypeId: string;
  type: string;
  description: string;
}
export class CreatePunchTypeModel {
  projectId: string;
  type: string;
  description: string;
}
export class PunchTypeLookUpModel {
  id: string;
  value: string;
}
