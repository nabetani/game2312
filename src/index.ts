import * as Phaser from 'phaser';
import { Wating } from "./waiting";

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 512,
  height: 900,
  parent: 'game-app',
  scene: [Wating],
  fps: {
    target: 60,
    forceSetTimeOut: true
  }
};

new Phaser.Game(config);
