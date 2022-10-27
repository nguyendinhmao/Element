export class DataDrawingTypeModel {
  id: string;
  drawingTypeCode: string;
  description: string;
  locationDrawing: boolean;
}
export class CreateDrawingTypeModel {
  drawingTypeCode: string;
  description: string;
  locationDrawing: boolean;
  projectId: string;
}
export class UpdateDrawingTypeModel {
  id: string;
  drawingTypeCode: string;
  description: string;
  projectKey: string;
  locationDrawing: boolean;
}
export class DrawingTypeLookUpModel {
  id: string;
  value: string;
}
