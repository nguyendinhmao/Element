import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JwtTokenHelper } from 'src/app/shared/common';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { ModuleProjectDefaultModel } from 'src/app/shared/models/module/module.model';
import { DrawingsExtension } from 'src/app/shared/models/tab-tag/tab-tag.model';
import { ClientState, IdbService, PinchService } from 'src/app/shared/services';
import { TagTabService } from 'src/app/shared/services/api/tag-tab/tag-tab.service';
declare var $: any;

@Component({
  selector: 'tag-preview-drawing',
  templateUrl: './tag-preview-drawing.component.html',
  styleUrls: ['./tag-preview-drawing.component.scss'],
})
export class TagPreviewDrawingComponent implements OnInit, OnDestroy {
  //--- Variable
  extension = DrawingsExtension;
  fileName: string = '';
  currentDrawingIndex: number = 0;
  drawingData = [];
  startIndex = 0;

  //--- Model
  moduleProjectDefaultModel: ModuleProjectDefaultModel = new ModuleProjectDefaultModel();
  zoomLevels = [
    'page-width', 1, 1.5, 2, 3, 4, 6, 10
  ]
  defaultZoom4Web = "page-width";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TagPreviewDrawingComponent>,
    private tagTabService: TagTabService,
    public clientState: ClientState,
    private idbService: IdbService,
    private pinchService: PinchService,
  ) {
    //--- disable backdrop dialog
    this.dialogRef.disableClose = true;
  }

  public ngOnInit() {
    if (this.isOffline) {
      const _snTags = StoreNames.tags;
      const _snDrawings = StoreNames.drawings;
      this.idbService.getItem(_snTags, this.data.tagId).then((currentTag) => {
        const _drawingIds = currentTag.drawingIds as string[];
        this.idbService.getAllData(_snDrawings).then((_drawings) => {
          _drawings.forEach(_d => {
            if (_drawingIds.some(_id => _id === _d.drawingId) && _d.url !== null) {
              (this.drawingData.push(_d));
            }
          });
          this.executeAfterGetDrawings();
        });
      });
    } else {
      if (this.data.drawings) {
        const _drawings = this.data.drawings.filter(_d => _d.url !== null);
        this.drawingData = [..._drawings];
        this.executeAfterGetDrawings();
      } else {
        this.moduleProjectDefaultModel = JwtTokenHelper.GetModuleProjectDefault();
        this.onGetDrawings();
      }
    }

    // Listen carousel's changes
    $('#tagPreviewDrawings').on('slide.bs.carousel', ($event) => {
      let _index = $event.to;
      this.currentDrawingIndex = _index;
      this.fileName = `${this.drawingData.length > 0 ? this.drawingData[this.currentDrawingIndex].fileName : 'no_name'}`;
    });
  }

  ngOnDestroy() {
    this.fileName = '';
    this.currentDrawingIndex = null;
    this.drawingData = [];
    this.pinchService.destroyPinchZoom();
  }

  //--- Check info device
  get isTablet() {
    return InfoDevice.isTablet;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  onGetDrawings() {
    this.clientState.isBusy = true;
    this.tagTabService.getTagDrawingList(this.moduleProjectDefaultModel.projectKey, this.data.tagId).subscribe((res) => {
      const _drawings = res && res.content ? res.content : [];
      this.drawingData = [..._drawings.filter(_d => _d.url !== null)];
      this.executeAfterGetDrawings();
      this.clientState.isBusy = false;
    }, (err) => {
      this.clientState.isBusy = false;
    });
  }

  executeAfterGetDrawings() {
    this.currentDrawingIndex = this.startIndex = this.drawingData.findIndex(_d => _d.drawingId === this.data.drawingId);
    this.fileName = `${this.drawingData.length > 0 && this.drawingData[this.currentDrawingIndex].fileName ? this.drawingData[this.currentDrawingIndex].fileName : 'no_name'}`;
    this.moveToStart();
    setTimeout(() => {
      if (document.getElementById('viewer')) {
        document.getElementById('viewer').style.width = '100%';
        this.pinchService.initializePinchZoom();
      }
    }, 100);
  }

  getSrcImg(src: string, type: string = null) {
    if (type) {
      return src && type ? `data:image/${type};base64,${src}` : '';
    }
    return src;
  }

  moveToStart() {
    $('#tagPreviewDrawings').carousel(this.currentDrawingIndex);
  }

  downloadDrawing() {
    window.open(this.drawingData[this.currentDrawingIndex].url);
  }

  getSrcPdf(src: string) {
    return `${src}`;
  }

  pdfLoaded($event) {
    console.log($event);
  }

  onMoveSlides(command: string) {
    $('#tagPreviewDrawings').carousel(command);
    setTimeout(() => {
      if (document.getElementById('viewer')) {
        document.getElementById('viewer').style.width = 'fit-content';
        this.pinchService.initializePinchZoom();
      }
    }, 100);
  }

  // Utils
  extractType = (fileName: string) => {
    if (!fileName) { return ''; }
    return (fileName.split('.'))[1].toLowerCase();
  }
  check = (extensions: string[], extensionF: string) => {
    if (!extensionF) { return false; }
    return extensions.some(_e => _e === extensionF);
  }
}
