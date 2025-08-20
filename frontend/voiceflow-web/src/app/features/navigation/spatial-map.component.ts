import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AudioContextService } from '../../core/services/audio-context.service';
import { SpatialAudioService, SpatialBeacon } from '../../core/services/spatial-audio.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { SpeechSynthesisService } from '../../core/services/speech-synthesis.service';

interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  content_count: number;
  beacon_audio?: string;
}

@Component({
  selector: 'app-spatial-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <!-- 3D Spatial Navigation Interface -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="relative w-full h-full">
          <!-- Virtual Building Layout -->
          <div class="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-4 p-8">
            <!-- Lobby (Center) -->
            <div 
              class="col-start-2 row-start-2 bg-indigo-600/20 border-2 border-indigo-400 rounded-lg p-4 cursor-pointer transition-all hover:bg-indigo-600/40"
              (click)="navigateToRoom('lobby')"
              [class.bg-indigo-600/60]="currentRoom() === 'lobby'"
            >
              <h3 class="text-lg font-bold">Lobby</h3>
              <p class="text-sm opacity-80">Main entrance</p>
            </div>
            
            <!-- Blog Room (Top) -->
            <div 
              class="col-start-2 row-start-1 bg-green-600/20 border-2 border-green-400 rounded-lg p-4 cursor-pointer transition-all hover:bg-green-600/40"
              (click)="navigateToRoom('blog')"
              [class.bg-green-600/60]="currentRoom() === 'blog'"
            >
              <h3 class="text-lg font-bold">Blog Room</h3>
              <p class="text-sm opacity-80">{{ getRoomContentCount('blog') }} posts</p>
            </div>
            
            <!-- Pages Wing (Right) -->
            <div 
              class="col-start-3 row-start-2 bg-purple-600/20 border-2 border-purple-400 rounded-lg p-4 cursor-pointer transition-all hover:bg-purple-600/40"
              (click)="navigateToRoom('pages')"
              [class.bg-purple-600/60]="currentRoom() === 'pages'"
            >
              <h3 class="text-lg font-bold">Pages Wing</h3>
              <p class="text-sm opacity-80">{{ getRoomContentCount('pages') }} pages</p>
            </div>
            
            <!-- Draft Corner (Bottom Left) -->
            <div 
              class="col-start-1 row-start-3 bg-yellow-600/20 border-2 border-yellow-400 rounded-lg p-4 cursor-pointer transition-all hover:bg-yellow-600/40"
              (click)="navigateToRoom('draft')"
              [class.bg-yellow-600/60]="currentRoom() === 'draft'"
            >
              <h3 class="text-lg font-bold">Draft Corner</h3>
              <p class="text-sm opacity-80">{{ getRoomContentCount('draft') }} drafts</p>
            </div>
            
            <!-- Archive Basement (Bottom Right) -->
            <div 
              class="col-start-3 row-start-3 bg-red-600/20 border-2 border-red-400 rounded-lg p-4 cursor-pointer transition-all hover:bg-red-600/40"
              (click)="navigateToRoom('archive')"
              [class.bg-red-600/60]="currentRoom() === 'archive'"
            >
              <h3 class="text-lg font-bold">Archive Basement</h3>
              <p class="text-sm opacity-80">{{ getRoomContentCount('archive') }} archived</p>
            </div>
          </div>
          
          <!-- Spatial Audio Controls -->
          <div class="absolute bottom-4 left-4 space-y-2">
            <button 
              class="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
              (click)="toggleSpatialAudio()"
            >
              {{ spatialAudioEnabled() ? 'Disable' : 'Enable' }} Spatial Audio
            </button>
            <button 
              class="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              (click)="playRoomBeacons()"
            >
              Play Room Beacons
            </button>
          </div>
          
          <!-- Current Position Indicator -->
          <div class="absolute top-4 right-4 bg-slate-800 p-4 rounded">
            <h4 class="font-bold">Current Position</h4>
            <p>Room: {{ getRoomName(currentRoom()) }}</p>
            <p>X: {{ userPosition().x.toFixed(1) }}, Y: {{ userPosition().y.toFixed(1) }}, Z: {{ userPosition().z.toFixed(1) }}</p>
          </div>
        </div>
      </div>
      
      <!-- Voice Navigation Status -->
      <div class="absolute top-4 left-4 bg-slate-800 p-4 rounded max-w-sm">
        <h4 class="font-bold">Voice Navigation</h4>
        <p class="text-sm opacity-80">{{ voiceStatus() }}</p>
        <p class="text-sm mt-2" *ngIf="lastCommand()">
          Last command: "{{ lastCommand() }}"
        </p>
      </div>
    </div>
  `,
})
export class SpatialMapComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private audioContext = inject(AudioContextService);
  private spatialAudio = inject(SpatialAudioService);
  private websocket = inject(WebsocketService);
  private tts = inject(SpeechSynthesisService);
  
  currentRoom = signal('lobby');
  userPosition = signal({ x: 0, y: 0, z: 0 });
  spatialAudioEnabled = signal(false);
  voiceStatus = signal('Ready for voice commands');
  lastCommand = signal('');
  
  private rooms: Room[] = [
    { id: 'lobby', name: 'Main Lobby', x: 0, y: 0, z: 0, content_count: 0 },
    { id: 'blog', name: 'Blog Room', x: 0, y: 10, z: 0, content_count: 15 },
    { id: 'pages', name: 'Pages Wing', x: 10, y: 0, z: 0, content_count: 8 },
    { id: 'draft', name: 'Draft Corner', x: -10, y: -10, z: 0, content_count: 3 },
    { id: 'archive', name: 'Archive Basement', x: 10, y: -10, z: -5, content_count: 25 },
  ];
  
  private wsConnection: any;
  private spatialWsConnection: any;
  
  ngOnInit(): void {
    this.initializeSpatialAudio();
    this.connectWebSockets();
    this.loadRoomBeacons();
  }
  
  ngOnDestroy(): void {
    this.wsConnection?.unsubscribe();
    this.spatialWsConnection?.unsubscribe();
  }
  
  private async initializeSpatialAudio(): Promise<void> {
    try {
      // Resume audio context if suspended
      if (this.audioContext.context.state === 'suspended') {
        await this.audioContext.context.resume();
      }
      
      this.spatialAudioEnabled.set(true);
      this.voiceStatus.set('Spatial audio initialized');
    } catch (error) {
      console.error('Failed to initialize spatial audio:', error);
      this.voiceStatus.set('Spatial audio unavailable');
    }
  }
  
  private connectWebSockets(): void {
    const workspaceId = this.route.snapshot.paramMap.get('id') || 'default';
    
    // Connect to voice WebSocket
    this.wsConnection = this.websocket.connect(`ws://localhost:8000/ws/voice`).subscribe({
      next: (message) => this.handleVoiceMessage(message),
      error: (error) => console.error('Voice WebSocket error:', error),
      complete: () => console.log('Voice WebSocket closed')
    });
    
    // Connect to spatial WebSocket
    this.spatialWsConnection = this.websocket.connect(`ws://localhost:8000/ws/spatial/${workspaceId}`).subscribe({
      next: (message) => this.handleSpatialMessage(message),
      error: (error) => console.error('Spatial WebSocket error:', error),
      complete: () => console.log('Spatial WebSocket closed')
    });
  }
  
  private handleVoiceMessage(message: string): void {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'stt_final') {
        this.lastCommand.set(data.text);
        this.processVoiceCommand(data.text, data.nlu);
      } else if (data.type === 'stt_partial') {
        this.voiceStatus.set(`Hearing: "${data.text}"`);
      }
    } catch (error) {
      console.error('Error parsing voice message:', error);
    }
  }
  
  private handleSpatialMessage(message: string): void {
    try {
      const data = JSON.parse(message);
      // Handle spatial updates from other users
      console.log('Spatial update:', data);
    } catch (error) {
      console.error('Error parsing spatial message:', error);
    }
  }
  
  private async processVoiceCommand(text: string, nlu: any): Promise<void> {
    const intent = nlu?.intent;
    const entities = nlu?.entities || {};
    
    this.voiceStatus.set(`Processing: "${text}"`);
    
    if (intent === 'navigate') {
      const category = entities.category;
      if (category) {
        await this.navigateToRoom(category);
      } else {
        await this.tts.speak('Please specify which room to navigate to');
      }
    } else if (intent === 'show') {
      const category = entities.category;
      if (category) {
        await this.navigateToRoom(category);
        await this.tts.speak(`Showing ${category} content`);
      }
    } else {
      await this.tts.speak('Command not recognized. Try saying "navigate to blog" or "show pages"');
    }
  }
  
  async navigateToRoom(roomId: string): Promise<void> {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) {
      await this.tts.speak('Room not found');
      return;
    }
    
    // Update position
    this.userPosition.set({ x: room.x, y: room.y, z: room.z });
    this.currentRoom.set(roomId);
    
    // Play room beacon sound
    await this.playRoomBeacon(roomId);
    
    // Announce navigation
    await this.tts.speak(`Navigated to ${room.name}`);
    this.voiceStatus.set(`In ${room.name}`);
    
    // Send spatial update
    this.broadcastSpatialPosition();
  }
  
  private async loadRoomBeacons(): Promise<void> {
    // Load spatial audio beacons for each room
    for (const room of this.rooms) {
      try {
        await this.spatialAudio.loadBeacon(
          room.id,
          `/assets/audio/beacons/${room.id}.wav`,
          { x: room.x, y: room.y, z: room.z }
        );
      } catch (error) {
        console.warn(`Could not load beacon for ${room.id}:`, error);
      }
    }
  }
  
  async playRoomBeacons(): Promise<void> {
    if (!this.spatialAudioEnabled()) {
      await this.tts.speak('Spatial audio is disabled');
      return;
    }
    
    // Play beacons for all rooms
    for (const room of this.rooms) {
      this.spatialAudio.play(room.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Stagger beacons
    }
    
    await this.tts.speak('Room beacons played');
  }
  
  private async playRoomBeacon(roomId: string): Promise<void> {
    if (this.spatialAudioEnabled()) {
      this.spatialAudio.play(roomId);
    }
  }
  
  toggleSpatialAudio(): void {
    this.spatialAudioEnabled.set(!this.spatialAudioEnabled());
    this.voiceStatus.set(
      this.spatialAudioEnabled() ? 'Spatial audio enabled' : 'Spatial audio disabled'
    );
  }
  
  getRoomName(roomId: string): string {
    return this.rooms.find(r => r.id === roomId)?.name || 'Unknown';
  }
  
  getRoomContentCount(roomId: string): number {
    return this.rooms.find(r => r.id === roomId)?.content_count || 0;
  }
  
  private broadcastSpatialPosition(): void {
    const position = this.userPosition();
    const message = {
      position: position,
      room: this.currentRoom(),
      timestamp: Date.now()
    };
    
    // Send via WebSocket (in real implementation)
    console.log('Broadcasting position:', message);
  }
}
