export class DataHandoverModel {
    handoverId: string;
    handoverName: string;
    handoverNo:string;
    complete : string;
    milestoneName : string;
    disciplineCode: string;
    system: string;
    subSystem: string;
}
export class UpdateHandoverModel {
    handoverId: string;
    handoverName: string;
    handoverNo:string;
    complete : string;
    milestoneId : string;
    disciplineId: string;
    subSystemId: string;
    systemId: string;
}