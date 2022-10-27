export class ITRAllocationModel {
    equipmentTypeId: number;
    equipmentTypeCode: string;
    description: string;
    noOfAssociatedTags: number;
    isAddOrEdit: boolean;
}

export class EquipmentItrCreationModel {
    projectKey: string;
    equipmentCode: string;
    description: string;
}
export class EquipmentItrUpdationModel {
    equipmentTypeCode: string;
    description: string;
}