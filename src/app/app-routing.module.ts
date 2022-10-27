import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppLayoutComponent } from './components/_layout';
import {
  LoginComponent,
  DashboardComponent,
  DataTabComponent,
  PunchItemComponent,
  ProgressTabComponent,
  LimitsTabComponent,
  ForgotPasswordComponent,
  ResetPasswordComponent,
  PersonalInformationComponent,
  ChangePasswordComponent,
  MilestonesTabComponent,
  SignatureHandoverComponent,
  PreservationPageSetupComponent,
  PreservationTabComponent,
  DetailPreservationComponent,
  RegisterComponent,
  UserManagementComponent,
  ProjectManagementComponent,
  ProjectSettingsComponent,
  CompanyManagementComponent,
  ActivateAccountComponent,
  NotFoundComponent,
  UnauthorizeAccessComponent,
  AccessDeniedComponent,
  NoProjectAllocatedComponent,
  ITRAdminComponent,
  ITRAllocationComponent,
  DetailItrAllocationComponent,
  PreservationAllocationComponent,
  DetailPreservationAllocationComponent,
  TagTabComponent,
  ITRBuilderDetailComponent,
  ITRBuilderComponent,
  PunchPageSetupComponent,
  ItrPageSetupComponent,
  RoleManagementComponent,
  ChangePinCodeComponent,
  MyPunchComponent,
  DetailMyPunchPageComponent,
  ChangePageSetupComponent,
  MyChangeComponent,
  ChangeItemComponent,
  ChangeDetailComponent,
  MilestonesPageSetupComponent,
  AllocatedITRsComponent,
} from './components';

export const routes: Routes = [
  {
    path: '', component: AppLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/dashboard', component: DashboardComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/data-tab', component: DataTabComponent },

      { path: 'modules/:moduleKey/project-settings/:projectKey/itr-setup', component: ItrPageSetupComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/itr-admin', component: ITRAdminComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/itr-allocation', component: ITRAllocationComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/itr-allocation/:equipmentCode', component: DetailItrAllocationComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/preservation-allocation', component: PreservationAllocationComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/preservation-allocation/:equipmentCode', component: DetailPreservationAllocationComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/itr-builder', component: ITRBuilderComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/itr-builder/:itrNo', component: ITRBuilderDetailComponent },

      { path: 'modules/:moduleKey/projects/:projectKey/tag-tab', component: TagTabComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/tag-tab/:recordId', component: AllocatedITRsComponent },
      { path: 'modules/:moduleKey/project-settings/:projectKey/change-setup', component: ChangePageSetupComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/my-change', component: MyChangeComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/change-tab', component: ChangeItemComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/change-tab/:changeId', component: ChangeDetailComponent },

      { path: 'modules/:moduleKey/project-settings/:projectKey/punch-setup', component: PunchPageSetupComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/my-punch', component: MyPunchComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/punch-tab', component: PunchItemComponent },

      { path: 'modules/:moduleKey/projects/:projectKey/progress-tab', component: ProgressTabComponent },

      { path: 'projects/limits-tab', component: LimitsTabComponent },

      { path: 'modules/:moduleKey/project-settings/:projectKey/milestones-setup', component: MilestonesPageSetupComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/milestones-tab', component: MilestonesTabComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/record-handover/:recordId', component: SignatureHandoverComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/record-handover-off/:handoverId', component: SignatureHandoverComponent },

      { path: 'modules/:moduleKey/project-settings/:projectKey/preservation-setup', component: PreservationPageSetupComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/preservation-tab', component: PreservationTabComponent },
      { path: 'modules/:moduleKey/projects/:projectKey/preservation-tab/:preservationId', component: DetailPreservationComponent },

      { path: 'modules/:moduleKey/project-management', component: ProjectManagementComponent },
      { path: 'modules/:moduleKey/project-settings/:projectKey', component: ProjectSettingsComponent },

      { path: 'user-management', component: UserManagementComponent },
      { path: 'company-management', component: CompanyManagementComponent },

      { path: 'personal-information', component: PersonalInformationComponent },
      { path: 'change-password', component: ChangePasswordComponent },

      { path: 'role-management', component: RoleManagementComponent },
      { path: 'change-pincode', component: ChangePinCodeComponent },
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:userId', component: ResetPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'activate-account', component: ActivateAccountComponent },
  { path: 'unauthorize-access', component: UnauthorizeAccessComponent },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: 'not-project-allocated', component: NoProjectAllocatedComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
