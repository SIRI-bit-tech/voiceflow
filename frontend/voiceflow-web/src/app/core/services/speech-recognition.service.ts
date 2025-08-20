import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

type RecConstructor = typeof (window as any).webkitSpeechRecognition | typeof (window as any).SpeechRecognition;

@Injectable({ providedIn: 'root' })
export class SpeechRecognitionService {
  private recognition: any | null = null;

  constructor(private zone: NgZone) {}

  init(lang = 'en-US'): void {
    const SpeechRec: RecConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      throw new Error('SpeechRecognition not supported');
    }
    this.recognition = new SpeechRec();
    this.recognition.lang = lang;
    this.recognition.interimResults = true;
    this.recognition.continuous = true;
  }

  stream(): Observable<{ final: boolean; text: string }> {
    return new Observable((observer) => {
      if (!this.recognition) this.init();
      this.recognition.onresult = (event: any) => {
        let result = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          result += event.results[i][0].transcript;
          const isFinal = event.results[i].isFinal;
          this.zone.run(() => observer.next({ final: isFinal, text: result }));
        }
      };
      this.recognition.onerror = (e: any) => this.zone.run(() => observer.error(e));
      this.recognition.onend = () => this.zone.run(() => observer.complete());
      this.recognition.start();
      return () => this.recognition && this.recognition.stop();
    });
  }
}


