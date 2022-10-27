import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TagDrawingModel } from 'src/app/shared/models/tab-tag/tab-tag.model';
import { TagPreviewDrawingComponent } from '../tag-preview-drawing/tag-preview-drawing.component';

@Component({
  selector: 'tag-drawings-info',
  templateUrl: './tag-drawings-info.component.html',
  styleUrls: ['./tag-drawings-info.component.scss'],
})
export class TagDrawingsInfoComponent implements OnInit {
  @Input() visible = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() drawings: TagDrawingModel[];
  @Input() tagId = '';
  @Input() isPreview = true;
  constructor(public dialog: MatDialog) { }

  public ngOnInit() { }

  openPreview(drawingId: string) {
    const dialogRef = this.dialog.open(TagPreviewDrawingComponent, {
      width: '96vw',
      height: '96vh',
      maxWidth: '96vw',
      data: {
        drawingId: drawingId,
        drawings: this.drawings,
        tagId: this.tagId,
      },
      panelClass: 'custom-modalbox',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  downloadDrawing(url: string) {
    window.open(url);
  }

  switchFunc(drawing: TagDrawingModel) {
    if (this.isPreview) {
      this.openPreview(drawing.drawingId);
    } else {
      this.downloadDrawing(drawing.url)
    }
  }

  onCancel = () => {
    this.onSuccess.emit(false);
  }
}
