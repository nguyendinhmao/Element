import { SystemLookUpModel } from '../data-tab/data-system.model';
import { SubSystemLookUpModel } from '../data-tab/data-subsystem.model';
import { DisciplineLookUpModel } from '../data-tab/data-discipline.model';

export class ChangePageListModel {
  id: number;
  changeNo: string;
  title: string;
  changeType: string;
  description: string;
  stageName: string;
  justification: string;
  proposedSolution: string;
  systems: SystemLookUpModel[] = [];
  subSystems: SubSystemLookUpModel[] = [];
  disciplines: DisciplineLookUpModel[] = [];
  createdDate: string;
  status: string;
  signatures: Signature[];
  numberSigned: number;
  totalSignatures: number;
  createdBy: string;
}
export class ChangePageSearchModel {
  changeNo: string;
  title: string;
  changeType: string;
  stage: string;
  system: string;
  subSystem: string;
  discipline: string;
  tagNo: string;
}

export class CreateChangeItemModel {
  projectKey: string;
  title: string;
  description: string;
  justification: string;
  proposedSolution: string;
  changeTypeId: string;
  systemIds: string[] = [];
  subSystemIds: string[] = [];
  disciplineIds: string[] = [];
  isSubmit: boolean = false;
}

export class UpdateFirstStageChangeModel extends CreateChangeItemModel {
  changeId: string;
  isSubmitted: boolean = false;
}

export class UpdateOrtherStageChangeModel {
  projectKey: string;
  changeStageId: string;
  changeResponseId: string;
  response: string;
  isSubmitted: string;
  number: number;
  changeId: string;
  nummber: number
}

export class CounterUserChangesModel {
  unSubmittedChanges: number;
  submittedChanges: number;
  needMySignatureChanges: number;
}

export class Signature {
  description: string;
  number: number;
  signedName: string;
  signDate: Date;
  isTurn: boolean = false;
}
export class ChangeTypeLookUpModel {
  id: string;
  value: string;
}
export class DetailChangeModel{
  firstStage: ChangeFirstStageModel;
  otherStage: OtherChangeStageModel[];
  isHavePermissionSignOff: boolean;
  signatures: Signature[];
  canSignature: boolean;
  isSpecialType: boolean = false;
}
export class ChangeFirstStageModel {
  changeId: string;
  changeNo: string;
  title: string;
  description: string;
  justification: string;
  proposedSolution: string;
  changeTypeId: string;
  systemIds: string[];
  subSystemIds: string[];
  disciplineIds: string[];
  status: number;
  isCurrentStage: boolean;
  comment: string;
  changeStageId: string;
  nameStage: string;
  isSubmitted: boolean;
  projectKey: string;
  isHaveApprovePermission: boolean;
  isHaveEditPermission: boolean
}
export class OtherChangeStageModel {
  changeId: string;
  changeStageId: string;
  changeResponseId: string;
  response: string;
  status: number;
  isCurrentStage: boolean;
  comment: string;
  nameStage: string;
  number: number;
  isHaveApprovePermission: boolean
  projectKey: string;
  isSubmitted: boolean;
  isHaveEditPermission: boolean
}
export class LoadingSelectionChangeModel {
  isLoadingSystem: boolean;
  isLoadingSubSystem: boolean;
  isLoadingDiscipline: boolean;
  isLoadingType: boolean;
  isLoadingMaterialsRequired: boolean;
}
export class ApproveModel{
    changeStageId: string;
    projectKey: string;
}
export class RejectModel{
    changeStageId: string;
    projectKey: string;
    reason: string;
}
export enum ChangeStatus {
  Rejected = 1,
  Approved = 2,
  Done = 3,
  Deleted = 4,
  Submitted = 5,
  Draft = 6,
  Closed = 7
}

export class AttachmentModel{
  id: string;
  url: string;
  name: string;
  stageName: string;
}

