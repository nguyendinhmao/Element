export interface RecordQuestionsHandoverModel {
    question: { customId: string; value: string };
    id: string;
    currentAnswer: string;
    answer: {
        customId: string;
        type: string;
        values: string[];
    }[];
}

export interface SignatureHandoverReturnedModel {
    id: any;
    label: string;
    number: number;
    signDate: string;
    signatureId: string;
    userCompany: string;
    userName: string;
    isTurn?: boolean;
    authorizationLevel?: number;
}

// respone from getHandoverDetail
export interface HandoverDetail {
    fieldData: any; // field from database
    form: RecordFormModel;
    questions: RecordQuestionsModel[];
    signatures: RecordSignaturesModel[];
    canAction: boolean;
    status: string;
    referenceName?: string;
    rejectReason?: string;
    recordId?: string;
    isEdited?: boolean;
}

export interface RecordFormModel {
    headerHtml: string;
    headerCss: string;
    bodyHtml: string;
    bodyCss: string;
    footerHtml: string;
    footerCss: string;
}

export interface RecordQuestionsModel {
    question: { customId: string; value: string };
    id: string;
    currentAnswer: string;
    answer: {
        customId: string;
        type: string;
        values: string[];
    }[];
}

export interface RecordSignaturesModel {
    id: any;
    label: string;
    number: number;
    signDate: string;
    signatureId: string;
    userCompany: string;
    userName: string;
    signUserId?: string;
    isTurn?: boolean;
    authorizationLevel?: number;
}