export class PreservationAllocationModel {
    equipmentTypeId: string;
    equipmentTypeCode: string;
    description: string;
    noOfAssociatedTags: number;
}

export class PreservationEquipmentAllocate{
    preservationElementId: string;
    elementNo: string;
    description: string;
    isAllocated: boolean;
    status: string;
    isPause: boolean;
    isStop: boolean;
}

export class PreservationAllocationDetailModel{
    id: number;
    preservationCode: string;
    preservationDesciption: string;
    status: boolean; 
}

export class ElementStatusCommand{
    projectKey: string;
    equipmentCode: string;
    elementIds: string[];
    comments: string;
}

export class ElementUpdationCommand{
    projectKey: string;
    equipmentCode: string;
    elementsUpdated: string[];
    comments: string;
}