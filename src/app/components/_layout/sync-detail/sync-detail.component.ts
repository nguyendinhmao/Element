import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SyncResponse } from "src/app/shared/models/common/common.model";

@Component({
  selector: 'sync-detail',
  templateUrl: './sync-detail.component.html',
  styleUrls: ['./sync-detail.component.scss'],
})

export class SyncDetailComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SyncDetailComponent>
  ) {
    //--- disable backdrop dialog
    this.dialogRef.disableClose = true;
  }

  get syncData() {
    const _sD = this.data as {
      dataRequest: SyncResponse,
      dataResponse: SyncResponse,
    };
    return _sD.dataResponse ? _sD.dataResponse : _sD.dataRequest;
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {

  }
}