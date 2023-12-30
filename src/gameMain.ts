import * as Phaser from 'phaser';
import { BaseScene, Audio } from './baseScene';
import { Model, Lotus } from './model';

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

const ZP = 1.12; // ジャンプや落下の拡大縮小係数
const PY = 500; // プレイヤーの表示 Y 座標
const GAGE_COUNT = 30;

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
    this.scene.updateLotuses();
    return this
  }
}

const depth = {
  "bg": 0,
  "lotus": 100,
  "arrow": 200,
  "gage": 201,
  "player": 1000,
};

export class GameMain extends BaseScene {
  model: Model;
  phase: Phase = new StartPhase(this)
  arrows: Phaser.GameObjects.Sprite[] = [];
  gages: Phaser.GameObjects.Sprite[] = [];
  lotuses: Phaser.GameObjects.Sprite[] = [];

  constructor() {
    super("GameMain")
    this.model = new Model()
  }
  preload() {
    this.loadImages({
      bg: "bg.webp",
      arrow: "arrow.webp",
      p0: "p0.webp",
      p1: "p1.webp",
      lotus: "lotus.webp",
      gage: "lotus.webp",
    });
  }
  create() {
    console.log("create GameMain")
    this.add.image(...this.canXY(0.5), 'bg').setDepth(depth.bg);
    for (let i = 0; i < 8; i++) {
      const x = ((i % 4) * 2 + 1) * 512 / 8;
      const y = 800 - Math.floor(i / 4) * 120;
      const s = this.add.sprite(x, y, "arrow").setDepth(depth.arrow);;
      this.arrows.push(s);
      s.on('pointerdown', () => { this.model.arrowClick(i); }).setInteractive();
    }
    for (let i = 0; i < GAGE_COUNT; ++i) {
      const s = this.add.sprite(0, 0, "gage").setDepth(depth.gage);;
      s.setScale(1 / 8);
      this.gages.push(s);
    }
    this.addSprite(-100, -100, "p0", "p0")
    this.sprites.p0.setDepth(depth.player);
  }
  updatePlayer() {
    const m = this.model;
    m.updatePlayer();
    const p = m.player;
    this.sprites.p0.setPosition(p.pos.x, PY);
    this.sprites.p0.setAngle(p.angle);
    this.sprites.p0.setScale(Math.pow(ZP, p.z));
  }

  drawLotusGauge(lotus: Lotus | null) {
    const r = lotus?.radius;
    const p = lotus ? this.dispPos(this.model, lotus.pos) : null;
    for (let i = 0; i < GAGE_COUNT; ++i) {
      const g = this.gages[i];
      if (lotus && lotus.life < i / GAGE_COUNT) {
        const t = i * Math.PI * 2 / GAGE_COUNT;
        const x = p!.x + r! * Math.cos(t);
        const y = p!.y + r! * Math.sin(t);
        g.setPosition(x, y);
        g.setVisible(true);
      } else {
        g.setVisible(false);
      }
    }
  }

  dispPos(m: Model, p: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    const dy = PY - m.player.pos.y;
    return new Phaser.Math.Vector2(p.x, p.y + dy);
  }

  updateLotuses() {
    const m = this.model;
    const dy = PY - m.player.pos.y;
    m.updateLotuses();
    this.drawLotusGauge(m.lotusPlayerIsOn);
    for (let i = 0; i < m.lotuses.length; i++) {
      const o = this.model.lotuses[i];
      if (this.lotuses.length <= i) {
        this.lotuses.push(this.add.sprite(o.pos.x, dy + o.pos.y, "lotus").setDepth(depth.lotus));
      }
      const s = this.lotuses[i];
      s.setScale(o.scale * Math.pow(ZP, o.z));
      s.setPosition(o.pos.x, dy + o.pos.y);
    }
  }

  updateArrows() {
    this.model.updateArrows();
    for (let i = 0; i < this.model.arrowsX.length; i++) {
      this.arrows[i].setAngle(this.model.arrowAngle(i));
    }

  }
  update() {
    this.phase = this.phase.progress();
  }
}
