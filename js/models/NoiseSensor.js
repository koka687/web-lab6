import { NoiseMeasurement } from "./NoiseMeasurement.js";

/**
 * Централізовані бізнес-правила класифікації шуму (п. 9 методички):
 * <= 55 dB — normal; 56..70 dB — warning; > 70 dB — critical.
 */
export const NOISE_LIMITS = Object.freeze({
  normalMax: 55,
  warningMax: 70
});

/**
 * Клас NoiseSensor моделює фізичний датчик шуму у конкретній точці міста.
 */
export class NoiseSensor {
  constructor(id, district, location, noiseLevel) {
    if (!NoiseSensor.isValidNoiseLevel(noiseLevel)) {
      throw new Error(`Некоректний початковий рівень шуму для датчика ${id}: ${noiseLevel}`);
    }
    this.id = id;
    this.district = district;
    this.location = location;
    this.noiseLevel = Number(noiseLevel);
    this.measurements = [new NoiseMeasurement(this.noiseLevel)];
  }

  // Визначає поточний статус датчика без дублювання чисел 55 і 70
  getStatus() {
    if (this.noiseLevel <= NOISE_LIMITS.normalMax) {
      return "normal";
    }
    if (this.noiseLevel <= NOISE_LIMITS.warningMax) {
      return "warning";
    }
    return "critical";
  }

  // Оновлює поточний рівень шуму після перевірки через static-метод
  updateNoiseLevel(value) {
    const numericValue = Number(value);
    if (!NoiseSensor.isValidNoiseLevel(numericValue)) {
      throw new Error(`Неприпустиме значення рівня шуму: ${value} dB`);
    }
    this.noiseLevel = numericValue;
  }

  // Додає новий об'єкт NoiseMeasurement в історію датчика та оновлює поточний рівень (Композиція)
  addMeasurement(measurement) {
    if (!(measurement instanceof NoiseMeasurement)) {
      throw new Error("Очікується об'єкт класу NoiseMeasurement");
    }
    if (!measurement.isValid()) {
      throw new Error(`Вимірювання ${measurement.value} dB є некоректним`);
    }
    this.measurements.push(measurement);
    this.updateNoiseLevel(measurement.value);
  }

  // Static-метод перевірки допустимості рівня шуму (не потребує this конкретного екземпляра)
  static isValidNoiseLevel(value) {
    return Number.isFinite(value) && value >= 0 && value <= 200;
  }

  // Static-фабричний метод створення екземпляра NoiseSensor зі звичайного об'єкта (plain object)
  static fromObject(data) {
    if (!data || !data.id || !data.district || !data.location || data.noiseLevel === undefined) {
      throw new Error("Недостатньо даних для створення об'єкта NoiseSensor");
    }
    return new NoiseSensor(data.id, data.district, data.location, Number(data.noiseLevel));
  }
}