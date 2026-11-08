import { NoiseSensor } from "../models/NoiseSensor.js";

/**
 * Клас MonitoringSystem керує колекцією датчиків NoiseSensor (Композиція MonitoringSystem -> NoiseSensor[]).
 */
export class MonitoringSystem {
  constructor() {
    this.sensors = [];
  }

  // Додає екземпляр NoiseSensor (або його підкласу MobileNoiseSensor) і блокує дублікати ID
  addSensor(sensor) {
    if (!(sensor instanceof NoiseSensor)) {
      throw new Error("Можна додавати лише екземпляри класу NoiseSensor");
    }

    const sensorExists = this.sensors.some(item => item.id === sensor.id);
    if (sensorExists) {
      throw new Error(`Датчик із ID ${sensor.id} вже існує в системі`);
    }

    this.sensors.push(sensor);
  }

  // Пошук датчика за ID (повертає знайдений екземпляр або null)
  findSensorById(id) {
    return this.sensors.find(sensor => sensor.id === id) || null;
  }

  // Повертає масив датчиків за назвою району
  getSensorsByDistrict(district) {
    if (!district || district === "all") {
      return [...this.sensors];
    }
    return this.sensors.filter(sensor => sensor.district === district);
  }

  // Повертає список критичних датчиків, використовуючи метод об'єкта sensor.getStatus()
  getCriticalSensors() {
    return this.sensors.filter(sensor => sensor.getStatus() === "critical");
  }

  // Обчислює середній рівень шуму по всій системі (для порожньої колекції повертає null)
  getAverageNoiseLevel() {
    if (this.sensors.length === 0) {
      return null;
    }
    const total = this.sensors.reduce((sum, sensor) => sum + sensor.noiseLevel, 0);
    return Number((total / this.sensors.length).toFixed(2));
  }
}