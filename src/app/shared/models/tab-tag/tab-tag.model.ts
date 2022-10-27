import { MilestonesTabModel } from '../milestones-tab/milestones-tab.model';
import { DetailPreservationTabModel } from '../preservation-tab/preservation-tab.model';
import { PunchPageListModel } from '../punch-page/punch-page.model';
import { ItrRecordDetail } from './itr-record.model';

export class TabTagModel {
  tagNo: string;
  description: string;
  system: number;
  subSystem: string;
  parent: string;
  location: string;
  discipline: string;
  tagType: string;
  equipmentType: string;
  workPack: string;
  jobCards: number;
  package: string;
  preservationNo: string;
  status: string;
}
export class TagTypeModel {
  key: string;
  value: string;
}
export class DataApplyModel {
  systemId: number;
  subSystemId: string;
  parentId: string;
  locationId: string;
  disciplineId: string;
  tagType: string;
  equipmentTypeId: string;
  workPackId: string;
  status: string;
}
export class UpdateTagPageModel {
  tagId: string;
  locationId: string;
  subSystemId: string;
  workPackId: string;
  equipmentTypeId: string;
  parent: string;
  status: boolean;
  systemId: string;
  tagType: string;
  disciplineId: string;
  parentId: string;
  referenceId: string;
  referenceTypeId: number;
}
export class UpdateTagTabSideMenu {
  tagId: string;
  tagNo: string;
  description: string;
}

export module StatusColor {
  export const Rejected = 'badge-danger';
  export const Inprogress = 'badge-info';
  export const Completed = 'badge-success';
  export const DELETED = 'badge-danger';
  export const Waiting = 'badge-primary';
  export const NotStarted = 'badge-secondary';
  export const CLOSED = 'badge-dark';
}

export module StatusDisplay {
  export const Rejected = 'Rejected';
  export const Inprogress = 'In Progress';
  export const Completed = 'Completed';
  export const DELETED = 'DELETED';
  export const Waiting = 'Waiting';
  export const NotStarted = 'Not Started';
  export const CLOSED = 'CLOSED';
}
export class TagItrModel {
  tagItrId: string;
  tagId: string;
  itrId: string;
  tagNo: string;
  itrNo: string;
  status: string;
  itrDescription: string;
  rejectReason: string;
  isAdded: boolean = false;
  isDeleted: boolean = false;
}
export class ItrAllowcateUpdateModel {
  remarks: string;
  tagItrUpdationModels: TagItrModel[] = [];
}
export enum TagItrStatus {
  Inprogress = 'Inprogress',
  Completed = 'Completed',
  Rejected = 'Rejected',
  Deleted = 'Delete',
  NotStarted = 'NotStarted',
}

export class TagPucnhDetail {
  tagId: string;
  tagNo: string;
  disciplineId: string;
  disciplineCode: string;
  subSystemId: string;
  subSystemNo: string;
  systemId: string;
  systemNo: string;
  locationId: string;
  locationCode: string;
}

export class SynchronizeDataCommand {
  projectKey: string;
  tagIds: string[];
  records: ItrRecordDetail[];
  punches: PunchPageListModel[];
  handovers?: MilestonesTabModel[];
  preservations?: DetailPreservationTabModel[];
  tagPreservationIds?: string[];
}

export class TagDrawingModel {
  drawingId: string;
  drawingNo: string;
  description?: string;
  revision?: string;
  isLocationDrawing: boolean;
  isAdded: boolean = false;
  isDeleted: boolean = false;
  fileName?: string;
  url?: string;
}

export const DrawingsExtension = {
  pdf: ['pdf'],
  img: ['png', 'jpg', 'icon', 'svg', 'jpeg', 'gif', 'avif'],
  other: ['zip', 'cad', 'csv', 'doc', 'docx', 'xls', 'xlsx', 'pptx']
}

export class DownloadDetailStatus {
  tagId?: string;
  tagNo?: string;
  handoverId?: string;
  handoverNo?: string;
  tagPreservationId?: string;
  tagPreservationNo?: string;
  name?: string;
  isLoading: boolean;
  isDone: boolean;
  isError: boolean;

  constructor() {
    this.isLoading = false;
    this.isDone = false;
    this.isError = false;
  }
}