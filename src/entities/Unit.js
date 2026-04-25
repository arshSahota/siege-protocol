export class Unit {
  constructor(x, y, type = "basic") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.isAlive = true;

    // Base stats by type
    if (type === "fast") {
      this.hp = 30;
      this.speed = 2;
      this.attackDamage = 1;
    } else if (type === "tank") {
      this.hp = 120;
      this.speed = 0.5;
      this.attackDamage = 2;
    } else {
      // basic
      this.hp = 50;
      this.speed = 1;
      this.attackDamage = 1;
    }

    this.maxHp = this.hp;
    this.attackCooldown = 30;
    this.attackTimer = 0;
  }

  update() {
    if (!this.isAlive) return;

    this.x += this.speed;

    if (this.attackTimer > 0) {
      this.attackTimer--;
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.isAlive = false;
    }
  }

  canAttack() {
    return this.attackTimer <= 0;
  }

  attackTower(tower) {
    if (!this.canAttack()) return;

    tower.hp -= this.attackDamage;
    this.attackTimer = this.attackCooldown;
  }

  draw(ctx) {
    if (!this.isAlive) return;

    // Color by unit type
    if (this.type === "fast") ctx.fillStyle = "cyan";
    else if (this.type === "tank") ctx.fillStyle = "purple";
    else ctx.fillStyle = "blue";

    ctx.fillRect(this.x, this.y, 12, 12);

    // HP bar
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y - 6, 12, 4);
    ctx.fillStyle = "lime";
    ctx.fillRect(
      this.x,
      this.y - 6,
      12 * (this.hp / this.maxHp),
      4
    );
  }
}