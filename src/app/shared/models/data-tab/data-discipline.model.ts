export class DataDisciplineModel {
    disciplineId: string;
    disciplineCode: string;
    disciplineName: string;
}
export class UpdateDisciplineModel {
    disciplineId: string;
    disciplineName: string;
    disciplineCode: string;
    projectKey?: string;
}
export class CreateDisciplineModel {
    disciplineCode: string;
    description: string;
    projectId: string;
}
export class DisciplineLookUpModel{
    id: string;
    value: string;
}
