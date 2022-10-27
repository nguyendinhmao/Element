export interface SignatureObject {
  label: string;
  id: string;
}

export interface EventFieldFromSignature {
  isSave: boolean;
  signatureId: string;
  fieldLabel: string;
  signatureLabel: string;
}
