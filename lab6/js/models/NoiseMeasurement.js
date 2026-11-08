/**
 * Клас NoiseMeasurement моделює одне окреме вимірювання рівня шуму в певний момент часу.
 */
export class NoiseMeasurement {
  constructor(value, measuredAt = new Date()) {
    this.value = Number(value);
    this.measuredAt = measuredAt instanceof Date ? measuredAt : new Date(measuredAt);
  }

  // Перевірка коректності значення вимірювання (0..200 dB)
  isValid() {
    return Number.isFinite(this.value) && this.value >= 0 && this.value <= 200;
  }

  // Форматування результату вимірювання для зручного читання
  toString() {
    const timeStr = this.measuredAt.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit"
    });
    return `${timeStr} -> ${this.value} dB`;
  }
}