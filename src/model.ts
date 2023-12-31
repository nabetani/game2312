import * as Phaser from 'phaser';
import { Rng } from './rng';

type Vector2 = Phaser.Math.Vector2;
const Vector2 = Phaser.Math.Vector2;
const ARROW_COUNT = 3;
const v2 = (x: number, y: number): Vector2 => {
  return new Vector2(x, y);
}
const internalDivision = (p: Vector2, q: Vector2, d: number): Vector2 => {
  return v2(
    p.x * d + q.x * (1 - d),
    p.y * d + q.y * (1 - d));
}
class Player {
  state: string = "";
  pos: Vector2 = v2(256, 550);
  vel: number = 4;
  z: number = 0;
  zVel: number = 0;
  angle: number = 0;
  isFalling: boolean = false;
};

export class Lotus {
  get LIFE_MAX() { return 60 * 10; /* 10秒 */ }
  constructor(p0: Vector2, p1: Vector2 | null, f: number, s: number, eternal: boolean = false) {
    console.log({ p0: p0, p1: p1, f: f, s: s });
    this._p0 = p0;
    this._p1 = p1 || p0;
    this._f = f;
    this._scale = s;
    this._life = this.LIFE_MAX;
    this._eternal = eternal;
    this.update();
  }
  update() {
    ++this._t;
    const d = Math.sin(this._t * this._f) / 2 + 0.5;
    this._pos = internalDivision(this._p0, this._p1, d);
  }
  _p0: Vector2;
  _p1: Vector2;
  _f: number;
  _pos: Vector2 = v2(0, 0);
  _t: number = 0;
  _scale: number;
  _life: number;
  _eternal: boolean;
  z: number = 0;
  get isLiving(): boolean { return 0 < this._life; }
  get pos(): Vector2 { return this._pos; }
  get scale(): number { return this._scale; }
  get radius(): number { return this.scale * 60; }
  get life(): number { return this._life / this.LIFE_MAX; }
  decHP() {
    if (!this._eternal) { --this._life; }
  }
  hit(p: Vector2) {
    const d2 = this.pos.distanceSq(p);
    const r = this.radius;
    return d2 < r * r;
  }
};

export class Model {
  arrowsX: number[] = [];
  arrowAngle(i: integer): number {
    return Math.sin(this.arrowsX[i]) * 90;
  }
  player: Player = new Player();
  rng: Rng;
  lotuses: Lotus[] = [];
  constructor() {
    this.rng = new Rng(0);
    for (let i = 0; i < ARROW_COUNT; ++i) {
      this.arrowsX.push(this.rng.plusMinusF(Math.PI));
    }
    this.placeLotuses();
  }
  placeLotuses() {
    type S = {
      x: number;
      y: number;
      x1?: number;
      y1?: number;
      f?: number;
      s: number;
    };
    this.lotuses.push(new Lotus(v2(256, 700), null, 0, 3.5, true));
    let ignore = 0;
    let y0 = null;
    for (let ii of [
      { x: 0, y: 0, f: 1, s: 2 },
      { x: 150, y: 150, f: 1, s: 1.6 },
      { x: 0, y: 300, f: 1, s: 2 },
      { x: -150, y: 450, f: 1, s: 1.6 },

      { x: -150, y: 630, x1: 150, f: 0.01, s: 1.6 },
      { x: -150, y: 800, x1: 150, f: 0.0123, s: 1.4 },

      { x: -150, y: 1000, y1: 1000 + 200, f: 0.0245, s: 2 },
      { x: 150, y: 1000, y1: 1000 + 250, f: 0.0261, s: 1.4 },

      { x: 0, y: 1400, s: 2.5 },

      { x: -150, y: 1550, x1: 150, y1: 1900, f: 0.0245, s: 1.5 },
      { x: -150, y: 1900, s: 1.5 },
      { x: 0, y: 2000, x1: 0, y1: 2500, f: 0.0245, s: 1 },

      { x: 0, y: 2800, s: 3.5 },
    ]) {
      const i: S = ii;
      if (0 < ignore) {
        --ignore;
        continue;
      }
      y0 = y0 == null ? i.y : y0;
      const p0 = v2(256 + i.x, 350 - (i.y - y0));
      const x1 = (i.x1 || i.x);
      const y1 = (i.y1 || i.y);
      const p1 = v2(256 + x1, 350 - (y1 - y0));
      this.lotuses.push(new Lotus(p0, p1, i.f || 0, i.s));
    }

  }
  pointerup() { }
  pointerdown() { }
  arrowClick(i: integer) {
    if (this.player.z == 0) {
      this.player.angle = this.arrowAngle(i);
      this.player.z = 0.01;
      this.player.zVel = [0.5, 0.71, 1][i];
    }
    // console.log(this.arrowAngle(i));
  }

  get lotusPlayerIsOn(): (Lotus | null) {
    if (this.player.isFalling) { return null; }
    for (let lo of this.lotuses) {
      if (lo.hit(this.player.pos)) { return lo; }
    }
    return null;
  }
  updateLotuses() {
    for (const lotus of this.lotuses) {
      lotus.update();
    }
  }
  updateWorld() {
    if (0 < this.player.z) {
      // console.log(`Jumping: z=${this.player.z}`)
      this.player.z += this.player.zVel;
      this.player.zVel -= 0.03
      const t = (this.player.angle - 90) * (Math.PI / 180);
      this.player.pos.x += Math.cos(t) * this.player.vel;
      this.player.pos.y += Math.sin(t) * this.player.vel;
      this.updateLotuses();
    } else {
      const lotus = this.lotusPlayerIsOn;
      const oldLotusPos = lotus?.pos
      this.updateLotuses();
      const newLotusPos = lotus?.pos
      if (lotus) {
        if (lotus.isLiving) {
          lotus.decHP();
          // console.log(`Waiting: z=${this.player.z}`)
          this.player.z = 0;
          if (oldLotusPos && newLotusPos) {
            this.player.pos.x += newLotusPos.x - oldLotusPos.x;
            this.player.pos.y += newLotusPos.y - oldLotusPos.y;
          }
          this.player.zVel = 0;
        } else {
          // console.log(`Falling with lotus: z=${this.player.z}`)
          this.player.z += this.player.zVel;
          lotus.z = this.player.z;
          this.player.zVel -= 0.03
        }
      } else {
        // console.log(`Falling: z=${this.player.z}`)
        this.player.z += this.player.zVel;
        this.player.zVel -= 0.03
        this.player.isFalling = true;
      }
    }
  }
  updateArrows(tick: integer) {
    for (let i = 0; i < this.arrowsX.length; i++) {
      const t0 = Math.pow(Math.PI * Math.SQRT1_2, i) % (Math.PI * 2);
      const t = (tick * 2e-2 + t0) % (Math.PI * 2);
      const v = Math.sin(t) * 2e-2 + 3e-2;
      this.arrowsX[i] += v;
    }
  }
}
