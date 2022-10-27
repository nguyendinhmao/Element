//#region Common Model
export const ModuleReport = {
  skyline: 'Skyline',
  system: 'System',
  subSystem: 'SubSystem',
  itr: 'DetailedItr',
  punch: 'PunchListSummary',
}

export class LayoutReportModel {
  projectLogo: string;
  clientLogo: string;
  eaiLogo: string;
  titleReport: string;
  filter: string;
  isTitleCriteria: boolean;

  constructor() {
    this.projectLogo = null;
    this.clientLogo = null;
    this.eaiLogo = null
    this.titleReport = null;
    this.filter = null;
    this.isTitleCriteria = false;
  }
}

export interface Lookup {
  id: string;
  value: string;
}

export interface FieldConfig {
  key: string;
  type: string;
  default: any;
}

export interface FilterModel {
  correctAction: string;
  dateFrom: string;
  dateTo: string;
  descriptions: string;
  disciplines: string;
  drawings: string;
  itrStatuses: string;
  jobCards: string;
  locations: string;
  materialNo: string;
  materialsRequired: any;
  milestones: string;
  punchNo: string;
  punchStatuses: string;
  subsystems: string;
  systems: string;
  multiSystems: Array<string>;
  multiSubSystems: Array<string>;
  multiTagNos: Array<string>;
  multiDisciplines: Array<string>;
  multiWorkPacks: Array<string>;
  multiJobCards: Array<string>;
  multiMilestones: Array<string>;
  multiTypes: Array<string>;
  multiPunchNo: Array<string>;
  multiMaterialNo: Array<string>;
  multiLocations: Array<string>;
  multiDrawings: Array<string>;
  tags: string;
  types: string;
  workPacks: string;
}

export class LookupList {
  correctAction: Array<Lookup>;
  dateFrom: Array<Lookup>;
  dateTo: Array<Lookup>;
  descriptions: Array<Lookup>;
  disciplines: Array<Lookup>;
  drawings: Array<Lookup>;
  multiDrawings: Array<Lookup>;
  itrStatuses: Array<any>;
  jobCards: Array<Lookup>;
  locations: Array<Lookup>;
  multiLocations: Array<Lookup>;
  materialNo: Array<Lookup>;
  multiMaterialNo: Array<Lookup>;
  materialsRequired: Array<any>;
  milestones: Array<Lookup>;
  punchNo: Array<Lookup>;
  multiPunchNo: Array<Lookup>;
  punchStatuses: Array<any>;
  subsystems: Array<Lookup>;
  systems: Array<Lookup>;
  multiSystems: Array<Lookup>;
  multiSubSystems: Array<Lookup>;
  multiTagNos: Array<Lookup>;
  multiDisciplines: Array<Lookup>;
  multiWorkPacks: Array<Lookup>;
  multiJobCards: Array<Lookup>;
  multiMilestones: Array<Lookup>;
  tags: Array<Lookup>;
  types: Array<Lookup>;
  multiTypes: Array<Lookup>;
  workPacks: Array<Lookup>;

  constructor() {
    this.correctAction = new Array();
    this.dateFrom = new Array();
    this.dateTo = new Array();
    this.descriptions = new Array();
    this.disciplines = new Array();
    this.drawings = new Array();
    this.itrStatuses = new Array();
    this.jobCards = new Array();
    this.locations = new Array();
    this.materialNo = new Array();
    this.materialsRequired = new Array();
    this.milestones = new Array();
    this.punchNo = new Array();
    this.punchStatuses = new Array();
    this.subsystems = new Array();
    this.systems = new Array();
    this.multiSystems = new Array();
    this.multiSubSystems = new Array();
    this.multiTagNos = new Array();
    this.multiDisciplines = new Array();
    this.multiWorkPacks = new Array();
    this.multiJobCards = new Array();
    this.multiMilestones = new Array();
    this.multiTypes = new Array();
    this.multiPunchNo = new Array();
    this.multiMaterialNo = new Array();
    this.multiLocations = new Array();
    this.multiDrawings = new Array();
    this.tags = new Array();
    this.types = new Array();
    this.workPacks = new Array();
  }
}

export const CanvasA4Config = {
  WIDTH: 297,
  HEIGHT: 208,
  CANVAS_WIDTH: 297 - 20,
  CANVAS_HEIGHT: 208 - 24,
}

class ReportCommand {
  projectKey: string;
  module: string;
  typeExport: string;
}
//#endregion Common Model

//#region  Skyline report
export class SkylineReportCommand extends ReportCommand {
  dateFrom: string;
  dateTo: string;
  milestoneId: string;
  milestoneName: string;

  constructor() {
    super();
    this.typeExport = null;
    this.dateFrom = null;
    this.dateTo = null;
    this.milestoneId = null;
    this.milestoneName = null;
  }
}

export interface SkylineRenderModel {
  actualHO: number;
  date: string;
  handoverItems: Array<Handover4Report>;
  plannedHO: number;
  week: number;
  items4Pdf?: Array<Handover4Report>;
}

export interface Handover4Report {
  handoverNo: string;
  handoverStatusId: number;
  referenceNo: string;
}

export const SkylineReportConstant = {
  MAX_ROWS_PDF: 10,
  MAX_COLS_PDF: 9,
  MAX_CELL_WIDTH: 122,
  MAX_REST_SKYLINE: 240,
  MAX_COL_MARGIN: 20
}
//#endregion  Skyline report

//#region System report
export class SystemReportCommand extends ReportCommand {
  systemIds: Array<string>;
  listSystemNo: Array<string>;

  constructor() {
    super();
    this.listSystemNo = new Array();
    this.systemIds = new Array();
  }
}

export interface SystemRenderModel {
  milestones: Array<Milestone4Report>;
  systems: Array<System4Report>;
}

export interface System4Report {
  aPunchItems: number;
  bPunchItems: number;
  cPunchItems: number;
  completedPercent: number;
  milestones: Array<Milestone4Report>
  osChanges: number;
  no: string;
  totalChanges: number;
}

export interface Milestone4Report {
  completedDate: string;
  milestoneId: string;
  milestoneName: string;
  osItrs: number;
  totalItrs: number;
}

export const SystemReportConstant = {
  MAX_ROW_PDF: 50,
}
//#endregion System report

//#region Subsystem report
export class SubSystemReportCommand extends SystemReportCommand {
  subSystemIds: Array<string>;
  listSubSystemNo: Array<string>;

  constructor() {
    super();
    this.listSubSystemNo = new Array();
    this.subSystemIds = new Array();
  }
}

export interface SubSystemRenderModel {
  milestones: Array<Milestone4Report>;
  subSystems: Array<SubSystem4Report>;
}

export interface SubSystem4Report extends System4Report { }

export const SubSystemReportConstant = {
  MAX_ROW_PDF: 50,
}
//#endregion Subsystem report

//#region Detail Itr report
export class DetailItrReportCommand extends ReportCommand {
  systemIds: Array<string>;
  subSystemIds: Array<string>;
  tagIds: Array<string>;
  disciplineIds: Array<string>;
  milestoneIds: Array<string>;
  workPackIds: Array<string>;
  tagDescription: string;
  status: string;
  filter: string;


  constructor() {
    super();
    this.systemIds = new Array();
    this.subSystemIds = new Array();
    this.tagIds = new Array();
    this.disciplineIds = new Array();
    this.milestoneIds = new Array();
    this.workPackIds = new Array();
    this.tagDescription = null;
    this.status = null;
    this.filter = null;
  }
}

export interface DetailItrRenderModel {
  itrTags: Array<Itr4Report>;
  subSystemDescription: string;
  subSystemId: string;
  subSystemNo: string;
  systemDescription: string;
  systemId: string;
  systemNo: string;
  items4Pdf?: Array<Itr4Report>;
}

export interface Itr4Report {
  approvedBy: string;
  approvedDate: string;
  completeDate: string;
  completedBy: string;
  itrDescription: string;
  itrNo: string;
  tagDescription: string;
  tagNo: string;
  rowNumber?: number;
}

export const DetailItrReportConstant = {
  MAX_ROW_PDF: 23,
  MAX_ROW_HEIGHT: 32,
  MAX_HEADER_HEIGHT: 135,
  MIN_FOOTER_HEIGHT: 50,
  MAX_DES_LENGTH: 65,
  MAX_BY_LENGTH: 15,
  MAX_REST: 60,
}
//#endregion Detail Itr report

//#region Punch Summary
export class PunchSummaryReportCommand extends ReportCommand {
  systemIds: Array<string>;
  subSystemIds: Array<string>;
  tagIds: Array<string>;
  disciplineIds: Array<string>;
  punchTypeIds: Array<string>;
  punchIds: Array<string>;
  drawingIds: Array<string>;
  locationIds: Array<string>;
  materialsRequired: boolean | null;
  orderIds: Array<string>;
  punchDescription: string;
  correctiveAction: string;
  status: string;
  filter: string;

  constructor() {
    super();
    this.systemIds = new Array();
    this.subSystemIds = new Array();
    this.tagIds = new Array();
    this.disciplineIds = new Array();
    this.punchTypeIds = new Array();
    this.punchIds = new Array();
    this.drawingIds = new Array();
    this.locationIds = new Array();
    this.materialsRequired = null;
    this.orderIds = new Array();
    this.punchDescription = null;
    this.correctiveAction = null;
    this.status = null;
    this.filter = null;
  }
}

export interface PunchSummaryRenderModel {
  punchTags: Array<Punch4Report>;
  subSystemDescription: string;
  subSystemId: string;
  subSystemNo: string;
  systemDescription: string;
  systemId: string;
  systemNo: string;
  items4Pdf?: Array<Punch4Report>;
}

export interface Punch4Report {
  tagNo: string;
  punchNo: string;
  punchDescription: string;
  correctiveAction: string;
  category: string;
  discipline: string;
  completedBy: string;
  completeDate: string;
  approvedBy: string;
  approvedDate: string;
  rowNumber?: number;
}

export const PunchSummaryReportConstant = {
  MAX_ROW_PDF: 23,
  MAX_ROW_HEIGHT: 32,
  MAX_HEADER_HEIGHT: 135,
  MIN_FOOTER_HEIGHT: 50,
  MAX_DES_LENGTH: 65,
  MAX_BY_LENGTH: 15,
  MAX_REST: 60,
}
//#endregion Punch Summary