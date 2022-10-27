export class DataStandardPunchItem {
  id: string;
  description: string;
  correctiveAction: string;
  category: string;
  disciplineCode: string;
}
export class UpdateStandardPunchItemModel {
  id: string;
  description: string;
  correctiveAction: string;
  category: string;
  disciplineId: string;
}
export class CreateStandardPunchItemModel {
  projectId: string;
  description: string;
  correctiveAction: string;
  category: string;
  disciplineId: string;
}
