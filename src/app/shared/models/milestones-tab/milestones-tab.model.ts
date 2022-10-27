import { DisciplineLookUpPunchPage } from "../punch-page/punch-page.model";
import { HandoverDetail } from "./handover.model";

export class MilestonesTabModel {
  dateEndActual: Date;
  dateEndPlanned: Date;
  dateStartActual: Date;
  dateStartPlanned: Date;
  description: string;
  handoverId: string;
  handoverNo: string;
  milestoneName: string;
  milestoneId?: string;
  osChanges: number;
  osPunches: number;
  osRecords: number;
  subSystemId?: string;
  subSystemNo: string;
  systemId?: string;
  systemNo: string;
  type: string;
  updateBy: string;
  walkDownComplete: boolean;
  walkDownCompleteDate: Date;
  walkDownSignatures: Array<WalkdownSignature>;
  walkDownStatus?: number;
  remarks: Array<string>;
  handoverRecordId?: string;
  comments?: string;
  conditionalAcceptance?: boolean;
  disciplines?: DisciplineLookUpPunchPage[];
  locked?: boolean;
  lockedBy?: string;
  lockedDate?: string;
  tagsRelated?: MilestoneTags[];
  recordHandover?: HandoverDetail;
  status?: string;
  statusId?: number;
  isInitialHO?: boolean;
  isAddNew?: boolean;
  isChanged?: boolean;
}

export class WalkdownSignature {
  number: number;
  description: string;
  signedName: string;
  signDate: any;
  isTurn: boolean;
  authorizationLevel: number;
  signUserId: string;
}

export class UpdateMilestonesTabModel {
  ids: Array<string>;
  dateStartPlanned: string;
  dateEndPlanned: string;
}

export class HandoverLookUpModel {
  id: string;
  name: string;
  status: string;
  description?: string;
}

export class WalkDownCompleteModel {
  walkDownSignatures: SignatureModel[];
  walkDownComplete: boolean;
  isTurnSign: boolean;
  walkDownStatus?: number;

  constructor() {
    this.isTurnSign = false;
  }
}

export class SignatureModel {
  description: string;
  number: number;
  signedName: string;
  signDate: Date;
  isTurn: boolean = false;
  authorizationLevel?: number;
}

export class CreatePartialHandoverModel {
  handoverId: string;
  disciplineIds: Array<string>;
  projectKey?: string;
}

export class ConditionalModel {
  conditions: Array<string>;
  isAccepted: boolean = false;
}

export class ConditionalAcceptedModel {
  projectKey: string;
  handoverId: string;
  conditions: Array<string>;
}


export module StatusDisplayMilestone {
  export const Rejected = 'Rejected';
  export const Inprogress = 'In Progress';
  export const Completed = 'Completed';
  export const Ready = 'Ready';
  export const Waiting = 'Waiting';
  export const NotStarted = 'Not Started';
  export const ConditionallyAccepted = 'Conditionally Accepted';
}

export module StatusColorMilestone {
  export const Rejected = 'badge-warning';
  export const Waiting = 'badge-warning';
  export const NotStarted = 'badge-primary';
  export const Ready = 'badge-primary';
  export const Completed = 'badge-success';
  export const DONE = 'badge-success';
  export const DELETED = 'badge-danger';
  export const Inprogress = 'badge-info';
  export const ConditionallyAccepted = 'badge-secondary';
  export const CLOSED = 'badge-dark';
}

export class MilestoneFilterModel {
  systemFilter: string;
  subSystemFilter: string;
  milestoneFilter: string;
  handoverNoFiler: string;
}

export class MilestoneTabSignOffCommand {
  projectKey: string;
  handoverId: string;
  isDifferentUser: boolean;
  pinCode?: string;
  username?: string;
  password?: string;
}

export class HandoverDownloadStatus {
  handoverId: string;
  handoverNo: string;
  isLoading: boolean;
  isDone: boolean;
  isError: boolean;

  constructor() {
    this.isLoading = false;
    this.isDone = false;
    this.isError = false;
  }
}

export class MilestoneTags {
  id: string;
  tagNo: string;
  disciplineId: string;
  disciplineCode: string;
  itrs: HandoverLookUpModel[];
  punches: HandoverLookUpModel[];
  changes: HandoverLookUpModel[];

  constructor() {
    this.itrs = new Array();
    this.punches = new Array();
    this.changes = new Array();
  }
}

export class WalkdownStatusEnum {
  public static NotStarted = 0;
  public static Inprogress = 1;
  public static Completed = 2;
}

export class HandoverStatusEnum {
  public static NotStarted = 0;
  public static Completed = 1;
  public static Inprogress = 2;
  public static Ready = 3;
  public static ConditionallyAccepted = 4;
}

export const HandoverStatus = {
  NotStarted: 'NotStarted',
  Completed: 'Completed',
  Inprogress: 'Inprogress',
  Ready: 'Ready',
  ConditionallyAccepted: 'ConditionallyAccepted',
}

export const HandoverType = {
  full: 'Full',
  intial: 'Initial',
  individual: 'Individual',
  partial: 'Partial',
}