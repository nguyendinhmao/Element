export class ProjectUserModel {
  projectUserId: number;
  userName: string;
  role: string;
}

export class ProjectMemberModel {
  projectMemberId: string;
  memberName: string;
  role: string;
  photoUrl: string;
  authorisationLevel: string;
}

export class ProjectMemberCreationModel {
  projectId: string;
  userId: string;
  projectRoleId: string;
  authorisationLevelId: string;
}

export class ProjectMemberUpdatingModel {
  projectMemberId: string;
  userId: string;
  projectRoleId: string;
  authorisationLevelId: string;
  projectId: string;
}

export class ProjectMemberDetailModel {
  projectMemberId: string;
  projectRoleId: string;
  memberId: string;
  authorisationLevelId: string;
}

export class ProjectRoleModel {
  id: string;
  roleName: string;
  code: string;
}

export class ProjectRoleCreationModel {
  projectId: string;
  roleIds: number[];
}
export class RoleLookupValueModel {
  id: string;
  value: string;
}
export class AuthorizationLookupValueModel {
  id: string;
  value: string;
}