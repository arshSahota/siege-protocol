export class Unit {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.speed = 1;
    this.hp = 50;
    this.isAlive = true;
  }

  takeDamage(amount) {
    this.hp -= amount;

    if (this.hp <= 0) {
      this.isAlive = false;
    }
  }

  update() {
    if (!this.isAlive) return;
    this.x += this.speed;
  }

  draw(ctx) {
    if (!this.isAlive) return;

    // Unit body
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, 12, 12);

    // Health bar
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y - 6, 12, 4);

    ctx.fillStyle = "green";
    ctx.fillRect(this.x, this.y - 6, 12 * (this.hp / 50), 4);
  }
}