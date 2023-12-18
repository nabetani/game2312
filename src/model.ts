import * as Phaser from 'phaser';
import { Rng } from './rng';

type Vector2 = Phaser.Math.Vector2;
const Vector2 = Phaser.Math.Vector2;
const v2 = (x: number, y: number): Vector2 => {
  return new Vector2(x, y);
}

class Player {
  state: string = "";
  pos: Vector2 = v2(256, 550);
  vel: number = 3;
  z: number = 0;
  zVel: number = 0;
  angle: number = 0;
};

class Lotus {
  get LIFE_MAX() { return 60 * 2; /* 2秒 */ }
  constructor(p: Vector2, s: number) {
    this._pos = p;
    this._scale = s;
    this._life = this.LIFE_MAX;
  }
  _pos: Vector2;
  _scale: number;
  _life: number;
  z: number = 0;
  get isLiving(): boolean { return 0 < this._life; }
  get pos(): Vector2 { return this._pos; }
  get scale(): number { return this._scale; }
  get life(): number { return this._life; }
  decHP() { --this._life; }
  hit(p: Vector2) {
    const d2 = this.pos.distanceSq(p);
    const r = 60;
    return d2 < r * r * this.scale * this.scale;
  }
};

export class Model {
  arrowsX: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  arrowsV: number[] = [9e-2, 10e-2, 11e-2, 13e-2, 17e-2, 5.3e-2, 7e-2, 6.1e-2,];
  arrowAngle(i: integer): number {
    return Math.sin(this.arrowsX[i]) * 90;
  }
  player: Player = new Player();
  rng: Rng;
  lotuses: Lotus[];
  constructor() {
    this.rng = new Rng(0);
    this.lotuses = [new Lotus(v2(256, 700), 3.5)];
    for (let i = 0; i < 20; ++i) {
      const x = 256 + this.rng.plusMinusF(200);
      const y = 400 - i * 200;
      const s = 1.5 + this.rng.plusMinusF(0.7);
      this.lotuses.push(new Lotus(v2(x, y), s));
    }
  }
  pointerup() { }
  pointerdown() { }
  arrowClick(i: integer) {
    if (this.player.z == 0) {
      this.player.angle = this.arrowAngle(i);
      this.player.z = 0.01;
      this.player.zVel = 1
    }
    console.log(this.arrowAngle(i));
  }
  updateLotuses() { }
  lotusWithPlayerOnIt() {
    for (let lo of this.lotuses) {
      if (lo.hit(this.player.pos)) { return lo; }
    }
    return null;
  }
  updatePlayer() {
    if (0 < this.player.z) {
      console.log(`Jumping: z=${this.player.z}`)
      this.player.z += this.player.zVel;
      this.player.zVel -= 0.03
      const t = (this.player.angle - 90) * (Math.PI / 180);
      this.player.pos.x += Math.cos(t) * this.player.vel;
      this.player.pos.y += Math.sin(t) * this.player.vel;
    } else {
      const lotus = this.lotusWithPlayerOnIt();
      if (lotus) {
        if (lotus.isLiving) {
          lotus.decHP();
          console.log(`Waiting: z=${this.player.z}`)
          this.player.z = 0;
          this.player.zVel = 0;
        } else {
          console.log(`Falling with lotus: z=${this.player.z}`)
          this.player.z += this.player.zVel;
          lotus.z = this.player.z;
          this.player.zVel -= 0.03
        }
      } else {
        console.log(`Falling: z=${this.player.z}`)
        this.player.z += this.player.zVel;
        this.player.zVel -= 0.03
      }
    }
  }
  updateArrows() {
    for (let i = 0; i < this.arrowsV.length; i++) {
      this.arrowsX[i] += this.arrowsV[i] * 1e-1;
    }
  }
}
