export class DataMaterialModel {
    id: string;
    materialCode: string;
    description: string;
    quantity: number;
}
export class UpdateMaterialModel {
    id: string;
    materialCode: string;
    description: string;
    quantity: number;
}

export class CreateMaterialModel {
  projectId: string;
  materialCode: string;
  description: string;
  quantity: number;
}
export class MaterialLookUpModel {
    id: string;
    value: string;
}
