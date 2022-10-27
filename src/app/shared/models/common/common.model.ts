export class CompanyLookUpModel {
  id: number;
  value: string;
  photoUrl: string;
}
export class LookUpModel {
  id: string;
  value: string;
}

export const StoreNames = {
  tags: 'Tags',
  punches: 'Punches',
  changes: 'Changes',
  preservation: 'Preservation',
  tagPreservation: 'TagPreservation',
  itrs: 'Itrs',
  records: 'RecordDetail',
  lookups: 'LookUpData',
  punchSignatureTemplate: 'PunchSignatureTemplate',
  drawings: 'Drawings',
  handovers: 'Handovers'
}

export const IndexRelatedSNs = {
  tags: { tagId: 'tagId' },
  punches: { tagId: 'tagId' },
  changes: null,
  preservation: {
    tagNo: 'tagNo',
    tagId: 'tagId',
  },
  itrs: null,
  records: { tagId: 'fieldData.tagId' },
  lookups: null,
  punchSignatureTemplate: null,
  drawings: null,
  handovers: { handoverId: 'handoverId' },
  tagPreservation: {
    tagId: 'tagId',
    tagNo: 'tagNo',
  },
}

export const ReloadPageKey = {
  tag: 'TAG',
  preservation: 'PRESERVATION',
  milestones: 'MILESTONE',
}

export class ResponseSyncItem {
  id: string;
  no: string;
  isCompleted: boolean;
  error: string;

  constructor(id: string, no: string, isCompleted = false, error = '') {
    this.id = id;
    this.no = no;
    this.isCompleted = isCompleted;
    this.error = error;
  }
}

export interface SyncResponse {
  syncHandovers: ResponseSyncItem[];
  syncPreservation: ResponseSyncItem[];
  syncPunches: ResponseSyncItem[];
  syncTags: ResponseSyncItem[];
}

export const ResponseKeys = {
  tags: 'syncTags',
  punches: 'syncPunches',
  milestones: 'syncHandovers',
  preservation: 'syncPreservation',
}

export class LoadingSelectionModel {
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

export module StatusColor {
  export const REJECTED = 'badge-warning';
  export const APPROVED = 'badge-info';
  export const COMPLETE = 'badge-success';
  export const DONE = 'badge-success';
  export const DELETED = 'badge-danger';
  export const SUBMITTED = 'badge-primary';
  export const DRAFT = 'badge-secondary';
  export const CLOSED = 'badge-dark';
}

export module StatusDisplay {
  export const Rejected = 'Rejected';
  export const Inprogress = 'In Progress';
  export const Completed = 'Completed';
  export const Ready = 'Ready';
  export const Waiting = 'Waiting';
  export const NotStarted = 'Not Started';
  export const ConditionallyAccepted = 'Conditionally Accepted';
}

export class Signature {
  description: string;
  number: number;
  signedName: string;
  signDate: Date;
  isTurn: boolean = false;
}

export const TypeDownloadRequest = {
  tags: 'TAGS',
  milestones: 'MILESTONES',
  preservation: 'PRESERVATION',
  all: 'ALL',
}

export interface ItemNeedSync {
  id: string;
  isChanged: boolean;
  type: string;
}

export const TypeDownloadAndSync = {
  downloaded: 'DOWNLOADED',
  syncFailed: 'SYNCFAILED',
  syncSuccessful: 'SYNCSUCCESSFUL',
  removed: 'REMOVED',
  synchronizing: 'SYNCHRONIZING',
  reverting: 'REVERTING',
}


