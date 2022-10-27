export class ITRAdminModel {
    itrId: string;
    itrNo: string;
    description: string;
    type: string;
    disciplineName: string;
    signatureCount: number;
    mileStoneName: string;
    projectName: string;
    dateUpdated: Date;

}
export class ITRAdminUpdationModel {
    itrId: string;
    projectId: string;
    itrNo: string;
    description: string;
    type: string;
    disciplineId: string;
    milestoneId: string;
}
export class ITRAdminCreatetionModel {
    itrId: string;
    itrNo: string;
    description: string;
    type: string;
    disciplineId: string;
    milestoneId: string;
    projectId: string;
}
export class ItrLookUpModel{
    id: string;
    itrNo: string;
    description: string;
}
export class UpdationItrAllocationModel{
    itrId: string;
    itrNo: string;
    isAdd: boolean;
    isDelete: boolean;
}

export class UpdationItrAllocationCommand{
    projectKey: string;
    equipmentCode: string;
    itrAllocationUpdation: UpdationItrAllocationModel[];
    remarks: string;
}
export class ItrEquipmentAllocate{
    itrId: string;
    itrNo: string;
    description: string;
    isAllocated: string;
}