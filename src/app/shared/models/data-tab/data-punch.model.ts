import { DrawingLookUpModel } from "src/app/shared/models/punch-page/punch-page.model";
export class DataPunchModel {
  punchId: string;
  punchNo: string;
  description: string;
  correctiveAction: string;
  tagId: string;
  tagNo: string;
  punchTypeId: string;
  type: string;
  location: string;
  locationCode: string;
  category: string;
  materialsRequired: boolean;
  orderId: string;
  orderNo: string;
  drawings: DrawingLookUpModel[] = [];
  // locationDrawingNo: string;
  // locationDrawingId: string;
  // drawingNo: string;
  // drawingId: string;
  // completed: boolean;
}
export class UpdatePunchModel {
  punchId: string;
  punchNo: string;
  description: string;
  correctiveAction: string;
  tagId: string;
  tagNo: string;
  punchTypeId: string;
  type: string;
  location: string;
  category: string;
  materialsRequired: boolean;
  orderId: string;
  orderNo: string;
  drawings: DrawingLookUpModel[] = [];
  drawingIds: string[] = [];
  // locationDrawingNo: string;
  // locationDrawingId: string;
  // drawingNo: string;
  // drawingId: string;
  // completed: boolean;
}
