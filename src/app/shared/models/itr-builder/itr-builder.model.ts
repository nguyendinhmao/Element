export class ItrBuilderModel {
    id: string;
    itrId: string;
    headerHtml: string;
    bodyHtml: string;
    footerHtml: string;
    headerCss: string;
    bodyCss: string;
    footerCss: string;
    params: string;
    paramForms: string;
}
export class ItrBuilderUpdationModel {
    id: string;
    headerHtml: string;
    bodyHtml: string;
    footerHtml: string;
    headerCss: string;
    bodyCss: string;
    footerCss: string;
    params: string;
    paramForms: string;
    isPublish:boolean;
    questions: ItrQuestion[] = [];
    signatures: ItrSignature[] = [];
} 
export class ItrBuilderCreationModel {
    id: string
    itrId: string;
    headerHtml: string;
    bodyHtml: string;
    footerHtml: string;
    headerCss: string;
    bodyCss: string;
    footerCss: string;
    params: string;
    paramForms: string;
    isPublish:boolean;
    questions: ItrQuestion[] = [];
    signatures: ItrSignature[] = [];
}

export class ItrQuestion{
    id: string;
    question: Question;
    answer: Answer[];
}
export class Question{
    customId: string;
    value:string
}
export class Answer{
    customId: string;
    type: string;
    values: string[]
}

export class ItrSignature{
    id: string;
    signatureId : string;
    number: number;
}