import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'confirm-modal',
  templateUrl: './confirm.modal.html',
})

export class ConfirmModalComponent {
  @Input() visible: boolean;
  @Input() header: string;
  @Input() content: string;
  @Input() id: string = "confirmModal"; 
  @Input() hiddenCloseSymbol = false;
  
  @Output() confirm: EventEmitter<boolean> = new EventEmitter();

  onConfirm = () => {
    this.confirm.emit(true);
  }

  onClose = () => {
    this.confirm.emit(false);
  }
}
