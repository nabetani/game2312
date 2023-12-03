import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';

export class Wating extends BaseScene {
  constructor() { super("Wating") }
  preload() {
    this.loadImages({
      bg: "bg.webp",
    });
  }
  create() {
    console.log("create Waiting")
    this.add.image(this.canX(0.5), this.canY(0.5), 'bg');
    const startText = this.addText(
      '\n   Click here to start game.   \n',
      this.canX(0.5), this.canY(0.4), 0.5, { fontSize: "33px", fontStyle: "bold", backgroundColor: "#fff8" });
    startText.on('pointerdown', () => {
      this.scene.start('GameMain', { sound: true });
    });
  }
}
