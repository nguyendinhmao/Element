export class DataPunchListModel {
    punchListId: string;
    punchListName: string;
    punchListNo: string;
    disciplineId: string;
    disciplineCode: string;
    milestoneName: string;
    milestoneId: string;
    dateCompleted: string;
    dtCompleted: Date;
}
export class UpdatePunchListModel {
    punchListId: string;
    punchListNo: string;
    punchListName: string;
    disciplineId: string;
    disciplineCode: string;
    milestoneName: string;
    milestoneId: string;
    dateCompleted: string;
    dtCompleted: Date;
}

export class PunchListLookUpModel{
    id: string;
    value: string;
}