import { OnInit, Component, Input, Output, EventEmitter } from "@angular/core";
import { DrawingLookUpModel } from "src/app/shared/models/punch-page/punch-page.model";

@Component({
  selector: "drawings-info",
  templateUrl: "./drawings-info.component.html",
  styleUrls: ['./drawings-info.component.scss'],
})
export class DrawingsInfoComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() drawingLookUpModel: DrawingLookUpModel[];
  constructor() { }

  public ngOnInit() { }

  onCancel = () => {
    this.onSuccess.emit(false);
  };
}
