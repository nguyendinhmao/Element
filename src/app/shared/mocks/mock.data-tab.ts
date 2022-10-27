import { Observable } from 'rxjs';
import { ApiListResponse } from '../models/api-response/api-response';
import { DataTabModel } from '../models/data-tab/data-tab.model';

//--- Datatable
let dataTabDatas: DataTabModel[] = [
  { dataTabId: 3, dataTabName: 'Discipline' },
  { dataTabId: 1, dataTabName: 'Tag No' },
  { dataTabId: 4, dataTabName: 'Drawing' },
  { dataTabId: 8, dataTabName: 'Equipment' },
  // { dataTabId: 9, dataTabName: 'Handover' },
  { dataTabId: 7, dataTabName: 'Location' },
  { dataTabId: 10, dataTabName: 'Milestone' },
  { dataTabId: 2, dataTabName: 'Sub System' },
  { dataTabId: 5, dataTabName: 'System' },
  { dataTabId: 6, dataTabName: 'Work pack' },
  { dataTabId: 11, dataTabName: 'Job Card' },
  // {dataTabId: 12, dataTabName: 'Punch List'},
  { dataTabId: 13, dataTabName: 'Punch Item' },
  { dataTabId: 14, dataTabName: 'Drawing Type' },
  { dataTabId: 15, dataTabName: 'Material' },
  { dataTabId: 16, dataTabName: 'Order' },
  { dataTabId: 17, dataTabName: 'Punch Type' },
  { dataTabId: 18, dataTabName: 'Standard Punch Item' },
  { dataTabId: 19, dataTabName: 'Change Type' },
  { dataTabId: 20, dataTabName: 'Preservation Element' },
  { dataTabId: 21, dataTabName: 'Record' },

]

export class MockDataTableApi {
  public getDataTab = (): Observable<ApiListResponse> => {
    let response = <ApiListResponse>{
      status: 1,
      message: '',
      content: <DataTabModel[]>[...dataTabDatas.sort(compareValues('dataTabName', 'asc'))]
    };
    return Observable.create(observer => {
      observer.next(response);
      observer.complete();
    });
  }


}

function compareValues(key, order = 'asc') {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      return 0;
    }

    const varA = (typeof a[key] === 'string') ?
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ?
      b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}
