export class PreservationModel {
  tagId: string;
  tagNo: string;
  tagName: string;
  system: string;
  subSystem: string;
  locationCode: string;
  discipline: string;
  equipmentType: string;
  status: string;
  preservationStatusString?: string;
  preservationLocked?: boolean;
  preservationLockedBy?: string;
  preservationLockedDate?: string;
}

export const PreservationStatusEnum = {
  INACTIVE: 1,
  STOPPED: 2,
  COMPLETED: 3,
  PAUSED: 4,
  ACTIVE: 5,
  NOTDUE: 6,
  DUE: 7,
  OVERDUE: 8,
}

export const TagPreservationStatusEnum = {
  INACTIVE: 1,
  NOTDUE: 2,
  COMPLETED: 3,
  PAUSED: 4,
  STOPPED: 5,
  DUE: 6,
  OVERDUE: 7,
}

export const SortExpression = {
  'tagNo': 'tagNo',
  'description': 'tagName',
  'systemNo': 'system',
  'subSystemNo': 'subSystem',
  'location': 'locationCode',
  'discipline': 'discipline',
  'equipmentTypePresTab': 'equipmentType',
  'status': 'preservationStatus',
}

export module PreservationStatus {
  export const OVERDUE = 'Overdue';
  export const DUE = 'Due';
  export const PAUSED = 'Paused';
  export const COMPLETED = 'Completed';
  export const NOTDUE = 'Not Due';
  export const NOTDUE4Value = 'NOTDUE';
  export const INACTIVE = 'Inactive';
  export const STOPPED = 'Stopped';
}

export module PreservationStatusColor {
  export const DUE = 'badge-primary';
  export const OVERDUE = 'badge-danger';
  export const NOTDUE = 'badge-info';
  export const PAUSED = 'badge-warning';
  // export const APPROVED = 'badge-info';
  export const COMPLETED = 'badge-success';
  export const INACTIVE = 'badge-secondary';
  export const STOPPED = 'badge-secondary';
  export const SUBMITTED = 'badge-primary';
  export const DRAFT = 'badge-secondary';
  export const CLOSED = 'badge-dark';
}

export class DetailPreservationTabModel {
  preservationId: string;
  element: string;
  preservationNo: string;
  frequency: string;
  type: string;
  dateDue: Date;
  status: string;
  statusId?: number;
  isPause: boolean;
  isStop: boolean;
  signatures: SignaturePres[];
  images: ImageLookUpPres[];
  dateComplete: Date;
  isAllocated: boolean;
  haltedBy?: string;
  haltedDate?: Date;
  comment?: string;
  preservationElement?: PreservationElementInfo;
  isDeleted?: boolean;
  isUpdated?: boolean;
  tagId?: string;
  tagNo?: string;
  recheckStatusF?: any;

  constructor() {
    this.preservationId = null;
    this.element = null;
    this.preservationNo = '';
    this.frequency = null;
    this.type = null;
    this.dateDue = null;
    this.status = null;
    this.statusId = null;
    this.isPause = false;
    this.isStop = false;
    this.signatures = new Array();
    this.images = new Array();
    this.dateComplete = null;
    this.isAllocated = false;
    this.haltedBy = null;
    this.haltedDate = null;
    this.comment = '';
    this.preservationElement = null;
    this.isDeleted = false;
    this.isUpdated = false;
  }
}

export class SignaturePres {
  description: string;
  number: number;
  signedName: string;
  signDate: Date;
  isTurn: boolean = false;
  authorizationLevel?: number;
  signUserId?: string;
}

export class ImageLookUpPres {
  drawingId: string;
  name: string;
  url: string;
  base64?: string;
}

export class ElementPresTabStatusCommand {
  preservationIds: string[];
  projectKey: string;
  comments?: string;
  dateDue?: string;
}

export class ElementPresTabUpdateImagesCommand {
  projectKey: string;
  equipmentCode: string;
  elementsUpdated: string[];
  comments: string;
}

export class ElementPresTabNewCommand {
  preservationElementId: string;
  tagNo: string;
  projectKey: string;
}

export class AddCommentPresInfoCommand {
  preservationId: string;
  comment: string;
  projectKey: string;
}

export class DeleteCommentPresInfoCommand {
  projectKey: string;
  preservationId: string;
  commentId: string;
}

export class ElementCreationModel {
  id: string;
  value: string;
}

export class PreservationElementInfo {
  id: string;
  task: string;
  type: string;
  description: string;
  elementNo: string;
  frequencyInWeeks: number;
  comments?: CommentPreservation[];

  constructor() {
    this.comments = new Array<CommentPreservation>();
  }
}

export class CommentPreservation {
  id: string;
  content: string;
  createdDate: Date;
  user: string;
  canDelete: boolean;
}

export class PreservationElementImagesCommand {
  preservationId: string;
  deleteImages: ImageLookUpPres[];
  projectKey: string;
}

export class TagPreservationFilter {
  id: string;
  value: string;
}

export class SignOffPreservationCommand {
  preservationId: string;
  projectKey: string;
  pinCode?: string;
  username?: string;
  password?: string;
  isDifferentUser?: boolean;
}