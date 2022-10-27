export class ReportTypeModel {
  reportTypeId: number;
  reportTypeName: string;
  key: string;
}

export class Lookup2Report {
  id: string;
  value: string;
}

export const Type2Switch = {
  text: 'text',
  dropdown: 'dropdown',
  date: 'date',
  multiSelect: 'multiSelect',
}