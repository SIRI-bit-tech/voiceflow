import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SpeechSynthesisService {
  speak(text: string, lang = 'en-US'): Promise<void> {
    return new Promise((resolve) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.onend = () => resolve();
      speechSynthesis.speak(utter);
    });
  }
}


