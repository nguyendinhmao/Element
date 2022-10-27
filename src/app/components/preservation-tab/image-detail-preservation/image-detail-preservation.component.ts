import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lightbox } from 'ngx-lightbox';
import { Constants, JwtTokenHelper, PermissionsViews } from 'src/app/shared/common';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { StoreNames } from 'src/app/shared/models/common/common.model';
import { InfoDevice } from 'src/app/shared/models/common/global-variables';
import { DetailPreservationTabModel, ImageLookUpPres, PreservationElementImagesCommand } from 'src/app/shared/models/preservation-tab/preservation-tab.model';
import { AuthInProjectDto } from 'src/app/shared/models/project-management/project-management.model';
import { AuthErrorHandler, ClientState, IdbService } from 'src/app/shared/services';
import { PreservationTabServices } from 'src/app/shared/services/api/preservation-tab/preservation-tab.service';
import { __importDefault } from 'tslib';

@Component({
  selector: "image-detail-preservation",
  styleUrls: ["./image-detail-preservation.component.scss"],
  templateUrl: "./image-detail-preservation.component.html",
})

export class ImageDetailPreservationComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() imageLookUpModel: ImageLookUpPres[];
  @Input() elementId: string;
  @Input() isInitialImageDelete: boolean = true;

  //--- Boolean
  isShowImages: boolean = false;

  permissionsViews = PermissionsViews;
  authInProjectDto: AuthInProjectDto[] = [];

  sub: any;
  projectKey: string;

  //--- Model
  detailImages = [];
  preservationImages = [];
  images: File[] = [];
  deleteImages = [];
  initialImages = [];

  constructor(
    private lightbox: Lightbox,
    private preservationTabServices: PreservationTabServices,
    public clientState: ClientState,
    private authErrorHandler: AuthErrorHandler,
    private route: ActivatedRoute,
    private router: Router,
    private idbService: IdbService,
  ) {
    this.sub = this.route.params.subscribe(params => {
      this.projectKey = params['projectKey'];
      if (!this.projectKey) {
        this.router.navigate([""]);
      }
    });

    this.authInProjectDto = JwtTokenHelper.GetAuthProject()
      ? <AuthInProjectDto[]>[...JwtTokenHelper.GetAuthProject()]
      : [];
  }

  ngOnInit(): void {
    this.onLoadImagesPreservation();
    this.initialImages = this.detailImages;
  }

  get isOffline() {
    return InfoDevice.isOffline;
  }

  onCheckPermission = (key: string) => {
    return JwtTokenHelper.IsAuthInProject(key, this.authInProjectDto);
  };

  onLoadImagesPreservation = () => {
    this.clientState.isBusy = true;
    if (this.imageLookUpModel && this.imageLookUpModel.length > 0) {
      this.imageLookUpModel.forEach(element => {
        this.detailImages.push({
          id: element.drawingId,
          name: element.name,
          src: this.isOffline ? element.base64 : element.url,
          base64: element.base64,
        })
      });
      this.isShowImages = true;
    }
    this.clientState.isBusy = false;
  }

  onFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.readAsDataURL(event.target.files[i]);
        reader.onload = (e: any) => {
          this.preservationImages.push({
            id: i,
            image: event.target.files[i],
            imgUrl: e.target.result,
            src: e.target.result
          });
        }
        this.images.push(event.target.files[i])
      }
    }
  }

  openDetailImages(index: number): void {
    this.lightbox.open(this.detailImages, index, { centerVertically: true, showImageNumberLabel: true, alwaysShowNavOnTouchDevices: true, enableTransition: true });
  }

  openPreservationImages(index: number): void {
    this.lightbox.open(this.preservationImages, index, { centerVertically: true, showImageNumberLabel: true, alwaysShowNavOnTouchDevices: true, enableTransition: true });
  }

  onRemoveImage = (image) => {
    this.preservationImages = this.preservationImages.filter(img => img != image);
    this.images = this.images.filter(img => img != image.image);
  }

  onRemoveImageInitial = (image) => {
    let _delImg = this.detailImages.find(i => i['id'] == image['id']);
    this.deleteImages.push(_delImg);
    this.detailImages = this.detailImages.filter(img => img != image);
    if (this.detailImages.length <= 0) {
      this.isShowImages = false;
    }
  }

  onSaveImages() {
    if (this.isOffline) {
      const _deleteImageIds: Array<string> = this.deleteImages.map(_i => (_i.drawingId));
      let _uImages = this.detailImages.filter(_dI => !(_deleteImageIds.some(_delId => _delId === _dI.drawingId)));
      const _newImages = this.preservationImages.map(_i => ({
        id: null,
        name: '',
        src: _i.src,
        base64: _i.src,
      }));
      _uImages.push(..._newImages);

      const _snPreservation = StoreNames.preservation;
      this.idbService.getItem(_snPreservation, this.elementId).then(res => {
        const _preservation: DetailPreservationTabModel = res ? { ...res } as DetailPreservationTabModel : null;
        // update tag preservation change
        const _snTagPreservation = StoreNames.tagPreservation;
        this.idbService.getItem(_snTagPreservation, _preservation.tagId).then(_tP => {
          this.idbService.updateItem(_snTagPreservation, { ..._tP, ...{ isChanged: true } }, _tP.tagId);
        });
        this.idbService.updateItem(_snPreservation, { ..._preservation, ...{ isUpdated: true, images: [..._uImages] } }, this.elementId);
        setTimeout(() => {
          this.onSuccess.emit(true);
          // this.clientState.isBusy = false;
          this.authErrorHandler.handleSuccess(Constants.PreservationElementImageUploaded);
        }, 500);
      });
    } else {
      this.clientState.isBusy = true;
      let _uploadImages: PreservationElementImagesCommand = new PreservationElementImagesCommand();
      let _delImages = [];
      if (this.deleteImages.length > 0) {
        this.deleteImages.forEach(i => {
          _delImages.push({
            drawingId: i['id'],
            name: i['name'],
            url: i['src'],
          })
        });
      }
      _uploadImages.projectKey = this.projectKey;
      _uploadImages.deleteImages = _delImages;
      _uploadImages.preservationId = this.elementId;
      this.preservationTabServices.uploadElementImages(_uploadImages, this.images).subscribe(res => {
        this.onSuccess.emit(true);
        this.clientState.isBusy = false;
        this.authErrorHandler.handleSuccess(Constants.PreservationElementImageUploaded);
      }, (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      });
    }
  }

  isShowListImage() {
    return (this.preservationImages.length > 0)
  }

  isSaveShow() {
    return (this.preservationImages.length > 0) || (this.deleteImages.length > 0);
  }

  onCancel() {
    this.onSuccess.emit(false);
  }
}