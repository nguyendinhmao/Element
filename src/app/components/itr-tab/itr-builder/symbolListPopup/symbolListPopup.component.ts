import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { ApiError } from "src/app/shared/models/api-response/api-response";
import { DashboardService } from 'src/app/shared/services/api/dashboard/dashboard.service';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

@Component({
  selector: "app-dashboard-child-symbol-list-popup",
  templateUrl: "./symbolListPopup.component.html",
  styleUrls: ["./symbolListPopup.component.scss"],
})

export class SymbolListPopupComponent implements OnInit {
  @Output() selected = new EventEmitter();
  listSymbol: any[];

  onSelectedSymbol(val: any) {
    this.selected.emit(val);
    document.getElementsByClassName("container-symbol-modal")[0].classList.add("d-none");
  }

  exchangeRawData(rawData: any) {
    let standartData = [];
    if (rawData)
      rawData.map((data) => {
        standartData.push(data.symbol);
      });
    return standartData;
  }

  constructor(
    private dashboardService: DashboardService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  ngOnInit(): void {
    this.dashboardService.getListSymbol().subscribe((res) => {
      this.listSymbol = this.exchangeRawData(res);
    }, (err: ApiError) => {
      this.authErrorHandler.handleError(err.message);
    });
  }
}
