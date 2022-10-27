export class DataTabModel {
    dataTabId: number;
    dataTabName: string;
}

export class ExportParamModel {
    filter: string
    sortExpression: string;
    module: string;
    filterExpression: string;
    projectKey: string;
    projectId: string;
}

export class ExportModel {
    fileName: string;
    fileContent: string;
    contentType: string;
}