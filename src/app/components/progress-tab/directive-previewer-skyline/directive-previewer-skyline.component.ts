import { OnInit, Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { SkylineRenderModel, SkylineReportConstant } from "src/app/shared/models/progress-tab/progress-tab.model";

@Component({
  selector: "directive-previewer-skyline",
  templateUrl: "./directive-previewer-skyline.component.html",
  styleUrls: ['./directive-previewer-skyline.component.scss']
})

export class DirectivePreviewerSkylineComponent implements OnInit, OnChanges {
  @Input() data2Drawing: Array<SkylineRenderModel> = new Array();
  @Input() isPdfShow: boolean = true;

  CHUNK_SIZE_CONSTANT = SkylineReportConstant.MAX_ROWS_PDF;
  removeHandleScrollbar = false;
  renderModel = {};

  ngOnInit() {
    if (this.data2Drawing) {
      let _countCols = 0;
      const _elContentId = this._createGuid();
      document.getElementById('contentSkyline').id = _elContentId;
      this.data2Drawing.forEach((_item, i) => {
        this.renderModel[i] = this.separateHandovers(this.isPdfShow ? _item.items4Pdf : _item.handoverItems, this.CHUNK_SIZE_CONSTANT);
        _countCols += this.renderModel[i].length === 0 ? 1 : this.renderModel[i].length;
      });
      const _contentWidth = document.getElementById(_elContentId).offsetWidth;
      const _cols = _contentWidth ? Math.floor((_contentWidth - SkylineReportConstant.MAX_REST_SKYLINE) / SkylineReportConstant.MAX_CELL_WIDTH) : SkylineReportConstant.MAX_COLS_PDF;
      this.removeHandleScrollbar = this.isPdfShow ? this.isPdfShow : _countCols < _cols;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data2Drawing.isFirstChange()
      && this.data2Drawing
      && JSON.stringify(changes.data2Drawing.currentValue) !== JSON.stringify(changes.data2Drawing.previousValue)) {
      let _countCols = 0;
      const _elContentId = this._createGuid();
      document.getElementById('contentSkyline').id = _elContentId;
      this.data2Drawing.forEach((_item, i) => {
        this.renderModel[i] = this.separateHandovers(this.isPdfShow ? _item.items4Pdf : _item.handoverItems, this.CHUNK_SIZE_CONSTANT);
        _countCols += this.renderModel[i].length === 0 ? 1 : this.renderModel[i].length;
      });
      const _contentWidth = document.getElementById(_elContentId).offsetWidth;
      const _cols = _contentWidth ? Math.floor((_contentWidth - SkylineReportConstant.MAX_REST_SKYLINE) / SkylineReportConstant.MAX_CELL_WIDTH) : SkylineReportConstant.MAX_COLS_PDF;
      this.removeHandleScrollbar = this.isPdfShow ? this.isPdfShow : _countCols < _cols;
    }
  }

  separateHandovers(items: Array<any>, chunk_size: number) {
    if (!items) { return new Array(); }
    let _result = new Array();
    var index = 0;
    var arrayLength = items.length;

    for (index = 0; index < arrayLength; index += chunk_size) {
      const _cChunk = items.slice(index, index + chunk_size);
      _result.push(_cChunk.reverse());
    }
    return _result;
  }

  convertDateString(dateString) {
    if (dateString) {
      return (new Date(dateString)).toLocaleDateString('es-ES');
    }
    return null;
  }

  _createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}