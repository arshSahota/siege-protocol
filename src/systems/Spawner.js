import { Unit } from "../entities/Unit.js";

export class Spawner {
  constructor(spawnX, spawnY, direction = 1) {
    this.spawnX = spawnX;
    this.spawnY = spawnY;
    this.direction = direction;

    this.unitsToSpawn = 0;
    this.spawnDelay = 30; // frames
    this.timer = 0;
    this.active = false;
  }

  startWave(count) {
    this.unitsToSpawn = count;
    this.active = true;
    this.timer = 0;
  }

  update(unitsArray) {
    if (!this.active) return;

    this.timer++;

    if (this.timer >= this.spawnDelay && this.unitsToSpawn > 0) {
      const unit = new Unit(this.spawnX, this.spawnY);
      unit.speed *= this.direction;

      unitsArray.push(unit);

      this.unitsToSpawn--;
      this.timer = 0;
    }

    if (this.unitsToSpawn === 0) {
      this.active = false;
    }
  }

  isFinished() {
    return !this.active;
  }
}
