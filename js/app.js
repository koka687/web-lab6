import { NoiseSensor, NOISE_LIMITS } from "./models/NoiseSensor.js";
import { NoiseMeasurement } from "./models/NoiseMeasurement.js";
import { MobileNoiseSensor } from "./models/MobileNoiseSensor.js";
import { MonitoringSystem } from "./services/MonitoringSystem.js";

// 1. Початкові дані з п. 6.1 методички (plain objects)
const sensorsData = [
  {
    id: "NS-01",
    district: "Галицький",
    location: "просп. Свободи",
    noiseLevel: 58
  },
  {
    id: "NS-02",
    district: "Франківський",
    location: "вул. Наукова",
    noiseLevel: 74
  },
  {
    id: "NS-03",
    district: "Шевченківський",
    location: "просп. Чорновола",
    noiseLevel: 83
  }
];

// 2. Перетворення plain objects на екземпляри NoiseSensor за допомогою map та static fromObject()
const sensorInstances = sensorsData.map(item => NoiseSensor.fromObject(item));

// Додатково створюємо екземпляр похідного класу MobileNoiseSensor (демонстрація extends та super)
const mobileSensor = new MobileNoiseSensor(
  "NS-04-M",
  "Личаківський",
  "вул. Пасічна (мобільний пост)",
  51,
  18 // Заряд 18% -> потребує підзарядки
);

// 3. Ініціалізація MonitoringSystem та наповнення колекції (Композиція)
const system = new MonitoringSystem();
sensorInstances.forEach(sensor => system.addSensor(sensor));

// =========================================================================
// 4. КОНСОЛЬНІ ЕКСПЕРИМЕНТИ ТА КОНТРОЛЬНІ ПРИКЛАДИ (п. 5, 7.1, 11, 12, 14.1)
// =========================================================================
console.group("Лабораторна робота №5 — Система класів «Акустична варта»");

console.log("Централізовані межі класифікації NOISE_LIMITS:", NOISE_LIMITS);
console.log("Стартові сенсори в MonitoringSystem (3 шт.):", system.sensors);
console.log(
  "Контроль статусів (п. 14.1):",
  system.sensors.map(s => `${s.id} (${s.noiseLevel} dB) -> ${s.getStatus()}`)
);
console.log("Контроль середнього рівня шуму (очікується ~71.67 dB):", system.getAverageNoiseLevel(), "dB");

// Додаємо мобільний сенсор після перевірки контрольного середнього 3-х стартових датчиків
system.addSensor(mobileSensor);

// Експеримент п. 7.1: Методи класів, prototype та власні властивості
console.group("Експеримент п. 7.1 — Prototype та власні властивості екземплярів");
const sensorA = system.findSensorById("NS-01");
const sensorB = system.findSensorById("NS-02");
console.log("sensorA.getStatus === sensorB.getStatus:", sensorA.getStatus === sensorB.getStatus); // true
console.log('Object.hasOwn(sensorA, "noiseLevel"):', Object.hasOwn(sensorA, "noiseLevel"));       // true
console.log('Object.hasOwn(sensorA, "getStatus"):', Object.hasOwn(sensorA, "getStatus"));         // false
console.log('Object.hasOwn(NoiseSensor.prototype, "getStatus"):', Object.hasOwn(NoiseSensor.prototype, "getStatus")); // true
console.groupEnd();

// Перевірка пошуку, фільтрації та наслідування
console.group("Перевірка методів MonitoringSystem та MobileNoiseSensor");
console.log('findSensorById("NS-02"):', system.findSensorById("NS-02"));
console.log('getSensorsByDistrict("Галицький"):', system.getSensorsByDistrict("Галицький"));
console.log("getCriticalSensors():", system.getCriticalSensors());
console.log(
  `Мобільний датчик ${mobileSensor.id}: батарея ${mobileSensor.batteryLevel}%, needsCharging() ->`,
  mobileSensor.needsCharging()
);
console.groupEnd();

console.groupEnd();

// =========================================================================
// 5. ШАР ПРЕДСТАВЛЕННЯ (DOM-РЕНДЕРИНГ КАРТОК ТА ІНТЕРАКТИВНЕ ОНОВЛЕННЯ)
// =========================================================================

const STATUS_LABELS = {
  normal: "Норма (normal)",
  warning: "Попередження (warning)",
  critical: "Критичний (critical)"
};

/**
 * Окрема функція представлення renderSensorCard(sensor) (п. 15 методички).
 * Не є методом класу NoiseSensor, щоб не змішувати модель предметної області з DOM.
 */
function renderSensorCard(sensor) {
  const status = sensor.getStatus(); // "normal", "warning" або "critical"
  const article = document.createElement("article");
  article.className = `card sensor-card ${status}`;

  const lastMeasurements = sensor.measurements
    .slice(-3)
    .map(m => m.toString())
    .join(" | ");

  const mobileBadge = sensor instanceof MobileNoiseSensor
    ? `<p class="sensor-card__battery">🔋 Батарея: <strong>${sensor.batteryLevel}%</strong> ${
        sensor.needsCharging() ? "(Потрібна зарядка!)" : "(ОК)"
      }</p>`
    : "";

  article.innerHTML = `
    <div class="sensor-card__header">
      <span class="sensor-card__id">${sensor.id}</span>
      <span class="sensor-card__status status-badge ${status}">${STATUS_LABELS[status]}</span>
    </div>
    <h3>Район: ${sensor.district}</h3>
    <p class="sensor-card__location">📍 Адреса: ${sensor.location}</p>
    <p class="sensor-card__level">Поточний рівень: <strong>${sensor.noiseLevel} dB</strong></p>
    ${mobileBadge}
    <p class="sensor-card__history">Історія (${sensor.measurements.length}): ${lastMeasurements}</p>
  `;

  return article;
}

/**
 * Повний рендеринг панелі моніторингу та списку датчиків на сторінці
 */
function renderDashboard(selectedDistrict = "all") {
  const gridContainer = document.getElementById("sensors-grid");
  const summaryElement = document.getElementById("system-summary");
  const sensorSelect = document.getElementById("measurement-sensor-id");

  if (!gridContainer) return;

  // Оновлення зведеної статистики системи через методи MonitoringSystem
  if (summaryElement) {
    const avg = system.getAverageNoiseLevel();
    const critCount = system.getCriticalSensors().length;
    summaryElement.innerHTML = `
      Усього датчиків у системі: <strong>${system.sensors.length}</strong> |
      Середній рівень шуму: <strong>${avg !== null ? avg + " dB" : "—"}</strong> |
      Критичних датчиків (> ${NOISE_LIMITS.warningMax} dB): <strong>${critCount}</strong>
    `;
  }

  // Заповнення випадаючого списку ID датчиків у формі додавання вимірювання
  if (sensorSelect && sensorSelect.options.length !== system.sensors.length) {
    sensorSelect.innerHTML = system.sensors
      .map(s => `<option value="${s.id}">${s.id} — ${s.district} (${s.location})</option>`)
      .join("");
  }

  // Отримання відфільтрованої колекції через метод системи
  const sensorsToDisplay = system.getSensorsByDistrict(selectedDistrict);

  gridContainer.innerHTML = "";
  sensorsToDisplay.forEach(sensor => {
    gridContainer.appendChild(renderSensorCard(sensor));
  });
}

// Ініціалізація інтерфейсу після завантаження DOM
document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();

  // Обробник фільтрації за районом
  const districtFilter = document.getElementById("district-filter");
  if (districtFilter) {
    districtFilter.addEventListener("change", event => {
      renderDashboard(event.target.value);
    });
  }

  // Обробник форми додавання нового вимірювання до обраного датчика
  const measurementForm = document.getElementById("add-measurement-form");
  const feedbackEl = document.getElementById("measurement-feedback");

  if (measurementForm) {
    measurementForm.addEventListener("submit", event => {
      event.preventDefault();
      const sensorId = document.getElementById("measurement-sensor-id").value;
      const rawValue = Number(document.getElementById("measurement-value").value);

      try {
        const targetSensor = system.findSensorById(sensorId);
        if (!targetSensor) {
          throw new Error(`Датчик ${sensorId} не знайдено`);
        }

        // Створюємо екземпляр NoiseMeasurement і додаємо його в датчик
        const newMeasurement = new NoiseMeasurement(rawValue);
        targetSensor.addMeasurement(newMeasurement);

        const activeFilter = districtFilter ? districtFilter.value : "all";
        renderDashboard(activeFilter);

        if (feedbackEl) {
          feedbackEl.textContent = `✅ Додано вимірювання ${rawValue} dB для ${sensorId}. Новий статус: ${targetSensor.getStatus()}`;
          feedbackEl.style.color = "#10b981";
        }
        measurementForm.reset();
      } catch (error) {
        if (feedbackEl) {
          feedbackEl.textContent = `❌ Помилка: ${error.message}`;
          feedbackEl.style.color = "#ef4444";
        }
      }
    });
  }
});


const sensors = [ 
  { id: "NS-01", district: "Галицький", location: "просп. Свободи, 1", noiseLevel: 52, status: "normal" }, 
  { id: "NS-02", district: "Франківський", location: "вул. Наукова, 10", noiseLevel: 68, status: "warning" }, 
  { id: "NS-03", district: "Шевченківський", location: "просп. Чорновола, 20", noiseLevel: 83, status: "critical" }, 
  { id: "NS-04", district: "Галицький", location: "вул. Городоцька, 15", noiseLevel: 79, status: "critical" } 
]; 

const sensorList = document.querySelector(".sensor-list"); 
const districtFilter = document.querySelector("#district-filter"); 
const criticalFilter = document.querySelector("#critical-filter"); 

function createSensorCard(sensor) { 
  const card = document.createElement("article"); 
  card.classList.add("sensor-card", `sensor-card--${sensor.status}`); 
  card.innerHTML = `
    <h3>${sensor.id}</h3>
    <p>Район: ${sensor.district}</p>
    <p>Локація: ${sensor.location}</p>
    <p>Рівень шуму: ${sensor.noiseLevel} дБ</p>
    <p>Статус: ${sensor.status}</p>
  `;
  return card; 
} 

function renderSensors(sensorArray) { 
  sensorList.replaceChildren(); 
  sensorArray.forEach((sensor) => sensorList.append(createSensorCard(sensor))); 
} 

function applyFilters() { 
  const selectedDistrict = districtFilter.value; 
  const criticalOnly = criticalFilter.checked; 
  const filtered = sensors.filter((sensor) => { 
    const matchesDistrict = selectedDistrict === "all" || sensor.district === selectedDistrict; 
    const matchesStatus = !criticalOnly || sensor.status === "critical"; 
    return matchesDistrict && matchesStatus; 
  }); 
  renderSensors(filtered); 
} 

districtFilter.addEventListener("change", applyFilters); 
criticalFilter.addEventListener("change", applyFilters); 
renderSensors(sensors);