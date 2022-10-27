export class DataLocationModel {
  locationId: number;
  locationCode: string;
  locationName: string;
}

export class UpdateLocationModel {
  locationId: number;
  locationCode: string;
  locationName: string;
  projectId: string;
}
export class CreateLocationModel {
  locationCode: string;
  locationName: string;
  projectId: string;
}
export class LocationLookUpModel {
  id: string;
  value: string;
}
