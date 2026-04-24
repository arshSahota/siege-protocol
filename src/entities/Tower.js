export class Tower {
  constructor(x, y, owner) {
    this.x = x;
    this.y = y;
    this.owner = owner;
    this.hp = 100;
  }

  draw(ctx) {
    ctx.fillStyle = this.owner === "enemy" ? "red" : "green";
    ctx.fillRect(this.x, this.y, 40, 40);
  }
}
