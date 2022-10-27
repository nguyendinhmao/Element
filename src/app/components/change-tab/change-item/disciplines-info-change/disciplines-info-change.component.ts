import { OnInit, Component, Input, Output, EventEmitter } from "@angular/core";
import { DisciplineLookUpModel } from 'src/app/shared/models/data-tab/data-discipline.model';

@Component({
  selector: "disciplines-info-change",
  templateUrl: "./disciplines-info-change.component.html",
})
export class DisciplinesInfoChangeComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() disciplineLookUpModel: DisciplineLookUpModel[];
  
  constructor() { }

  public ngOnInit() { }

  onCancel = () => {
    this.onSuccess.emit(false);
  };
}
