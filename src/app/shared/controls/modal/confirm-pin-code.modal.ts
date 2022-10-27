import { Component, Input, Output, EventEmitter } from "@angular/core";
import { NgForm } from "@angular/forms";

@Component({
  selector: "confirm-pin-code-modal",
  templateUrl: "./confirm-pin-code.modal.html",
})
export class ConfirmPinCodeModalComponent {
  @Input() visible: boolean;
  @Input() isShowPinCode: boolean;
  @Input() isShowCreatePinCode: boolean;
  @Output() onSuccess: EventEmitter<string> = new EventEmitter();

  code: string;

  constructor() { }

  onConfirm = (f: NgForm) => {
    if (f.invalid) {
      return;
    }
    if (this.isShowCreatePinCode) {
      this.onSuccess.emit("CREATE");
    } else {
      this.onSuccess.emit(this.code);
    }
  };

  onClose = () => {
    this.onSuccess.emit("");
  };
}
