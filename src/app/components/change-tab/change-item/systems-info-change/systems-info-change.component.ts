import { OnInit, Component, Input, Output, EventEmitter } from "@angular/core";
import { SystemLookUpModel } from 'src/app/shared/models/data-tab/data-system.model';

@Component({
  selector: "systems-info-change",
  templateUrl: "./systems-info-change.component.html",
})
export class SystemsInfoChangeComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() systemLookUpModel: SystemLookUpModel[];
  constructor() {}

  public ngOnInit() {}

  onCancel = () => {
    this.onSuccess.emit(false);
  };
}
