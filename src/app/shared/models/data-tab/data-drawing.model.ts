export class DataDrawingModel {
    id: string;
    drawingNo: string;
    description: string;
    revision: string;
    drawingTypeId: string;
    drawingTypeCode: string;
    status: string;
}
export class UpdateDrawingModel {
    id: string;
    drawingNo: string;
    description: string;
    revision: string;
    drawingTypeId: string;
    drawingTypeCode: string;
    status: string;
    fileName: string;
    url: string;
}

export class UpdateAttachmentDrawingFile {
    drawingId: string;
}

export class DrawingModel {
    id: string;
    drawingNo: string;
    description: string;
    revision: string;
    drawingTypeId: string;
    drawingTypeCode: string;
    status: string;
}

export class DrawingLookUpModel {
    id: string;
    value: string;
}