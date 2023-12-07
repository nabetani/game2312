import * as Phaser from 'phaser';
import { BaseScene, Audio } from './baseScene';
import { Model } from './model';

/*
 縦スクロール
 カエルジャンプ
 ジャンプする距離は、ボタンによる
 ジャンプする方向は、ボタンの向き
 ボタンはずっと向きを変えつづける。
 ボタンをクリックするとジャンプと同時にボタンが消滅。消滅分はすぐに供給される。
 カエルが着地した 蓮の葉（？）は、時間切れで水没。
 距離がスコア。
 */


type Phase = StartPhase | GamePhase;

class StartPhase {
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
  }
  progress(): Phase {
    return new GamePhase(this.scene);
  }
}

class GamePhase {
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
  }
  progress(): Phase {
    this.scene.updateArrows();
    this.scene.updatePlayer();
    return this
  }
}

export class GameMain extends BaseScene {
  model: Model = new Model()
  phase: Phase = new StartPhase(this)

  constructor() { super("GameMain") }
  preload() {
    this.loadImages({
      bg: "bg.webp",
      arrow: "arrow.webp",
      p0: "p0.webp",
      p1: "p1.webp",
    });
  }
  create() {
    console.log("create GameMain")
    this.add.image(...this.canXY(0.5), 'bg');
    this.addSprite(-100, -100, "p0", "p0");
    for (let i = 0; i < 8; i++) {
      const x = ((i % 4) * 2 + 1) * 512 / 8;
      const y = 800 - Math.floor(i / 4) * 120;
      const name = `arrow${i}`
      this.addSprite(x, y, "arrow", name)
      this.sprites[name].on('pointerdown', () => { this.model.arrowClick(i); }).setInteractive();
    }
  }
  updatePlayer() {
    this.model.updatePlayer();
    const p = this.model.player;
    this.sprites.p0.setPosition(p.pos.x, p.pos.y);
    this.sprites.p0.setAngle(p.angle);
    this.sprites.p0.setScale(Math.max(0, p.z / 5) + 1);
  }

  updateArrows() {
    this.model.updateArrows();
    for (let i = 0; i < this.model.arrowsX.length; i++) {
      this.sprites[`arrow${i}`].setAngle(this.model.arrowAngle(i));
    }

  }
  update() {
    this.phase = this.phase.progress();
  }
}
