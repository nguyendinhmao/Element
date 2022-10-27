import { Component, Output, Input, EventEmitter, OnInit } from "@angular/core";
import {
  SignatureObject,
  EventFieldFromSignature,
} from "../../../../shared/models/itr-tab/itr-builder-signature-created";
@Component({
  selector: "app-field-from-signature-popup",
  templateUrl: "./field-from-signature.html",
  styleUrls: ["./field-from-signature.scss"],
})
export class FieldFromSignaturePopup implements OnInit {
  @Input() listSignature: SignatureObject[] = [];
  @Input() idSignatureId: string = "";
  @Input() fieldLabel: string = "";
  @Output() handleEvent = new EventEmitter();
  listFieldFromSignature = [
    { label: "Name" },
    { label: "Company" },
    { label: "SignatureDate" },
  ];
  SignatureIdSelected: string = "";
  fieldSelected: string = "";
  isEdited: boolean = false;
  isCanSaveChange() {
    return this.isEdited && this.fieldSelected && this.SignatureIdSelected;
  }
  handleChangeSignature(signatureModel: SignatureObject) {
    this.isEdited = true;
    this.SignatureIdSelected = signatureModel.id;
  }
  handleChangeFieldFromSignature(fieldModel: { label: string }) {
    this.isEdited = true;
    this.fieldSelected = fieldModel.label;
  }
  handleChange() {
    this.isEdited = true;
  }
  handleClosePopup(isSave: boolean) {
    let signatureSelectedLabel = "";
    this.listSignature.map((signature) => {
      if (signature.id === this.SignatureIdSelected) {
        signatureSelectedLabel = signature.label.replace(/\[Signature\]/, "");
        return;
      }
    });
    const params: EventFieldFromSignature = {
      isSave: isSave,
      signatureId: this.SignatureIdSelected,
      fieldLabel: this.fieldSelected,
      signatureLabel: signatureSelectedLabel,
    };
    this.handleEvent.emit(params);
  }
  constructor() {}
  ngOnInit() {
    this.SignatureIdSelected = this.idSignatureId;
    this.fieldSelected = this.fieldLabel;
  }
}
