export class DataJobCardModel {
  jobCardId: string;
  jobCardName: string;
  jobCardNo: string;
  workpackNo: string;
}
export class CreateJobCardModel {
  projectId: string;
  jobCardName: string;
  jobCardNo: string;
  workPackId: string;
}
export class UpdateJobCardModel {
  jobCardId: string;
  jobCardName: string;
  jobCardNo: string;
  workPackNo: string;
  workPackId: string;
}
export class JobCardLookUpModel {
  id: string;
  value: string;
  workPackNo: string;
}
