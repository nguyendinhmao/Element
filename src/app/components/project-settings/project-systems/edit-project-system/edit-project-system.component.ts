import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ProjectSystemUpdationModel } from 'src/app/shared/models/project-settings/project-system.model';
import { ProjectSystemService } from 'src/app/shared/services/api/project-settings/project-system.service';
import { NgForm } from '@angular/forms';
import { Configs } from '../../../../shared/common/configs/configs';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

@Component({
  selector: 'edit-project-system',
  templateUrl: './edit-project-system.component.html',
  styleUrls: ['./edit-project-system.component.scss']
})

export class EditProjectSystemComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  @Input() updationModel: ProjectSystemUpdationModel;
  @Input() logoUrl: string;
  defaultLogoUrl: string = Configs.DefaultClientLogo;
  isLogoExist: boolean;

  constructor(
    public clientState: ClientState,
    public projectSystemService: ProjectSystemService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  public ngOnInit() {
    if (!this.updationModel) this.updationModel = new ProjectSystemUpdationModel();
  }

  //--- Save data
  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    this.clientState.isBusy = true;
    let updationModel = <ProjectSystemUpdationModel>{
      ...this.updationModel
    };
    this.projectSystemService.updateProjectSystem(updationModel).subscribe({
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
        this.logoUrl = event.target.result;
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
