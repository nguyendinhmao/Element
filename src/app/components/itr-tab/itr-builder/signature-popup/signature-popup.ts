import {
  Component,
  AfterViewInit,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import GrapesJsConfig from "../itr-builder-detail/grapesJs-editor-config/grapesJs-editor-config";
import * as HTML_DATA_CUSTOM from "../itr-builder-detail/grapesJs-editor-config/html-data-custom";
@Component({
  selector: "app-itr-builder-signature-popup",
  templateUrl: "./signature-popup.html",
  styleUrls: ["./signature-popup.scss"],
})
export class ITRBuilderSignaturePopup implements AfterViewInit, OnInit {
  @Input() signatureLookUp: any[] = [];
  @Input() htmlSource: string = "";
  @Input() hasStaffSignature: boolean;
  @Input() signatureIdSelected: string = "";
  @Output() OnClickEvent = new EventEmitter();

  forceDisplay = true;
  placeholder = "Select Signature";
  markFirst = false;
  SignatureObject = {
    id: null,
    signatureId: null,
    signatureLabel: null,
    signatureNumber: -1,
  };
  ListSignature = [];
  isHiddenSelectBox = false;
  currentSelectedSignatureId = "";
  isCanSave = () => {
    if (this.isHiddenSelectBox) return true;
    if (this.SignatureObject.signatureId) return true;
    return false;
  };

  onSelectSignature = (event) => {
    this.currentSelectedSignatureId = event.id;
    this.SignatureObject.signatureId = event.id;
    this.SignatureObject.signatureLabel = event.value;
    this.SignatureObject.signatureNumber = event.number;
  };

  handleClickButton = (isSave = false) => {
    if (!isSave) return this.OnClickEvent.emit(null);
    else {
      this.OnClickEvent.emit(this.SignatureObject);
    }
  };

  ExchangeDataSignatureLookup = () => {
    if (this.signatureLookUp.length > 0) {
      const newList = [];
      this.signatureLookUp.map((data) => {
        let resultCheck = true;
        GrapesJsConfig.Tools.getListValueFromHTMLSource(this.htmlSource).map(
          (signatureCreatedId) => {
            if (signatureCreatedId === data.id) {
              resultCheck = false;
              return;
            }
          }
        );

        if (resultCheck)
          newList.push({
            id: data.id,
            value: data.value,
            number: data.number,
          });
      });

      if (this.signatureIdSelected) {
        this.signatureLookUp.map((signature) => {
          this.currentSelectedSignatureId = this.signatureIdSelected;
          if (signature.id === this.signatureIdSelected) {
            this.markFirst = true;
            newList.unshift({
              id: signature.id,
              value: signature.value,
              number: signature.number,
            });
            return;
          }
        });
      }

      this.ListSignature = newList;
    }
  };

  constructor() {}

  ngOnInit() {
    this.ExchangeDataSignatureLookup();
  }

  ngAfterViewInit() {}
}
