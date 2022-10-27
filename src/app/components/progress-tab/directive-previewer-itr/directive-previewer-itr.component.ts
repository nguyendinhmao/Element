import { OnInit, Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { DetailItrRenderModel } from "src/app/shared/models/progress-tab/progress-tab.model";
declare var $: any

@Component({
  selector: "directive-previewer-itr",
  templateUrl: "./directive-previewer-itr.component.html",
  styleUrls: ['./directive-previewer-itr.component.scss']
})

export class DirectivePreviewerItrComponent implements OnInit, OnChanges {
  @Input() data2Drawing: Array<DetailItrRenderModel> = new Array();
  @Input() isPdfShow: boolean = true;

  removeHandleScrollbar = false;
  renderModel = {};

  ngOnInit() {
    if (this.data2Drawing) {
      const _elContentId = this._createGuid();
      document.getElementById('contentItr').id = _elContentId;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data2Drawing.isFirstChange()
      && this.data2Drawing
      && JSON.stringify(changes.data2Drawing.currentValue) !== JSON.stringify(changes.data2Drawing.previousValue)) {
      const _elContentId = this._createGuid();
      document.getElementById('contentItr').id = _elContentId;
    }
  }

  getList(section) {
    return this.isPdfShow ? section.items4Pdf : section.itrTags;
  }

  _createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}