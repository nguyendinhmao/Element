export class DataPreservationElementModel {
  id: string;
  elementNo: string;
  task: string;
  description: string;
  type: string;
  frequencyInWeeks: number;
}
export class UpdatePreservationElementModel {
  id: string;
  elementNo: string;
  task: string;
  description: string;
  type: string;
  frequencyInWeeks: number;
}
export class CreatePreservationElementModel {
  projectId: string;
  elementNo: string;
  task: string;
  description: string;
  type: string;
  frequencyInWeeks: number;
}
export class PreservationElementLookUpModel {
  id: string;
  value: string;
}
