import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { DashboardService } from "src/app/shared/services/api/dashboard/dashboard.service";
import { AuthErrorHandler } from "src/app/shared/services/auth/auth.error-handler";
import { EventFieldFromDataBase } from "../../../../shared/models/itr-tab/itr-builder-event-field-from-database.model";
@Component({
  selector: "app-dashboard-child-free-text-from-data-base-popup",
  templateUrl: "./freeTextFromDBPopup.component.html",
  styleUrls: ["./freeTextFromDBPopup.component.scss"],
})
export class FreeTextFormDataBasePopupComponent implements OnInit {
  @Output() selected = new EventEmitter();
  @Input() idFieldOfTableSelected: number = 0;
  @Input() idOfTableSelected: number = 0;

  listTable: any[];
  listFieldOfTable: any[];

  selectedTable = false;

  public showLoadingScreen: boolean;

  disabledSubmit = true;

  sendTableParent: any;

  sendFieldOfTableParent: any;

  constructor(
    private dashboardService: DashboardService,
    private authErrorHandler: AuthErrorHandler
  ) {}

  public ngOnInit() {
    this.showLoadingScreen = true;
    this.dashboardService.getListTableName().subscribe(
      (res) => {
        this.showLoadingScreen = false;
        let listTable = this.exchangeRawDATATABLEID(res);
        if (this.idOfTableSelected) {
          this.selectedTable = true;
          listTable.map(table=>{
            if (table.id===Number(this.idOfTableSelected)) {
              this.onChangeSelectTableName(table)
              return;
            }
          })
        }
        this.listTable = listTable;
      },
      (err: ApiError) => {
        this.showLoadingScreen = false;
        this.authErrorHandler.handleError(err.message);
      }
    );
  }

  disableClick(ev: any) {
    ev.stopPropagation();
  }

  onSelectedField(isSave: boolean) {
    const eventData: EventFieldFromDataBase = {
      isSave: isSave,
      tableId: this.sendTableParent?.id||0,
      fieldId: this.sendFieldOfTableParent?.id||0,
      tableName: this.sendTableParent?.name||'',
      FieldName: this.sendFieldOfTableParent?.name||'',
    };
    this.selected.emit(eventData);
  }

  onChangeSelectFieldFromDb(fieldProfile: any) {
    this.sendFieldOfTableParent = fieldProfile;
    this.disabledSubmit = false;
  }

  onChangeSelectTableName(tableProfile: any) {
    this.selectedTable = false;
    this.sendTableParent = tableProfile;
    const tableId = tableProfile.id;
    this.showLoadingScreen = true;
    this.dashboardService.getListField(tableId).subscribe(
      (res) => {
        this.listFieldOfTable = this.exchangeRawDataFieldName(res);
        this.showLoadingScreen = false;
        this.selectedTable = true;
      },
      (err: ApiError) => {
        this.showLoadingScreen = false;
      }
    );
  }

  exchangeRawDATATABLEID(rawData: any) {
    let standartData = [];
    if (rawData)
      rawData.map((data) => {
        standartData.push({
          id: data.id,
          name: data.name,
          value: data.value,
        });
      });
    return standartData;
  }

  exchangeRawDataFieldName(rawData: any) {
    let standartData = [];
    if (rawData)
      rawData.map((data) => {
        standartData.push({
          id: data.id,
          name: data.name,
          value: data.value,
          tableDefinition: data.tableDefinition,
          tableDefinitionId: data.tableDefinitionId,
        });
      });
    return standartData;
  }
}
