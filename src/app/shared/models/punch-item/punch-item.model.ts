export class PunchItemModel {
  punchItemNo: string;
  tagNo: string;
  punchItemDescription: string;
  system: string;
  subSystem: string;
  discipline: string;
  category: string;
  raisedBy: string;
  drawings: string;
  materialOrderNo: string;
  materialStatus: string;
  workPack: string;
  jobCard: string;
  status: string;
}

export class LoadingSelectionPunchModel {
  isLoadingTag: boolean;
  isLoadingSystem: boolean;
  isLoadingSubSystem: boolean;
  isLoadingDiscipline: boolean;
  isLoadingDescription: boolean;
  isLoadingCorrectiveAction: boolean;
  isLoadingCategory: boolean;
  isLoadingType: boolean;
  isLoadingMaterialsRequired: boolean;
  isLoadingOrderNo: boolean;
  isLoadingLocation: boolean;
  isLoadingDrawing: boolean;
}

export enum SelectionControlName {
  tag = "TAG",
  system = "SYSTEM",
  subSystem = "SUB_SYSTEM",
  discipline = "DISCIPLINE",
  description = "DESCRIPTION",
  correctiveAction = "CORRECTIVE_ACTION",
  category = "CATEGORY",
  type = "TYPE",
  materialsRequired = "MATERIALS_REQUIRED",
  orderNo = "ORDER_NO",
  location = "LOCATION",
  drawing = "DRAWING",
}

export class CreatePunchItemModel {
  description: string;
  correctiveAction: string;
  category: string;
  tagId: string;
  locationId: string;
  disciplineId: string;
  orderId: string;
  punchTypeId: string;
  materialsRequired: boolean;
  drawingIds: string[] = [];
  images: string[] = [];
  isSubmit: boolean;
}

export class UpdatePunchItemModel {
  punchId: string;
  description: string;
  correctiveAction: string;
  category: string;
  tagId: string;
  locationId: string;
  disciplineId: string;
  orderId: string;
  punchTypeId: string;
  materialsRequired: boolean;
  drawingIds: DrawingLookUp[] = [];
  images: string[] = [];
  isSubmit: boolean;
}

export class DisciplineLookUpPunchPage {
  id: string;
  value: string;
  descriptions: DescriptionStandard[] = [];
}

export class DescriptionStandard {
  description: string;
  CorrectiveActions: CorrectiveActions[] = [];
}

export class CorrectiveActions {
  correctiveAction: string;
  category: string;
}

export class DrawingLookUp {
  drawingId: string;
  drawingNo: string;
  isLocationDrawing: boolean;
  isAdded: boolean = false;
  isDeleted: boolean = false;
}

export class TagLookUpPunchPage {
  id: string;
  value: string;
  systemId: string;
  systemNo: string;
  subSystemId: string;
  subSystemNo: string;
  disciplineId: string;
  disciplineCode: string;
}

class PunchPageListModel {
  punchId: string;
  punchNo: string;
  tagId: string;
  tagNo: string;
  description: string;
  correctiveAction: string;
  systemId: string;
  systemNo: string;
  subSystemId: string;
  subSystemNo: string;
  disciplineId: string;
  disciplineCode: string;
  category: string;
  punchTypeId: string;
  type: string;
  materialsRequired: boolean;
  drawings: DrawingLookUp[] = [];
  orderId: string;
  orderNo: string;
  locationId: string;
  locationCode: string;
  raisedBy: string;
  status: string;
  signatures: number;
}

export const KeyLookups = {
  disciplineLookUp: "disciplineLookUp",
  drawingLookup: "drawingLookup",
  locationLookup: "locationLookup",
  orderLookup: "orderLookup",
  punchTypeLookup: "punchTypeLookup",
  subSystemLookup: "subSystemLookup",
  systemLookup: "systemLookup",
  tagLookUpPunchPage: "tagLookUpPunchPage",
  pinCode: "pinCode",
  userDownloadLookup: "userDownloadLookup",
  preservationElements: "preservationElements",
  preservationSignatureTemplate: "preservationSignatureTemplate",
}

export const PunchStatuses = {
  draft: "DRAFT",
  rejected: "REJECTED",
  done: "DONE",
  submitted: "SUBMITTED",
  approved: "APPROVED",
  deleted: "DELETED",
  closed: "CLOSED",
}

export const PunchStatusIds = {
  rejected: 1,
  approved: 2,
  done: 3,
  deleted: 4,
  submitted: 5,
  draft: 6,
  closed: 7,
}

export const KeyValues = {
  tagNo: 'tagNo',
  punchNo: 'punchNo',
  subSystemNo: "subSystemNo",
  systemNo: "systemNo",
  orderNo: "orderNo",
  locationCode: "locationCode",
  disciplineCode: "disciplineCode",
  type: "type",
}