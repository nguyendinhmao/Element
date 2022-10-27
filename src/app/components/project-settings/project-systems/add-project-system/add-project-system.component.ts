import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ProjectSystemCreationModel } from 'src/app/shared/models/project-settings/project-system.model';
import { ProjectSystemService } from 'src/app/shared/services/api/project-settings/project-system.service';
import { NgForm } from '@angular/forms';
import { Configs } from '../../../../shared/common/configs/configs';
import { ActivatedRoute } from '@angular/router';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

@Component({
  selector: 'add-project-system',
  templateUrl: './add-project-system.component.html',
  styleUrls: ['./add-project-system.component.scss']
})

export class AddProjectSystemComponent implements OnInit {
  // @Input() visible: boolean = false;
  // @Output() onSuccess: EventEmitter<boolean> = new EventEmitter();
  // @Input() creationModel: ProjectSystemCreationModel;
  // defaultLogoUrl: string = Configs.DefaultClientLogo;
  // logoUrl: string;
  // isLogoExist: boolean;

  // constructor(
  //   public clientState: ClientState,
  //   public projectSystemService: ProjectSystemService,
  //   public activatedRoute: ActivatedRoute,
  //   private authErrorHandler: AuthErrorHandler
  // ) { }

  public ngOnInit() {
    // if (!this.creationModel) this.creationModel = new ProjectSystemCreationModel();
    // this.creationModel.projectId = this.activatedRoute.snapshot.params['projectKey'];
  }

  //--- Save data
  // onSaveData = (form: NgForm) => {
  //   if (!form || form.invalid) {
  //     return;
  //   }
  //   this.clientState.isBusy = true;
  //   let creationModel = <ProjectSystemCreationModel>{
  //     ...this.creationModel
  //   };
  //   this.projectSystemService.createProjectSystem(creationModel).subscribe({
  //     complete: () => {
  //       this.clientState.isBusy = false;
  //       this.onSuccess.emit(true);
  //     },
  //     error: (err: ApiError) => {
  //       this.clientState.isBusy = false;
  //       this.authErrorHandler.handleError(err.message);
  //     },
  //   });
  // }

  //--- Select logo
  // onSelectLogo = (event) => {
  //   let file: File = event.target.files && <File>event.target.files[0];

  //   if (file) {
  //     var reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = (event: any) => {
  //       this.logoUrl = event.target.result;
  //     }
  //     this.creationModel.logo = file;
  //     this.isLogoExist = true;
  //   }
  // }

  //--- Cancel logo
  // onCancelLogo = () => {
  //   this.creationModel.logo = null;
  //   this.isLogoExist = false;
  // }

  //--- Cancel form
  // onCancel = () => {
  //   this.onSuccess.emit(false);
  // }
}
