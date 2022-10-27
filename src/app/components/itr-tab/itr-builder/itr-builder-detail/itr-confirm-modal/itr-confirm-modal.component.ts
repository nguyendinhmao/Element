import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'itr-confirm-modal',
  templateUrl: './itr-confirm-modal.component.html',
  styleUrls: ['./itr-confirm-modal.component.scss']
})
export class ItrConfirmModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ItrConfirmModalComponent>,
  ) {
    //--- disable backdrop dialog
    this.dialogRef.disableClose = true;
  }

  onClose(isConfirm = false) {
    this.dialogRef.close(isConfirm);
  }
}