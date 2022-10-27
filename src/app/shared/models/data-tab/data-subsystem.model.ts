export class DataSubSystemModel {
  subSystemId: string;
  description: string;
  subsystemNo: string;
  systemId: string;
  systemNo: string;
}

export class UpdateSubSystemModel {
  subSystemId: string;
  description: string;
  subsystemNo: string;
  systemId: string;
  systemNo: string;
}
export class CreateSubSystemModel {
  description: string;
  subsystemNo: string;
  systemId: string;
}
export class SubSystemLookUpModel {
  id: string;
  value: string;
  project: string;
  systemId?: string;
}
