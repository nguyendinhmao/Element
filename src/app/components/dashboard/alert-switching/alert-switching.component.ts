import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'alert-switching',
  templateUrl: 'alert-switching.component.html',
  styleUrls: ['alert-switching.component.scss'],
})
export class AlertSwitchingComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AlertSwitchingComponent>,) {
    //--- disable backdrop dialog
    this.dialogRef.disableClose = true;
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}