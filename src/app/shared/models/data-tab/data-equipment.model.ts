export class DataEquipmentModel {
  equipmentId: number;
  equipmentCode: string;
  equipmentName: string;
}

export class UpdateEquipmentModel {
  equipmentId: number;
  equipmentCode: string;
  equipmentName: string;
  projectKey: string;
}

export class CreateEquipmentModel {
  equipmentCode: string;
  description: string;
  projectKey: string;
}
