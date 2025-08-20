import { Injectable } from '@angular/core';
import { AudioContextService } from './audio-context.service';

export interface SpatialBeacon {
  id: string;
  x: number;
  y: number;
  z: number;
  buffer?: AudioBuffer;
  source?: AudioBufferSourceNode;
  panner?: PannerNode;
}

@Injectable({ providedIn: 'root' })
export class SpatialAudioService {
  private beacons = new Map<string, SpatialBeacon>();

  constructor(private audio: AudioContextService) {}

  async loadBeacon(id: string, url: string, position: { x: number; y: number; z: number }): Promise<void> {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = await this.audio.context.decodeAudioData(arrayBuffer);
    const panner = new PannerNode(this.audio.context, { panningModel: 'HRTF', distanceModel: 'inverse' });
    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z;
    this.beacons.set(id, { id, x: position.x, y: position.y, z: position.z, buffer, panner });
  }

  play(id: string): void {
    const beacon = this.beacons.get(id);
    if (!beacon || !beacon.buffer) return;
    const source = new AudioBufferSourceNode(this.audio.context, { buffer: beacon.buffer });
    beacon.source = source;
    source.connect(beacon.panner!);
    beacon.panner!.connect(this.audio.context.destination);
    source.start();
  }

  stop(id: string): void {
    const beacon = this.beacons.get(id);
    if (beacon?.source) {
      try { beacon.source.stop(); } catch {}
      beacon.source.disconnect();
      beacon.panner?.disconnect();
      beacon.source = undefined;
    }
  }
}


