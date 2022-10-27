import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ProjectSystemUpdationModel } from 'src/app/shared/models/project-settings/project-system.model';
import { Configs } from 'src/app/shared/common/configs/configs';
import { ProjectSystemService } from 'src/app/shared/services/api/project-settings/project-system.service';
import { ToastrService } from 'ngx-toastr';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { NgForm } from '@angular/forms';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

@Component({
  selector: 'edit-data-system',
  templateUrl: './edit-data-system.component.html',
  styleUrls: ['./edit-data-system.component.scss']
})

export class EditDataSystemComponent implements OnInit {
  @Input() visible: boolean;
  @Input() systemId: string;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() logoUrl: string;
  @Input() updationModel : ProjectSystemUpdationModel;

  updationModelLogoUrl: string;
  defaultLogoUrl: string = Configs.DefaultClientLogo;
  isLogoExist: boolean;

  constructor(
    public clientState: ClientState,
    public projectSystemService: ProjectSystemService,
    private toastr: ToastrService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  ngOnInit(): void {
    if (!this.updationModel) this.updationModel = new ProjectSystemUpdationModel();
  }

  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    let systemUpdationModel = <ProjectSystemUpdationModel>{
      ...this.updationModel
    };
    this.projectSystemService.updateProjectSystem(systemUpdationModel).subscribe({
      complete: () => {
        this.clientState.isBusy = false;
        this.onSuccess.emit(true);
      },
      error: (err: ApiError) => {
        this.clientState.isBusy = false;
        this.authErrorHandler.handleError(err.message);
      },
    });
  }

  //--- Select logo
  onSelectLogo = (event) => {
    let file: File = event.target.files && <File>event.target.files[0];

    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        this.updationModelLogoUrl = event.target.result;
      }
      this.updationModel.logo = file;
      this.isLogoExist = true;
    }
  }

  //--- Cancel logo
  onCancelLogo = () => {
    this.updationModel.logoUrl = null;
    this.updationModel.logo = null;
    this.logoUrl = null;
    this.isLogoExist = false;
  }

  //--- Cancel form
  onCancel = () => {
    this.onSuccess.emit(false);
  }
}