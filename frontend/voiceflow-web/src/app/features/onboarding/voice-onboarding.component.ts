import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeechSynthesisService } from '../../core/services/speech-synthesis.service';
import { SpeechRecognitionService } from '../../core/services/speech-recognition.service';
import { WebsocketService } from '../../core/services/websocket.service';

@Component({
  selector: 'app-voice-onboarding',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-white grid place-items-center p-6">
      <div class="max-w-xl text-center space-y-6">
        <h1 class="text-3xl font-bold">VoiceFlow CMS</h1>
        <p>Say: <span class="font-semibold">Start setup</span></p>
        <div class="rounded bg-slate-800 p-4 text-left">
          <p class="opacity-80">Heard: {{ heard() }}</p>
        </div>
        <button class="px-4 py-2 bg-indigo-600 rounded" (click)="begin()">Begin</button>
      </div>
    </div>
  `,
})
export class VoiceOnboardingComponent {
  private tts = inject(SpeechSynthesisService);
  private stt = inject(SpeechRecognitionService);
  private ws = inject(WebsocketService);

  heard = signal('');

  async begin(): Promise<void> {
    await this.tts.speak('Welcome to VoiceFlow CMS. Please say Start setup to begin');
    this.stt.init();
    this.stt.stream().subscribe(async ({ final, text }) => {
      this.heard.set(text);
      if (final && /start setup/i.test(text)) {
        await this.tts.speak('Great. Voice calibration will begin now.');
      }
    });
  }
}


