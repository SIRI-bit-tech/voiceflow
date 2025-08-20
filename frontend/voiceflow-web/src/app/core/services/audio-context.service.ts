import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioContextService {
  private _context: AudioContext | null = null;

  get context(): AudioContext {
    if (!this._context) {
      this._context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this._context;
  }
}


