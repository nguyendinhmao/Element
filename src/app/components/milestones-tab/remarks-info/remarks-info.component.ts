import { OnInit, Component, Input, Output, EventEmitter } from "@angular/core";
import { DrawingLookUpModel } from "src/app/shared/models/punch-page/punch-page.model";

@Component({
  selector: "remarks-info",
  templateUrl: "./remarks-info.component.html",
})
export class RemarksInfoComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() remarkModel: string[];
  constructor() {}

  public ngOnInit() {}

  onCancel = () => {
    this.onSuccess.emit(false);
  };
}
