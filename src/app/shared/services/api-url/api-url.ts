export class ApiUrl {
    //--- API Url
    static BaseUrl = "https://api.elements-hub.com";

  //--- Login
  public static Login = ApiUrl.BaseUrl + "/token";

  public static NotificationRL = ApiUrl.BaseUrl;

  //--- Get Dashboard Detail
  public static GetDashboardDetail = ApiUrl.BaseUrl + "/api/Dashboard/GetDashboardDetail";
  public static UpdateDashboardChart = ApiUrl.BaseUrl + "/api/Dashboard/UpdateDashboardChart";

  //--- Identity Access
  public static UserList = ApiUrl.BaseUrl + "/api/IdentityAccess/UserList";
  public static CreateUser = ApiUrl.BaseUrl + "/api/IdentityAccess/CreateNewUser";
  public static ActivateRegisteredUser = ApiUrl.BaseUrl + "/api/IdentityAccess/ActivateUser";
  public static RegisterUser = ApiUrl.BaseUrl + "/api/IdentityAccess/RegisterUser";
  public static ChangePassword = ApiUrl.BaseUrl + "/api/IdentityAccess/ChangePassword";
  public static ChangePinCode = ApiUrl.BaseUrl + "/api/IdentityAccess/ChangePinCode";
  public static CreatePinCode = ApiUrl.BaseUrl + "/api/IdentityAccess/CreatePinCode";
  public static RemovePinCode = ApiUrl.BaseUrl + "/api/IdentityAccess/RemovePinCode";
  public static ResetPassword = ApiUrl.BaseUrl + "/api/IdentityAccess/ResetPassword";
  public static AdminResetAccountPassword = ApiUrl.BaseUrl + "/api/IdentityAccess/ResetAccountPassword";
  public static ForgotPassword = ApiUrl.BaseUrl + "/api/IdentityAccess/VerifyEmail";
  public static GetUserProfile = ApiUrl.BaseUrl + "/api/IdentityAccess/UserDetail";
  public static UpdateUserProfile = ApiUrl.BaseUrl + "/api/IdentityAccess/UpdateProfile";
  public static GetUserLookUp = ApiUrl.BaseUrl + "/api/IdentityAccess/UsersLookup";

  //--- Users
  public static UpdateUser = ApiUrl.BaseUrl + "/api/Users/Update";
  public static DeactivateUser = ApiUrl.BaseUrl + "/api/Users/Deactivate";
  public static ActivateUser = ApiUrl.BaseUrl + "/api/Users/Activate";
  public static GetUserById = ApiUrl.BaseUrl + "/api/Users/GetById";

  //--- Company
  public static CompanyList = ApiUrl.BaseUrl + "/api/Company/CompanyList";
  public static CreateCompany = ApiUrl.BaseUrl + "/api/Company/CreateCompany";
  public static UpdateCompany = ApiUrl.BaseUrl + "/api/Company/UpdateCompany";
  public static DeleteCompany = ApiUrl.BaseUrl + "/api/Company/DeleteCompany";
  public static GetCompanyById = ApiUrl.BaseUrl + "/api/Company/CompanyDetail";
  public static CompanyLookup = ApiUrl.BaseUrl + "/api/Company/CompaniesLookup";

  //--- Project
  public static ProjectList = ApiUrl.BaseUrl + "/api/Project/ProjectList";
  public static CreateProject = ApiUrl.BaseUrl + "/api/Project/CreateProject";
  public static UpdateProject = ApiUrl.BaseUrl + "/api/Project/UpdateProject";
  public static DeleteProject = ApiUrl.BaseUrl + "/api/Project/DeleteProject";
  public static GetProjectByKey = ApiUrl.BaseUrl + "/api/Project/ProjectDetail";
  public static GetProjectStatusLookup = ApiUrl.BaseUrl + "/api/Project/ProjectStatusesLookup";
  public static UpdateProjectLogo = ApiUrl.BaseUrl + "/api/Project/UpdateProjectAvatar";
  public static ProjectByUser = ApiUrl.BaseUrl + "/api/Project/ProjectByUser";
  public static ProjectByUserAndModule = ApiUrl.BaseUrl + "/api/Project/ProjectByUserAndModule";
  public static ProjectLookup = ApiUrl.BaseUrl + "/api/Project/ProjectLookup";
  public static AuthInProject = ApiUrl.BaseUrl + "/api/Project/AuthInProject";

  //--- Project role
  public static ProjectRoleList = ApiUrl.BaseUrl + "/api/Project/GetListProjectRoleSetup";
  public static CreateProjectRole = ApiUrl.BaseUrl + "/api/Project/CreateProjectRoleSetup";
  public static DeleteProjectRole = ApiUrl.BaseUrl + "/api/Project/DeleteProjectRoleSetup";

  //--- Project member
  public static ProjectMemberList = ApiUrl.BaseUrl + "/api/Project/ProjectMemberList";
  public static CreateProjectMember = ApiUrl.BaseUrl + "/api/Project/AddProjectMember";
  public static UpdateProjectMember = ApiUrl.BaseUrl + "/api/Project/UpdateProjectMember";
  public static DeleteProjectMember = ApiUrl.BaseUrl + "/api/Project/DeleteProjectMember";
  public static GetProjectMemberById = ApiUrl.BaseUrl + "/api/Project/ProjectMemberDetail";
  public static GetProjectRolesLookup = ApiUrl.BaseUrl + "/api/Project/ProjectRolesLookup";
  public static GetProjectMembersLookup = ApiUrl.BaseUrl + "/api/Project/ProjectMembersLookup";
  public static GetAuthorizationLevelLookup = ApiUrl.BaseUrl + "/api/Project/AuthorisationLevelLookup";
  public static GetProjectRoleLookupByProjectKey = ApiUrl.BaseUrl + "/api/Project/GetProjectRoleByProjectKey";

  //--- Project milestone
  public static ProjectMilestoneSetupList = ApiUrl.BaseUrl + "/api/Project/ProjectMileStoneSetupList";
  public static UpdateProjectMilestones = ApiUrl.BaseUrl + "/api/Project/UpdateProjectMileStones";
  public static ResetProjectMileStones = ApiUrl.BaseUrl + "/api/Project/ResetProjectMileStones";

  //--- Project levels
  public static ProjectLevelList = ApiUrl.BaseUrl + "/api/Project/ProjectLevelList";
  public static UpdateProjectLevels = ApiUrl.BaseUrl + "/api/Project/UpdateProjectLevels";

  //--- Project system
  public static ProjectSystemList = ApiUrl.BaseUrl + "/api/Project/ElementSystemList";
  public static CreateProjectSystem = ApiUrl.BaseUrl + "/api/Project/CreateElementSystem";
  public static UpdateProjectSystem = ApiUrl.BaseUrl + "/api/Project/UpdateElementSystem";
  public static DeleteProjectSystem = ApiUrl.BaseUrl + "/api/Project/DeleteElementSystem";
  public static GetProjectSystemById = ApiUrl.BaseUrl + "/api/Project/ElementSystemDetail";

  //--- Data Location
  public static DataLocationList = ApiUrl.BaseUrl + "/api/DataTab/LocationList";
  public static GetLocationById = ApiUrl.BaseUrl + "/api/DataTab/LocationDetail";
  public static CreateLocation = ApiUrl.BaseUrl + "/api/DataTab/CreateLocation";
  public static UpdateLocation = ApiUrl.BaseUrl + "/api/DataTab/UpdateLocation";
  public static InsertLocationsViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertLocationsViaCsvFile";
  public static DeleteLocation = ApiUrl.BaseUrl + "/api/DataTab/DeleteLocation";

  //--- Data Equipment
  public static DataEquipmentList = ApiUrl.BaseUrl + "/api/DataTab/EquipmentList";
  public static GetEquipmentById = ApiUrl.BaseUrl + "/api/DataTab/EquipmentDetail";
  public static UpdateEquipment = ApiUrl.BaseUrl + "/api/DataTab/UpdateEquipment";
  public static CreateEquipment = ApiUrl.BaseUrl + "/api/DataTab/CreateEquipment";
  public static InsertEquipmentsViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertEquipmentsViaCsvFile";
  public static DeleteEquipment = ApiUrl.BaseUrl + "/api/DataTab/DeleteEquipment";

  //--- Data Discipline
  public static DataDisciplineList = ApiUrl.BaseUrl + "/api/DataTab/DisciplinesList";
  public static GetDisciplineById = ApiUrl.BaseUrl + "/api/DataTab/DisciplineDetail";
  public static CreateDiscipline = ApiUrl.BaseUrl + "/api/DataTab/CreateDiscipline";
  public static UpdateDiscipline = ApiUrl.BaseUrl + "/api/DataTab/UpdateDiscipline";
  public static InsertDisciplinesViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertDisciplinesViaCsvFile";
  public static DeleteDiscipline = ApiUrl.BaseUrl + "/api/DataTab/DeleteDiscipline";

  //--- Data System
  public static DataSystemList = ApiUrl.BaseUrl + "/api/DataTab/SystemList"
  public static GetSystemById = ApiUrl.BaseUrl + "/api/DataTab/EquipmentDetail";
  public static InsertSystemsViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertSystemsViaCsvFile";

  //--- Data Sub System
  public static DataSubSystemList = ApiUrl.BaseUrl + "/api/DataTab/SubSystemList";
  public static GetSubSystemById = ApiUrl.BaseUrl + "/api/DataTab/SubSystemDetail";
  public static CreateSubSystem = ApiUrl.BaseUrl + "/api/DataTab/CreateSubSystem";
  public static UpdateSubSystem = ApiUrl.BaseUrl + "/api/DataTab/UpdateSubSystem";
  public static InsertSubSystemsViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertSubSystemsViaCsvFile";
  public static DeleteSubSystem = ApiUrl.BaseUrl + "/api/DataTab/DeleteSubSystem";

  // --- Data Tag No
  public static TagList = ApiUrl.BaseUrl + "/api/DataTab/TagList";
  public static TagDetail = ApiUrl.BaseUrl + "/api/DataTab/TagDetail";
  public static UpdateTag = ApiUrl.BaseUrl + "/api/DataTab/UpdateTag";
  public static InsertTagsViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertTagsViaCsvFile";
  public static InsertDrawingTagsViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertDrawingTagsViaCsvFile";
  public static DeleteTag = ApiUrl.BaseUrl + "/api/DataTab/DeleteTag";
  public static TagTypeList = ApiUrl.BaseUrl + "/api/DataTab/TagTypeList";
  public static CreateTag = ApiUrl.BaseUrl + "/api/DataTab/CreateTag";
  public static TagDrawingLookUp = ApiUrl.BaseUrl + "/api/DataTab/TagDrawingLookUp";

  //--- Preservation Tab
  public static PreservationList = ApiUrl.BaseUrl + "/api/Preservation/PreservationList";
  public static TagPreservationPageList = ApiUrl.BaseUrl + "/api/TagPage/TagPreservationPageList";
  public static TagPreservationLookup = ApiUrl.BaseUrl + "/api/TagPage/TagPreservationLookup";
  public static PausePreservation = ApiUrl.BaseUrl + "/api/Preservation/PausePreservation";
  public static ResumePreservation = ApiUrl.BaseUrl + "/api/Preservation/ResumePreservation";
  public static StopPreservation = ApiUrl.BaseUrl + "/api/Preservation/StopPreservation";
  public static DeletePreservation = ApiUrl.BaseUrl + "/api/Preservation/DeletePreservation";
  public static AddPreservation = ApiUrl.BaseUrl + "/api/Preservation/AddPreservation";
  public static UpdateImagePreservation = ApiUrl.BaseUrl + "/api/Preservation/UpdateImagePreservation";
  public static SignOffPreservation = ApiUrl.BaseUrl + "/api/Preservation/SignOffPreservation";
  public static PreservationSignValidate = ApiUrl.BaseUrl + "/api/Preservation/PreservationSignValidate";
  public static PreservationElementLookUpByProjectKey = ApiUrl.BaseUrl + "/api/Preservation/PreservationElementLookUpByProjectKey";
  public static AddCommentPreservation = ApiUrl.BaseUrl + "/api/Preservation/AddCommentPreservation";
  public static DeleteCommentPreservation = ApiUrl.BaseUrl + "/api/Preservation/DeleteCommentPreservation";
  public static DownloadDataPreservation = ApiUrl.BaseUrl + "/api/Preservation/DownloadDataPreservation";
  public static LockTagPreservations = ApiUrl.BaseUrl + "/api/Preservation/LockTagPreservations";
  public static UnlockTagPreservations = ApiUrl.BaseUrl + "/api/Preservation/UnlockTagPreservations";

  //--- Data Workpack
  public static DataWorkpacksList = ApiUrl.BaseUrl + "/api/DataTab/WorkPackList";
  public static GetWorkpackById = ApiUrl.BaseUrl + "/api/DataTab/WorkPackDetail";
  public static CreateWorkPack = ApiUrl.BaseUrl + "/api/DataTab/CreateWorkPack";
  public static UpdateWorkpack = ApiUrl.BaseUrl + "/api/DataTab/UpdateWorkPack";
  public static InsertWorkpacksViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertWorkPacksViaCsvFile";
  public static DeleteWorkpack = ApiUrl.BaseUrl + "/api/DataTab/DeleteWorkPack";

  //--- Export excel
  public static ExportToExcel = ApiUrl.BaseUrl + "/api/Export/ExportData";

  //--- Module
  public static ModuleList = ApiUrl.BaseUrl + "/api/Module/ModuleList";
  public static GetModuleByUser = ApiUrl.BaseUrl + "/api/Module/GetModuleByUser";

  //-- Handover
  public static DataHandoverList = ApiUrl.BaseUrl + "/api/DataTab/HandoverList";
  public static GetHandoverById = ApiUrl.BaseUrl + "/api/DataTab/HandoverDetail";
  public static UpdateHandover = ApiUrl.BaseUrl + "/api/DataTab/UpdateHandover";
  public static InsertHandoversViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertHandoversViaCsvFile";
  public static DeleteHandover = ApiUrl.BaseUrl + "/api/DataTab/DeleteHandover";

  //--- Data Milestone
  public static DataMilestonesList = ApiUrl.BaseUrl + "/api/DataTab/MilestoneList";
  public static GetMilestoneById = ApiUrl.BaseUrl + "/api/DataTab/MilestoneDetail";
  public static CreateMilestone = ApiUrl.BaseUrl + "/api/DataTab/CreateMilestone";
  public static UpdateMilestone = ApiUrl.BaseUrl + "/api/DataTab/UpdateMilestone";
  public static InsertMilestonesViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertMilestonesViaCsvFile";
  public static DeleteMilestone = ApiUrl.BaseUrl + "/api/DataTab/DeleteMilestone";

  //--- Lookup
  public static MilestoneLookUp = ApiUrl.BaseUrl + "/api/DataTab/MilestoneLookUp";
  public static DisciplineLookUp = ApiUrl.BaseUrl + "/api/DataTab/DisciplineLookUp";
  public static SubSystemLookUp = ApiUrl.BaseUrl + "/api/DataTab/SubSystemLookUp";
  public static WorkPackLookUp = ApiUrl.BaseUrl + "/api/DataTab/WorkPackLookUp";
  public static PackageLookUp = ApiUrl.BaseUrl + "/api/DataTab/PackageLookUp";
  public static LocationsLookUp = ApiUrl.BaseUrl + "/api/DataTab/LocationsLookUp";
  public static PunchListLookUp = ApiUrl.BaseUrl + "/api/DataTab/PunchListLookUp";
  public static TagLookUp = ApiUrl.BaseUrl + "/api/DataTab/TagLookUp";
  public static OrderLookUp = ApiUrl.BaseUrl + "/api/DataTab/OrderLookUp";
  public static EquipmentTypeLookUp = ApiUrl.BaseUrl + "/api/DataTab/EquipmentTypeLookUp";
  public static DrawingLookUp = ApiUrl.BaseUrl + "/api/DataTab/DrawingLookUp";
  public static ElementSystemLookUp = ApiUrl.BaseUrl + "/api/DataTab/GetSystemLookUp";
  public static DrawingTypeLookUp = ApiUrl.BaseUrl + "/api/DataTab/DrawingTypeLookUp";
  public static LocationDrawingLookUp = ApiUrl.BaseUrl + "/api/DataTab/LocationDrawingLookUp";
  public static MaterialLookUp = ApiUrl.BaseUrl + "/api/DataTab/MaterialLookUp";
  public static LocationsLookUpTagPage = ApiUrl.BaseUrl + "/api/DataTab/LocationsLookUpTagPage";
  public static EquipmentTypeLookUpTagPage = ApiUrl.BaseUrl + "/api/DataTab/EquipmentTypeLookUpTagPage";
  public static TagParentLookUp = ApiUrl.BaseUrl + "/api/DataTab/TagParentLookUp";
  public static DisciplineLookUpTagPage = ApiUrl.BaseUrl + "/api/DataTab/DisciplineLookUpTagPage";
  public static SubSystemLookUpTagPage = ApiUrl.BaseUrl + "/api/DataTab/SubSystemLookUpTagPage";
  public static GetSystemLookUpTagPage = ApiUrl.BaseUrl + "/api/DataTab/GetSystemLookUpTagPage";
  public static ItrSignatureLookUp = ApiUrl.BaseUrl + "/api/ITR/ItrSignatureLookUp";
  public static GetSystemLookUpPunchPage = ApiUrl.BaseUrl + "/api/DataTab/GetSystemLookUpPunchPage";
  public static DisciplineLookUpFilterPunchPage = ApiUrl.BaseUrl + "/api/DataTab/DisciplineLookUpPunchPage";
  public static LocationsLookUpPunchPage = ApiUrl.BaseUrl + "/api/DataTab/LocationsLookUpPunchPage";
  public static PreservationElementLookUp = ApiUrl.BaseUrl + "/api/DataTab/PreservationElementLookUp";
  public static PunchLookUp = ApiUrl.BaseUrl + "/api/DataTab/PunchLookUp";

  //-- JobCard
  public static DataJobCardList = ApiUrl.BaseUrl + "/api/DataTab/JobCardList";
  public static GetJobCardById = ApiUrl.BaseUrl + "/api/DataTab/JobCardDetail";
  public static CreateJobCard = ApiUrl.BaseUrl + "/api/DataTab/CreateJobCard";
  public static UpdateJobCard = ApiUrl.BaseUrl + "/api/DataTab/UpdateJobCard";
  public static InsertJobCardsViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertJobCardsViaCsvFile";
  public static DeleteJobCard = ApiUrl.BaseUrl + "/api/DataTab/DeleteJobCard";

  //-- Punch List

  public static DataGetPunchList = ApiUrl.BaseUrl + "/api/DataTab/GetPunchList";
  public static GetPunchListById = ApiUrl.BaseUrl + "/api/DataTab/PunchListDetail";
  public static UpdatePunchList = ApiUrl.BaseUrl + "/api/DataTab/UpdatePunchList";
  public static InsertPunchListsViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertPunchListsViaCsvFile";
  public static DeletePunchList = ApiUrl.BaseUrl + "/api/DataTab/DeletePunchList";

  //-- PunchItem
  public static DataListPunchItem = ApiUrl.BaseUrl + "/api/DataTab/ListPunchItem";
  public static GetPunchById = ApiUrl.BaseUrl + "/api/DataTab/PunchDetail";
  public static UpdatePunch = ApiUrl.BaseUrl + "/api/DataTab/UpdatePunch";
  public static InsertPunchesViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertPunchesViaCsvFile";
  public static DeletePunch = ApiUrl.BaseUrl + "/api/DataTab/DeletePunch";

  //-- Punch setup page
  public static ProjectSignaturePunch = ApiUrl.BaseUrl + "/api/Project/ProjectSignaturePunch";
  public static UpdateProjectSignaturePunch = ApiUrl.BaseUrl + "/api/Project/UpdateProjectSignaturePunch";
  public static ProjectSignatureItr = ApiUrl.BaseUrl + "/api/Project/ProjectSignatureItr";
  public static UpdateProjectSignatureItr = ApiUrl.BaseUrl + "/api/Project/UpdateProjectSignatureItr";
  public static ProjectSignatureChange = ApiUrl.BaseUrl + "/api/Project/ProjectSignatureChange";
  public static UpdateProjectSignatureChange = ApiUrl.BaseUrl + "/api/Project/UpdateProjectSignatureChange";
  public static ProjectStageChange = ApiUrl.BaseUrl + "/api/Project/GetProjectStageChange";
  public static UpdateProjectStageChange = ApiUrl.BaseUrl + "/api/Project/UpdateProjectStageChange";
  public static ProjectSignaturePreservation = ApiUrl.BaseUrl + "/api/Project/ProjectSignaturePreservation";
  public static UpdateProjectSignaturePreservation = ApiUrl.BaseUrl + "/api/Project/UpdateProjectSignaturePreservation";

  //-- ITR Admin
  public static ITRList = ApiUrl.BaseUrl + "/api/ITR/ItrList";
  public static ITRDetail = ApiUrl.BaseUrl + "/api/ITR/ItrDetail";
  public static CreateITR = ApiUrl.BaseUrl + "/api/ITR/CreateItr";
  public static UpdateITR = ApiUrl.BaseUrl + "/api/ITR/UpdateItr";
  public static DeleteITR = ApiUrl.BaseUrl + "/api/ITR/DeleteItr";
  public static DeleteListItr = ApiUrl.BaseUrl + "/api/ITR/DeleteListItr";
  public static ItrListLookup = ApiUrl.BaseUrl + "/api/ITR/ItrListLookup";

  //-- Itr Allocation
  public static EquipmentITRList = ApiUrl.BaseUrl + "/api/ITR/EquipmentItrList";
  public static EquipmentDetail = ApiUrl.BaseUrl + "/api/ITR/ITRDetail";
  public static EquipmentItrDetail = ApiUrl.BaseUrl + "/api/ITR/EquipmentItrDetail";
  public static CreateEquipmentItr = ApiUrl.BaseUrl + "/api/ITR/CreateEquipment";
  public static UpdateEquipmentItr = ApiUrl.BaseUrl + "/api/ITR/UpdateITR";
  public static DeleteEquipmentItr = ApiUrl.BaseUrl + "/api/ITR/DeleteITR";
  public static DeleteListEquipmentItr = ApiUrl.BaseUrl + "/api/ITR/DeleteListEquipment";
  public static ITRAllocatedList = ApiUrl.BaseUrl + "/api/ITR/ItrAllocatedList";
  public static ItrEquipmentList = ApiUrl.BaseUrl + "/api/ITR/ItrEquipmentList";
  public static UpdateItrAllocation = ApiUrl.BaseUrl + "/api/ITR/UpdateItrAllocation";

  //-- Preservation Allocation
  public static PreservationAllocatedList = ApiUrl.BaseUrl + "/api/Preservation/PreservationAllocatedList";
  public static PausePreservationAllocation = ApiUrl.BaseUrl + "/api/Preservation/PausePreservationAllocation";
  public static ResumePreservationAllocation = ApiUrl.BaseUrl + "/api/Preservation/ResumePreservationAllocation";
  public static StopPreservationAllocation = ApiUrl.BaseUrl + "/api/Preservation/StopPreservationAllocation";
  public static UpdatePreservationAllocation = ApiUrl.BaseUrl + "/api/Preservation/UpdatePreservationAllocation";

  //-- Itr Datatab
  public static InsertRecordsViaCsvFile = ApiUrl.BaseUrl + "/api/ITR/InsertRecordsViaCsvFile";

  // //-- Itr Builder
  // public static GetListImageStorage = ApiUrl.BaseUrl + "/api/ITR/ImageStorageList";
  // public static ItrTemplateLookUp = ApiUrl.BaseUrl + "/api/ITR/ItrBuilderTemplateLookUp";
  // public static ItrTemplateDetail = ApiUrl.BaseUrl + "/api/ITR/ItrBuilderTemplateDetail";
  // public static CreateItrTemplate = ApiUrl.BaseUrl + "/api/ITR/CreateItrBuilderTemplate";
  // public static UpdateItrTemplate = ApiUrl.BaseUrl + "/api/ITR/UpdateItrBuilderTemplate";

  //-- Drawing
  public static DataDrawingsList = ApiUrl.BaseUrl + "/api/DataTab/DrawingList";
  public static GetDrawingById = ApiUrl.BaseUrl + "/api/DataTab/DrawingDetail";
  public static CreateDrawing = ApiUrl.BaseUrl + "/api/DataTab/CreateDrawing";
  public static UpdateDrawing = ApiUrl.BaseUrl + "/api/DataTab/UpdateDrawing";
  public static InsertDrawingsViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertDrawingsViaCsvFile";
  public static DeleteDrawing = ApiUrl.BaseUrl + "/api/DataTab/DeleteDrawing";
  public static UpdateAttachmentDrawingFile = ApiUrl.BaseUrl + "/api/DataTab/UpdateAttachmentFile";

  //-- DrawingType
  public static DataDrawingTypesList = ApiUrl.BaseUrl + "/api/DataTab/DrawingTypeList";
  public static GetDrawingTypeById = ApiUrl.BaseUrl + "/api/DataTab/DrawingTypeDetail";
  public static CreateDrawingType = ApiUrl.BaseUrl + "/api/DataTab/CreateDrawingType";
  public static UpdateDrawingType = ApiUrl.BaseUrl + "/api/DataTab/UpdateDrawingType";
  public static InsertDrawingTypesViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertDrawingTypesViaCsvFile";
  public static DeleteDrawingType = ApiUrl.BaseUrl + "/api/DataTab/DeleteDrawingType";

  //-- PreservationElement
  public static DataPreservationElementsList = ApiUrl.BaseUrl + "/api/DataTab/PreservationElementList";
  public static GetPreservationElementById = ApiUrl.BaseUrl + "/api/DataTab/PreservationElementDetail";
  public static CreatePreservationElement = ApiUrl.BaseUrl + "/api/DataTab/CreatePreservationElement";
  public static UpdatePreservationElement = ApiUrl.BaseUrl + "/api/DataTab/UpdatePreservationElement";
  public static InsertPreservationElementsViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertPreservationElementsViaCsvFile";
  public static DeletePreservationElement = ApiUrl.BaseUrl + "/api/DataTab/DeletePreservationElement";

  //-- Material
  public static DataMaterialsList = ApiUrl.BaseUrl + "/api/DataTab/MaterialList";
  public static GetMaterialById = ApiUrl.BaseUrl + "/api/DataTab/MaterialDetail";
  public static CreateMaterial = ApiUrl.BaseUrl + "/api/DataTab/CreateMaterial";
  public static UpdateMaterial = ApiUrl.BaseUrl + "/api/DataTab/UpdateMaterial";
  public static InsertMaterialsViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertMaterialsViaCsvFile";
  public static DeleteMaterial = ApiUrl.BaseUrl + "/api/DataTab/DeleteMaterial";

  //-- Order
  public static DataGetOrder = ApiUrl.BaseUrl + "/api/DataTab/OrderList";
  public static GetOrderById = ApiUrl.BaseUrl + "/api/DataTab/OrderDetail";
  public static CreateOrder = ApiUrl.BaseUrl + "/api/DataTab/CreateOrder";
  public static UpdateOrder = ApiUrl.BaseUrl + "/api/DataTab/UpdateOrder";
  public static InsertOrdersViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertOrdersViaCsvFile";
  public static DeleteOrder = ApiUrl.BaseUrl + "/api/DataTab/DeleteOrder";

  //--- Tag Page
  public static TagPageList = ApiUrl.BaseUrl + "/api/TagPage/TagPageList";
  public static ApplyTagList = ApiUrl.BaseUrl + "/api/TagPage/ApplyTagList";
  public static EditTagTabSideMenu = ApiUrl.BaseUrl + "/api/TagPage/EditTagTabSideMenu";
  public static TagItrList = ApiUrl.BaseUrl + "/api/TagPage/TagItrList";
  public static TabSideMenuDetail = ApiUrl.BaseUrl + "/api/TagPage/TabSideMenuDetail";
  public static UpdateTagItrTabSideMenu = ApiUrl.BaseUrl + "/api/TagPage/UpdateTagItrTabSideMenu";
  public static GetTagPunchDetail = ApiUrl.BaseUrl + "/api/TagPage/GetTagPunchDetail";
  public static ItrRecordDetail = ApiUrl.BaseUrl + "/api/TagPage/RecordDetail";
  public static UpdateITRRecordDetail = ApiUrl.BaseUrl + "/api/TagPage/UpdateRecordDetail";
  public static SignRecordValidate = ApiUrl.BaseUrl + "/api/TagPage/SignRecordValidate";
  public static ApproveRecord = ApiUrl.BaseUrl + "/api/TagPage/ApproveRecord";
  public static RejectRecord = ApiUrl.BaseUrl + "/api/TagPage/RejectRecord";
  public static DownloadDataTag = ApiUrl.BaseUrl + "/api/TagPage/DownloadDataTag";
  public static LockTags = ApiUrl.BaseUrl + "/api/TagPage/LockTags";
  public static UnlockTags = ApiUrl.BaseUrl + "/api/TagPage/UnlockTags";
  public static SynchronizeDataTags = ApiUrl.BaseUrl + "/api/TagPage/SynchronizeDataTags";
  public static DownloadDataLookUp = ApiUrl.BaseUrl + "/api/TagPage/DownloadDataLookUp";
  public static TagDrawingList = ApiUrl.BaseUrl + "/api/TagPage/TagDrawingList";


  //--- ITR Builder
  public static UnitCharacterList = ApiUrl.BaseUrl + "/api/ITR/UnitCharacterList";
  public static TableDefinitionList = ApiUrl.BaseUrl + "/api/ITR/TableDefinitionList";
  public static FieldConfigurationList = ApiUrl.BaseUrl + "/api/ITR/FieldConfigurationList";
  public static GetListImageStorage = ApiUrl.BaseUrl + "/api/ITR/ImageStorageList";
  public static ItrTemplateLookUp = ApiUrl.BaseUrl + "/api/ITR/ItrBuilderTemplateLookUp";
  public static ItrTemplateDetail = ApiUrl.BaseUrl + "/api/ITR/ItrBuilderTemplateDetail";
  public static CreateItrTemplate = ApiUrl.BaseUrl + "/api/ITR/CreateItrBuilderTemplate";
  public static UpdateItrTemplate = ApiUrl.BaseUrl + "/api/ITR/UpdateItrBuilderTemplate";
  public static ItrBuilderDetail = ApiUrl.BaseUrl + "/api/ITR/ItrBuilderDetail";
  public static DeleteItrTemplate = ApiUrl.BaseUrl + "/api/ITR/DeleteItrBuilderTemplate";
  public static CreateItrBuilder = ApiUrl.BaseUrl + "/api/ITR/CreateItrBuilder";
  public static UpdateItrBuilder = ApiUrl.BaseUrl + "/api/ITR/UpdateItrBuilder";

  //--- Data PunchType
  public static DataPunchTypeList = ApiUrl.BaseUrl + "/api/DataTab/PunchTypesList";
  public static GetPunchTypeById = ApiUrl.BaseUrl + "/api/DataTab/PunchTypeDetail";
  public static UpdatePunchType = ApiUrl.BaseUrl + "/api/DataTab/UpdatePunchType";
  public static CreatePunchType = ApiUrl.BaseUrl + "/api/DataTab/CreatePunchType";
  public static InsertPunchTypesViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertPunchTypesViaCsvFile";
  public static DeletePunchType = ApiUrl.BaseUrl + "/api/DataTab/DeletePunchType";
  public static PunchTypeLookUp = ApiUrl.BaseUrl + "/api/DataTab/PunchTypeLookUp";

  //--- Data StandardPunchItem
  public static DataStandardPunchItem = ApiUrl.BaseUrl + "/api/DataTab/StandardPunchItemList";
  public static StandardPunchItemDetail = ApiUrl.BaseUrl + "/api/DataTab/StandardPunchItemDetail";
  public static InsertStandardPunchItemsViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertStandardPunchItemsViaCsvFile"
  public static DeleteStandardPunchItem = ApiUrl.BaseUrl + "/api/DataTab/DeleteStandardPunchItem";
  public static UpdateStandardPunchItem = ApiUrl.BaseUrl + "/api/DataTab/UpdateStandardPunchItem";
  public static CreateStandardPunchItem = ApiUrl.BaseUrl + "/api/DataTab/CreateStandardPunchItem";

  //--- Dat Change
  public static DataGetChangeType = ApiUrl.BaseUrl + "/api/DataTab/ChangeTypeList";
  public static GetChangeTypeById = ApiUrl.BaseUrl + "/api/DataTab/ChangeTypeDetail";
  public static CreateChangeType = ApiUrl.BaseUrl + "/api/DataTab/CreateChangeType";
  public static UpdateChangeType = ApiUrl.BaseUrl + "/api/DataTab/UpdateChangeType";
  public static InsertChangeTiesViaCsvFile = ApiUrl.BaseUrl + "/api/DataTab/InsertChangeTiesViaCsvFile";
  public static DeleteChangeType = ApiUrl.BaseUrl + "/api/DataTab/DeleteChangeType";

  //--- Role Management
  public static RoleManagementList = ApiUrl.BaseUrl + "/api/role/GetRoleList";
  public static AddRoleManagement = ApiUrl.BaseUrl + "/api/role/CreateRole";
  public static EditRoleManagement = ApiUrl.BaseUrl + "/api/role/UpdateRole";
  public static DeleteRoleManagement = ApiUrl.BaseUrl + "/api/role/DeleteRole";
  public static DetailRole = ApiUrl.BaseUrl + "/api/role/DetailRole";
  public static ImportRole = ApiUrl.BaseUrl + "/api/role/ImportRole";

  //--- Punch Page
  public static TagLookUpPunchPage = ApiUrl.BaseUrl + "/api/PunchPage/TagLookUpPunchPage";
  public static DrawingLookUpPunchPage = ApiUrl.BaseUrl + "/api/PunchPage/DrawingLookUpPunchPage";
  public static DisciplineLookUpPunchPage = ApiUrl.BaseUrl + "/api/PunchPage/DisciplineLookUpPunchPage";
  public static ListPunchPageItem = ApiUrl.BaseUrl + "/api/PunchPage/ListPunchPageItem";
  public static PunchDetail = ApiUrl.BaseUrl + "/api/PunchPage/PunchDetail";
  public static UpdatePunchPage = ApiUrl.BaseUrl + "/api/PunchPage/UpdatePunchPage";
  public static CreatePunchPage = ApiUrl.BaseUrl + "/api/PunchPage/CreatePunchPage";
  public static DeletePunchPage = ApiUrl.BaseUrl + "/api/PunchPage/DeletePunchPage";
  public static MySubmittedPunches = ApiUrl.BaseUrl + "/api/PunchPage/MySubmittedPunches";
  public static UnSubmittedPunches = ApiUrl.BaseUrl + "/api/PunchPage/UnSubmittedPunches";
  public static ListSubmittedPunches = ApiUrl.BaseUrl + "/api/PunchPage/ListSubmittedPunches";
  public static PunchesNeedMySignature = ApiUrl.BaseUrl + "/api/PunchPage/PunchesNeedMySignature";
  public static ApprovePunches = ApiUrl.BaseUrl + "/api/PunchPage/ApprovePunches";
  public static RejectPunches = ApiUrl.BaseUrl + "/api/PunchPage/RejectPunches";
  public static DeletePunches = ApiUrl.BaseUrl + "/api/PunchPage/DeletePunches";
  public static SignOffPunches = ApiUrl.BaseUrl + "/api/PunchPage/SignOffPunches";
  public static CountUserPunch = ApiUrl.BaseUrl + "/api/PunchPage/CountUserPunch";
  public static SignValidate = ApiUrl.BaseUrl + "/api/PunchPage/SignValidate";

  //---- Change Page
  public static ListChange = ApiUrl.BaseUrl + "/api/ChangePage/GetChangeList";
  public static CreateChange = ApiUrl.BaseUrl + "/api/ChangePage/CreateChangePage";
  public static DetailChange = ApiUrl.BaseUrl + "/api/ChangePage/GetDetailChangePage";
  public static UpdateChangeFirstStage = ApiUrl.BaseUrl + "/api/ChangePage/UpdateChangeFirstStage";
  public static UpdateChangeOtherStage = ApiUrl.BaseUrl + "/api/ChangePage/UpdateChangeOtherStage";
  public static ApproveChangeStage = ApiUrl.BaseUrl + "/api/ChangePage/ApproveChangeStage";
  public static RejectChangeStage = ApiUrl.BaseUrl + "/api/ChangePage/RejectChangeStage";
  public static SignOffChanges = ApiUrl.BaseUrl + "/api/ChangePage/SignOffChanges";
  public static SignValidateChange = ApiUrl.BaseUrl + "/api/ChangePage/SignValidateChange";
  public static CountUserChange = ApiUrl.BaseUrl + "/api/ChangePage/CountUserChange";
  public static ChangeUpdateList = ApiUrl.BaseUrl + "/api/ChangePage/GetChangeUpdateList";
  public static ChangeApproveList = ApiUrl.BaseUrl + "/api/ChangePage/GetChangeApproveList";
  public static ChangeSignOffList = ApiUrl.BaseUrl + "/api/ChangePage/GetChangeSignOffList";
  public static ChangeTypeLookup = ApiUrl.BaseUrl + "/api/ChangePage/GetChangeTypeLookup";
  public static DeleteChanges = ApiUrl.BaseUrl + "/api/ChangePage/DeleteChange";
  public static ListAttachmentChange = ApiUrl.BaseUrl + "/api/ChangePage/ListAttachmentChange";
  public static UpdateAttachment = ApiUrl.BaseUrl + "/api/ChangePage/UpdateAttachment";
  public static RemoveChangeAttachment = ApiUrl.BaseUrl + "/api/ChangePage/RemoveChangeAttachment";
  public static ChangeStageLookup = ApiUrl.BaseUrl + "/api/ChangePage/GetChangeStageLookup";

  //--- Notification
  public static NotificationList = ApiUrl.BaseUrl + "/api/Notification/NotificationList";
  public static ReadNotification = ApiUrl.BaseUrl + "/api/Notification/ReadNotification";

  //--- Milestone Tab
  public static MilestonePageList = ApiUrl.BaseUrl + "/api/Milestone/MilestonePageList";
  public static UpdateMilestonePage = ApiUrl.BaseUrl + "/api/Milestone/UpdateMilestonePage";
  public static ItrHandoverLookUp = ApiUrl.BaseUrl + "/api/Milestone/ItrHandoverLookUp";
  public static PunchHandoverLookUp = ApiUrl.BaseUrl + "/api/Milestone/PunchHandoverLookUp";
  public static ChangeHandoverLookUp = ApiUrl.BaseUrl + "/api/Milestone/ChangeHandoverLookUp";
  public static DeletePartialHandover = ApiUrl.BaseUrl + "/api/Milestone/DeletePartialHandover";
  public static CheckWalkDownStatus = ApiUrl.BaseUrl + "/api/Milestone/CheckWalkDownStatus";
  public static CreatePartialHandover = ApiUrl.BaseUrl + "/api/Milestone/CreatePartialHandover";
  public static StartWalkDownHandover = ApiUrl.BaseUrl + "/api/Milestone/StartWalkDownHandover";
  public static MilestoneSignValidate = ApiUrl.BaseUrl + "/api/Milestone/SignValidate";
  public static SignOffWalkDown = ApiUrl.BaseUrl + "/api/Milestone/SignOffWalkDown";
  public static CheckConditional = ApiUrl.BaseUrl + "/api/Milestone/CheckConditional";
  public static ConditionalAcceptedHandover = ApiUrl.BaseUrl + "/api/Milestone/ConditionalAcceptedHandover";
  public static DisciplineHandoverLookUp = ApiUrl.BaseUrl + "/api/Milestone/DisciplineHandoverLookUp";
  public static DownloadDataHandover = ApiUrl.BaseUrl + "/api/Milestone/DownloadDataHandover";
  public static LockHandovers = ApiUrl.BaseUrl + "/api/Milestone/LockHandovers";
  public static UnlockHandovers = ApiUrl.BaseUrl + "/api/Milestone/UnlockHandovers";

  // --- Progress Report
  public static GetReportExportFile = ApiUrl.BaseUrl + "/api/ProgressReport/GetReportExportFile";
  public static GetSkylineReportData = ApiUrl.BaseUrl + "/api/ProgressReport/GetSkylineReportData";
  public static GetSystemReportData = ApiUrl.BaseUrl + "/api/ProgressReport/GetSystemReportData";
  public static GetSubSystemReportData = ApiUrl.BaseUrl + "/api/ProgressReport/GetSubSystemReportData";
  public static GetDetailedItrReportData = ApiUrl.BaseUrl + "/api/ProgressReport/GetDetailedItrReportData";
  public static GetPunchSummaryReportData = ApiUrl.BaseUrl + "/api/ProgressReport/GetPunchSummaryReportData";
}
