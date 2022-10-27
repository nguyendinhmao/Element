import { OnInit, Component, Input, Output, EventEmitter, OnChanges, SimpleChange, SimpleChanges } from "@angular/core";
import { Type2Switch } from "src/app/shared/models/report-type/report-type";

@Component({
  selector: "directive-progress",
  templateUrl: "./directive-progress.component.html",
  styleUrls: ['./directive-progress.component.scss']
})

export class DirectiveProgressComponent implements OnInit, OnChanges {
  @Input() data: Array<ViewLookup> = new Array();
  @Input() type: string = Type2Switch.text;
  @Input() fieldName: string = '';
  @Input() fieldValue: any = null;
  @Input() avoidPastDate: any = null;
  @Input() defaultV: string = null;
  @Input() placeholder: string = null;
  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  //#region boolean variables
  isLoadingSelection = false;
  //#endregion boolean variables

  //#region common variables
  type2Switch = Type2Switch;
  bufferSize = 30;
  dataView: Array<ViewLookup> = new Array();
  //#endregion common variables

  constructor() {
  }

  public ngOnInit() {
    if (this.defaultV && !this.fieldValue) {
      this.fieldValue = this.defaultV;
      let _finalR;
      switch (this.type) {
        case this.type2Switch.date:
        case this.type2Switch.text:
          _finalR = this.fieldValue;
          break;
        case this.type2Switch.dropdown:
          if (this.data) {
            _finalR = this.data.find(_item => _item.id === this.fieldValue);
          }
          break;
        case this.type2Switch.multiSelect:
          if (this.data) {
            _finalR = this.data.filter(_item => (this.fieldValue.indexOf(_item.id) > -1));
          }
          break;
      }
      setTimeout(() => {
        this.change.emit(_finalR);
      }, 100);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fieldValue && !changes.fieldValue.currentValue && !changes.fieldValue.isFirstChange()) {
      this.fieldValue = this.defaultV;
      let _finalR;
      switch (this.type) {
        case this.type2Switch.date:
        case this.type2Switch.text:
          _finalR = this.fieldValue;
          break;
        case this.type2Switch.dropdown:
          if (this.data) {
            _finalR = this.data.find(_item => _item.id === this.fieldValue);
          }
          break;
        case this.type2Switch.multiSelect:
          if (this.data) {
            _finalR = this.fieldValue ? this.data.filter(_item => (this.fieldValue.indexOf(_item.id) > -1)) : null;
          }
          break;
      }
      setTimeout(() => {
        this.change.emit(_finalR);
      }, 100);
    }
  }

  onChange(result: any, type: string) {
    let _finalR;
    switch (type) {
      case this.type2Switch.date:
        _finalR = result.value;
        break;
      case this.type2Switch.multiSelect:
      case this.type2Switch.dropdown:
        _finalR = result;
        break;
    }
    this.change.emit(_finalR);
  }

  //#region Just for selection
  onScrollToEndSelect() {
    if (this.data.length > this.bufferSize) {
      this.isLoadingSelection = true;
      const len = this.dataView.length;
      const more = this.data.slice(len, this.bufferSize + len);
      setTimeout(() => {
        this.isLoadingSelection = false;
        this.dataView = this.dataView.concat(more);
      }, 500);
    }
  }

  onSearchSelect = ($event) => {
    this.isLoadingSelection = true;
    if ($event.term == "") {
      this.dataView = this.data.slice(0, this.bufferSize);
      this.isLoadingSelection = false;
    } else {
      this.dataView = this.data;
      this.isLoadingSelection = false;
    }
  }

  onClearSelect() {
    this.dataView = this.data.slice(0, this.bufferSize);
  }

  onDeselected(id: string) {
    if (!id) { return; };
    this.fieldValue = this.fieldValue.filter(_id => _id !== id);
    const _finalR = this.data.filter(_item => (this.fieldValue.indexOf(_item.id) > -1));
    this.change.emit(_finalR);
  }
  //#endregion Just for selection
}

interface ViewLookup {
  id: string;
  value: string;
}