export class Tower {
  constructor(x, y, owner) {
    this.x = x;
    this.y = y;
    this.owner = owner;

    this.hp = 100;

    // Combat
    this.range = 150;
    this.damage = 5;
    this.fireRate = 60; // frames
    this.cooldown = 0;
  }

  update(playerUnits, enemyUnits) {
    if (this.cooldown > 0) {
      this.cooldown--;
      return;
    }

    const targets =
      this.owner === "enemy" ? playerUnits : enemyUnits;

    const target = this.findTarget(targets);
    if (target) {
      target.takeDamage(this.damage);
      this.cooldown = this.fireRate;
    }
  }

  findTarget(units) {
    return units.find(unit => {
      if (!unit.isAlive) return false;

      const dx = unit.x - this.x;
      const dy = unit.y - this.y;
      const distance = Math.hypot(dx, dy);

      return distance <= this.range;
    });
  }

  isReachedBy(unit) {
    const centerX = this.x + 20;
    const centerY = this.y + 20;

    const dx = unit.x - centerX;
    const dy = unit.y - centerY;

    const distance = Math.hypot(dx, dy);
    return distance < 20;
  }

draw(ctx) {
  // Tower body
  ctx.fillStyle = this.owner === "enemy" ? "red" : "green";
  ctx.fillRect(this.x, this.y, 40, 40);

  // --- HP BAR (minimal UI) ---
  ctx.fillStyle = "darkred";
  ctx.fillRect(this.x, this.y - 8, 40, 5);

  ctx.fillStyle = "lime";
  ctx.fillRect(
    this.x,
    this.y - 8,
    40 * (this.hp / 100),
    5
  );

  // Debug: range
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.arc(this.x + 20, this.y + 20, this.range, 0, Math.PI * 2);
  ctx.stroke();
  }
}
