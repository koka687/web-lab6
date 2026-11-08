import { NoiseSensor } from "./NoiseSensor.js";

/**
 * Клас MobileNoiseSensor є різновидом NoiseSensor (наслідування extends)
 * і моделює пересувний акустичний датчик із контролем заряду батареї.
 */
export class MobileNoiseSensor extends NoiseSensor {
  constructor(id, district, location, noiseLevel, batteryLevel = 100) {
    // Виклик конструктора батьківського класу NoiseSensor перед зверненням до this
    super(id, district, location, noiseLevel);
    this.batteryLevel = Number(batteryLevel);
  }

  // Перевіряє, чи потребує мобільний датчик підзарядки (заряд <= 20%)
  needsCharging() {
    return this.batteryLevel <= 20;
  }
}