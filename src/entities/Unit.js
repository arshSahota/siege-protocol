export class Unit {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 1;
  }

  update() {
    this.x += this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, 12, 12);
  }
}
