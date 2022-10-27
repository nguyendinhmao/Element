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
  projectKey: string;
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
  isSubmit: boolean;

  systemId: string;
  type: string;
  subSystemId: string;
}

export class UpdatePunchItemModel {
  projectKey: string;
  punchId: string;
  punchNo: string;
  description: string;
  correctiveAction: string;
  category: string;
  tagId: string;
  locationId: string;
  locationCode?: string;
  disciplineId: string;
  orderId: string;
  punchTypeId: string;
  materialsRequired: boolean;
  drawings: DrawingLookUpModel[] = [];
  drawingIds: string[] = [];
  isSubmit: boolean;
  images: ImageLookUp[] = [];
  deleteImages: ImageLookUp[] = [];
  systemId: string;
  type: string;
  subSystemId: string;
}

export class DisciplineLookUpPunchPage {
  id: string;
  value: string;
  descriptions: DescriptionStandard[] = [];
}


export class DescriptionStandard {
  description: string;
  correctiveActions: CorrectiveActions[] = [];
}

export class CorrectiveActions {
  correctiveAction: string;
  category: string;
}

export class Category {
  category: string;
}

export class DrawingLookUpModel {
  drawingId: string;
  drawingNo: string;
  isLocationDrawing: boolean;
  isAdded: boolean = false;
  isDeleted: boolean = false;
  fileName?: string;
  url?: string;
}

export class TagLookUpPunchPageModel {
  id: string;
  value: string;
  systemId: string;
  systemNo: string;
  subSystemId: string;
  subSystemNo: string;
  disciplineId: string;
  disciplineCode: string;
}

export class Signature {
  description: string;
  number: number;
  signedName: string;
  signDate: Date;
  isTurn: boolean = false;
  authorizationLevel?: number;
}

export class PunchPageListModel {
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
  drawings: DrawingLookUpModel[] = [];
  drawingIds: string[] = [];
  orderId: string;
  orderNo: string;
  locationId: string;
  locationCode: string;
  jobCard: string;
  raisedBy: string;
  raisedById?: string;
  status: string;
  statusId?: number;
  numberSigned: number;
  totalSignatures: number;
  signatures: Signature[];
  images: ImageLookUp[] = [];
  rejectReason: string;
  isAdded?: boolean;
  isEdited?: boolean;
  inSignOff?: boolean;
  isDeleted?: boolean;
}

export class PunchPageSearchModel {
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
  materialsRequired?: boolean;
  drawings: DrawingLookUpModel[] = [];
  orderId: string;
  orderNo: string;
  locationId: string;
  locationCode: string;
  raisedBy: string;
  status: string;
  signatures: number;
  rejectReason: string;
}


export class CounterUserPunchesModel {
  unSubmittedPunches: number;
  submittedPunches: number;
  needMySignaturePunches: number;
}

export class LookUpFilterModel {
  value: string;
  label: string;
}

export class ImageLookUp {
  drawingId: string;
  name: string;
  url: string;
  base64?: string;
}

export const ImageBase64Helper = {
  prefix: "data:image/png;base64,",
  regexPattern: /^data:.+;base64,/,
}