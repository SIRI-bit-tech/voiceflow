import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  constructor(private zone: NgZone) {}

  connect(url: string): Observable<string> {
    return new Observable((observer) => {
      const ws = new WebSocket(url);
      ws.onmessage = (evt) => this.zone.run(() => observer.next(String(evt.data)));
      ws.onerror = (evt) => this.zone.run(() => observer.error(evt));
      ws.onclose = () => this.zone.run(() => observer.complete());
      return () => ws.close();
    });
  }
}


