import { DrawingLookUpModel } from "../punch-page/punch-page.model";

export class DataTagNoModel {
  tagId: string;
  tagNo: string;
  tagName: string;
  equipmentType: string;
  tagType: string;
  system: string;
  subSystem: string;
  workPackNo: string;
  parent: string;
  locationCode: string;
  discipline: string;
  project: string;
  status: boolean;
  locationId: string;
  workPackId: string;
  equipmentTypeId: string;
  disciplineId: string;
  systemId: string;
  subSystemId: string;
  parentId: string;
  referenceId: string;
  referenceTypeId: number;
  jobCardLookUpValueModels: JobCardLookUpValueModel[] = [];
  locked?: boolean;
  lockedBy?: string;
  lockedDate?: string;
  tabSideMenu?: object;
  drawings?: DrawingLookUpModel[];
  isChanged?: boolean;
}

export class JobCardLookUpValueModel {
  id: number;
  value: string;
  workPackNo: string;
}

export class UpdateTagNoModel {
  tagId: string;
  tagNo: string;
  tagTypeName: string;
  tagName: string;
  locationId: string;
  subSystemId: string;
  workPackId: string;
  equipmentTypeId: string;
  parent: string;
  status: boolean;
  systemId: string;
  tagType: string;
  projectId: string;
  projectKey: string;
  disciplineId: string;

  drawings: DrawingLookUpModel[] = [];
  drawingIds: string[] = [];
}
export class CreateTagNoModel {
  tagNo: string;
  tagTypeName: string;
  tagName: string;
  locationId: string;
  subSystemId: string;
  workPackId: string;
  equipmentTypeId: string;
  parent: string;
  status: boolean;
  systemId: string;
  tagType: string;
  projectId: string;
  projectKey: string;
  disciplineId: string;
  drawingIds: string[] = [];
}

export class TagLookUpModel {
  id: string;
  value: string;
}

export class DrawingLookUpModel2 {
  id: string;
  value: string;
}
