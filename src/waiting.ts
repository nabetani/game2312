import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';

export class Wating extends BaseScene {
  preload() {
    this.loadImages({
      bg: "bg.jpg",
      soundOn: "soundOn.png", soundOff: "soundOff.png"
    });
  }
  create() {
    this.add.image(this.canX(0.5), this.canY(0.5), 'bg');
  }
}
