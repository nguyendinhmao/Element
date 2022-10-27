import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class ReloadLayoutService {
  @Output() layoutEvent: EventEmitter<any> = new EventEmitter<any>();

  reloadLayout(data) {
    this.layoutEvent.emit(data);
  }

  getEmitter() {
    return this.layoutEvent;
  }
}
