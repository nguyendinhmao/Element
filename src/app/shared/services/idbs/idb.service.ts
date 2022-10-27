import { Injectable } from '@angular/core';
import * as idb from 'idb/with-async-ittr.js';
import { Observable, Subject } from 'rxjs';
import { IndexRelatedSNs, StoreNames } from '../../models/common/common.model';

export class Tag {
  tagId: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})

export class IdbService {
  private _bdName = 'pwa-database';
  private _version = 10;
  private _dataChange: Subject<any> = new Subject<any>();
  private _dbPromise;
  constructor(
  ) { }

  connectToIDB() {
    this._dbPromise = idb.openDB(this._bdName, this._version, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(oldVersion);
        console.log(newVersion);
        Object.keys(StoreNames).forEach(key => {
          if (oldVersion < newVersion) {
            if (!db.objectStoreNames.contains(StoreNames[key])) {
              const store = db.createObjectStore(StoreNames[key]);
              if (!!IndexRelatedSNs[key]) {
                Object.keys(IndexRelatedSNs[key]).forEach(_kI => {
                  store.createIndex(IndexRelatedSNs[key][_kI], IndexRelatedSNs[key][_kI]);
                })
              }
            } else {
              const store = transaction.objectStore(StoreNames[key]);
              store.clear();
              if (!!IndexRelatedSNs[key]) {
                Object.keys(IndexRelatedSNs[key]).forEach(_kI => {
                  if (!(store.indexNames.contains(IndexRelatedSNs[key][_kI]))) {
                    store.createIndex(IndexRelatedSNs[key][_kI], IndexRelatedSNs[key][_kI]);
                  }
                })
              }
            }
          }
        })
      }
    });
  }

  clearDataInAllStores(preventClearStores?: string[]) {
    Object.keys(StoreNames).forEach(key => {
      if (!((preventClearStores || []).includes(StoreNames[key]))) {
        this.clearDataInStore(StoreNames[key]);
      }
    });
  }

  clearDataInStore(storeName) {
    this._dbPromise.then((db: any) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
    });
  }

  addTags(storeName: string, tags: any[]) {
    tags.forEach(_tag => {
      this.addItem(storeName, _tag.tagId, _tag);
    });
  }

  addRecords(storeName: string, records: any[]) {
    records.forEach(_record => {
      this.addItem(storeName, _record.recordId, _record);
    });
  }

  addLookups(storeName: string, lookupData: any) {
    Object.keys(lookupData).forEach(_key => {
      this.addItem(storeName, _key, lookupData[_key]);
    })
  }

  addPunches(storeName: string, punches: any) {
    punches.forEach(_punch => {
      this.addItem(storeName, _punch.punchId, _punch);
    });
  }

  addDrawings(storeName: string, drawings: any) {
    drawings.forEach(_drawing => {
      this.addItem(storeName, _drawing.drawingId, _drawing);
    });
  }

  addHandovers(storeName: string, handovers: any[]) {
    handovers.forEach(_handover => {
      this.addItem(storeName, _handover.handoverId, _handover);
    });
  }

  addTagPreservation(storeName: string, tagPreservation: any[]) {
    tagPreservation.forEach(_tagP => {
      this.addItem(storeName, _tagP.tagId, _tagP);
    });
  }

  addPreservation(storeName: string, preservation: any[]) {
    preservation.forEach(_preservation => {
      this.addItem(storeName, _preservation.preservationId, _preservation);
    });
  }

  addItem(storeName: string, key: string, value: any) {
    this._dbPromise.then((db: any) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(value, key);
      return tx.complete;
    });
  }

  async updateItem(storeName: string, value: any, key: string,) {
    return (await this._dbPromise).put(storeName, value, key);
  }

  getItem(storeName: string, key: string) {
    return this._dbPromise.then((db: any) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      return store.get(key);
    });
    // return (await this._dbPromise).get(storeName, key);;
  }

  async getItemFromIndex(storeName: string, indexName: string, key: string) {
    const db = await idb.openDB(this._bdName, this._version);
    return await db.getFromIndex(storeName, indexName, key);
  }

  getAllData(storeName: string) {
    return this._dbPromise.then((db: any) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      return store.getAll();
    });
    // return (await this._dbPromise).getAll(storeName);
  }

  async getAllDataFromIndex(storeName: string, indexName: string, key: string) {
    const db = await idb.openDB(this._bdName, this._version);
    return await db.getAllFromIndex(storeName, indexName, key);
  }

  removeItems(storeName: string, link: string, keys: Array<string>) {
    this._dbPromise.then(async (db: any) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      let cursor = await store.openCursor();

      while (cursor) {
        const _key = this.getKey(cursor.value, link);
        if (keys.some(_k => _k === _key)) {
          cursor.delete();
        }
        cursor = await cursor.continue();
      }
    });
  }

  async removeItem(storeName: string, key: string) {
    return (await this._dbPromise).delete(storeName, key);
  }

  dataChanged(): Observable<Tag> {
    return this._dataChange;
  }

  //#region Utils
  private getKey(value: any, link: string) {
    const _parts = link.split('.');
    if (_parts.length === 1) {
      return value[link];
    }

    let _fResult = value[_parts[0]];
    _parts.forEach((_p, i) => {
      if (i === 0) { return; }
      _fResult = this.deepCopy(_fResult[_p]);
    });
    return _fResult;
  }

  private deepCopy(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || 'object' != typeof obj) {
      return obj;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.deepCopy(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = this.deepCopy(obj[attr]);
        }
      }
      return copy;
    }

    throw new Error('Unable to copy obj! Its type isn\'t supported.');
  }
  //#endregion Utils
}