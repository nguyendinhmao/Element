import { Component, OnInit, Input } from '@angular/core';
import { ClientState } from 'src/app/shared/services/client/client-state';
import { ApiError } from 'src/app/shared/models/api-response/api-response';
import { ProjectLevelListItem, ProjectLevelUpdationItem, ProjectLevelUpdationModel } from 'src/app/shared/models/project-settings/project-level.model';
import { ProjectLevelService } from 'src/app/shared/services/api/project-settings/project-level.service';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthErrorHandler } from 'src/app/shared/services/auth/auth.error-handler';

@Component({
  selector: 'project-levels',
  templateUrl: './project-levels.component.html'
})
export class ProjectLevelsComponent implements OnInit {
  @Input() projectId: string;

  projectLevels: ProjectLevelListItem[] = [];

  constructor(
    public clientState: ClientState,
    public projectLevelService: ProjectLevelService,
    public activatedRoute: ActivatedRoute,
    public toastr: ToastrService,
    private authErrorHandler: AuthErrorHandler
  ) { }

  ngOnInit() {
    if (this.projectId && this.projectId != "") this.onGetLevelData();
  }

  onGetLevelData = () => {
    this.clientState.isBusy = true;
    this.projectLevelService.getProjectLevelList(this.projectId).subscribe(res => {
      this.projectLevels = res ? <ProjectLevelListItem[]>[...res.content] : [];
      var itemCount = this.projectLevels.length;
      if (itemCount < 5) {
        for (var i = 1; i < 6 - itemCount; i++) {
          this.projectLevels.push(<ProjectLevelListItem>{
            levelName: "Level " + i.toString()
          });
        }
      }
      this.clientState.isBusy = false;
    }, (err: ApiError) => {
      this.clientState.isBusy = false;
      this.authErrorHandler.handleError(err.message);
    });
  }

  onSaveData = (form: NgForm) => {
    if (!form || form.invalid) {
      return;
    }
    let levels = this.projectLevels.map(x => <ProjectLevelUpdationItem>{
      levelId: x.levelId || 1,
      levelName: x.levelName,
      levelValue: x.levelValue,
      isDelete: !x.levelValue || x.levelValue.length == 0 ? true : false,
      projectLevelId: x.projectLevelId
    });
    let updationModel = <ProjectLevelUpdationModel>{
      projectId: this.projectId,
      projectLevels: levels
    };

    this.clientState.isBusy = true;
    this.projectLevelService.updateProjectLevel(updationModel).subscribe(res => {
      this.clientState.isBusy = false;
      this.toastr.success('Update project levels successfully');
      this.onGetLevelData();
    }, (err: ApiError) => {
      this.authErrorHandler.handleError(err.message);
      this.clientState.isBusy = false;
    });
  }

  onResetData = () => {
    this.onGetLevelData();
  }

  checkLevel = (item: ProjectLevelListItem) => {
    if (item.projectLevelId && !item.isDelete) item.isDelete = true;
    else if (item.isDelete) item.isDelete = false;
  }
}
