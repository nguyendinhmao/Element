import { OnInit, Component, Input, Output, EventEmitter } from "@angular/core";
import { SubSystemLookUpModel } from 'src/app/shared/models/data-tab/data-subsystem.model';

@Component({
  selector: "subsystems-info-change",
  templateUrl: "./subsystems-info-change.component.html",
})
export class SubSystemsInfoChangeComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() subSystemsLookUpModel: SubSystemLookUpModel[];
  constructor() {}

  public ngOnInit() {}

  onCancel = () => {
    this.onSuccess.emit(false);
  };
}
