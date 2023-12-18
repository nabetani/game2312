import * as Phaser from 'phaser';

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
  constructor(p: Vector2, s: number, life: number) {
    this._pos = p;
    this._scale = s;
    this._life = life;
  }
  _pos: Vector2;
  _scale: number;
  _life: number;
  pos(): Vector2 { return this._pos; }
  scale(): number { return this._scale; }
  life(): number { return this._life; }

  progress() { }
};

export class Model {
  arrowsX: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  arrowsV: number[] = [9e-2, 10e-2, 11e-2, 13e-2, 17e-2, 5.3e-2, 7e-2, 6.1e-2,];
  arrowAngle(i: integer): number {
    return Math.sin(this.arrowsX[i]) * 90;
  }
  player: Player = new Player();
  lotuses: Lotus[] = [new Lotus(v2(256, 700), 4, 1)];

  pointerup() { }
  pointerdown() { }
  arrowClick(i: integer) {
    if (this.player.z <= 0) {
      this.player.angle = this.arrowAngle(i);
      this.player.z = 0.01;
      this.player.zVel = 1
    }
    console.log(this.arrowAngle(i));
  }
  updateLotuses() { }
  updatePlayer() {
    console.log("z=", this.player.z);
    if (this.player.z <= 0) {
      return;
    }
    this.player.z += this.player.zVel;
    this.player.zVel -= 0.03
    const t = (this.player.angle - 90) * (Math.PI / 180);
    this.player.pos.x += Math.cos(t) * this.player.vel;
    this.player.pos.y += Math.sin(t) * this.player.vel;
  }
  updateArrows() {
    for (let i = 0; i < this.arrowsV.length; i++) {
      this.arrowsX[i] += this.arrowsV[i] * 1e-1;
    }
  }
}
