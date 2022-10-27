export class OrderLookUpModel{
    id: string;
    value: string;
}
export class DataOrderModel{
    orderNo: string;
    materialCode:string;
    quantity: number;
}
export class UpdationDataOrderModel{
    orderNo: string;
    materialId:string;
    quantity: number;
    orderId: string;
}

export class CreationDataOrderModel{
  projectId: string;
  orderNo: string;
  materialId:string;
  quantity: number;
  orderId: string;
}
