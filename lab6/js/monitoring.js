/**
 * Лабораторна робота №4
 * Дисципліна: WEB-програмування
 * Проєкт: «Акустична варта» — аналіз послідовності вимірювань шуму (dB)
 * Студентка: Заворотня Анна, група КН-42
 */

// ==========================================
// 1. ВИХІДНІ ДАНІ І ПОРОГОВІ РІВНІ
// ==========================================
const noiseLevels = [
  42, 55, 61, 78, 83, 67, 49, 72, 91, 58, 64, 76,
  53, 47, 88, 69, 74, 82, 95, 51, 71, -1, 85, 63,
  79, 39, 141, 86
];

const warningLevel = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;

// ==========================================
// 2. СТРІЛКОВІ ФУНКЦІЇ (ПЕРЕНЕСЕНІ НА ВЕРХ, ЩОБ УНИКНУТИ TDZ)
// ==========================================
const statusLabel = value => `Рівень: ${value} dB`;
const isAbove = (value, threshold) => value > threshold;

// ==========================================
// 3. FUNCTION DECLARATION ТА АЛГОРИТМИ НА ЦИКЛАХ
// ==========================================

function isValidLevel(level, min, max) {
  return Number.isFinite(level) && level >= min && level <= max;
}

function calculateAverage(data, min, max) {
  let sum = 0;
  let validCount = 0;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    sum += level;
    validCount++;
  }

  return validCount === 0 ? null : sum / validCount;
}

function findMinimum(data, min, max) {
  let minVal = null;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    if (minVal === null || level < minVal) {
      minVal = level;
    }
  }

  return minVal;
}

function findMaximum(data, min, max) {
  let maxVal = null;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    if (maxVal === null || level > maxVal) {
      maxVal = level;
    }
  }

  return maxVal;
}

// Function Declaration (працює hoisting)
function findFirstCritical(data, critLimit, min, max) {
  let result = null;

  for (let i = 0; i < data.length; i++) {
    const level = data[i];
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    if (isAbove(level, critLimit)) {
      result = {
        value: level,
        index: i,
        position: i + 1
      };
      break;
    }
  }

  return result;
}

function findRecovery(data, warnLimit, critLimit, min, max) {
  const firstCritical = findFirstCritical(data, critLimit, min, max);
  if (firstCritical === null) {
    return null;
  }

  let i = firstCritical.index + 1;
  let safeStreak = 0;

  while (i < data.length) {
    const level = data[i];

    if (isValidLevel(level, min, max) && level <= warnLimit) {
      safeStreak++;
      if (safeStreak === 3) {
        return {
          position: i + 1,
          value: level
        };
      }
    } else {
      safeStreak = 0;
    }

    i++;
  }

  return null;
}

function findFirstValid(data, min, max) {
  if (data.length === 0) {
    return null;
  }

  let i = 0;
  do {
    const level = data[i];
    if (isValidLevel(level, min, max)) {
      return {
        value: level,
        position: i + 1
      };
    }
    i++;
  } while (i < data.length);

  return null;
}

function findInvalidRecords(data, min, max) {
  const invalidItems = [];

  for (let i = 0; i < data.length; i++) {
    if (!isValidLevel(data[i], min, max)) {
      invalidItems.push({
        position: i + 1,
        value: data[i]
      });
    }
  }

  return invalidItems;
}

// ==========================================
// 4. FUNCTION EXPRESSION ТА CALLBACK
// ==========================================

const countByCategory = function (data, warnLimit, critLimit, min, max) {
  let validCount = 0;
  let invalidCount = 0;
  let sum = 0;
  let normal = 0;
  let warning = 0;
  let critical = 0;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      invalidCount++;
      continue;
    }

    validCount++;
    sum += level;

    if (level <= warnLimit) {
      normal++;
    } else if (level > warnLimit && level <= critLimit) {
      warning++;
    } else if (level > critLimit) {
      critical++;
    }
  }

  return {
    total: data.length,
    validCount,
    invalidCount,
    sum,
    normal,
    warning,
    critical,
    exceededWarningTotal: warning + critical
  };
};

function runCategoryAnalysis(data, analyzerCallback, warnLimit, critLimit, min, max) {
  return analyzerCallback(data, warnLimit, critLimit, min, max);
}

// ==========================================
// 5. ФОРМУВАННЯ КОНСОЛЬНОГО ЗВІТУ
// ==========================================

function printMonitoringReport(data, warnLimit, critLimit, min, max) {
  const stats = runCategoryAnalysis(data, countByCategory, warnLimit, critLimit, min, max);
  const average = calculateAverage(data, min, max);
  const minLevel = findMinimum(data, min, max);
  const maxLevel = findMaximum(data, min, max);
  const firstCritical = findFirstCritical(data, critLimit, min, max);
  const recovery = findRecovery(data, warnLimit, critLimit, min, max);
  const firstValid = findFirstValid(data, min, max);
  const invalidList = findInvalidRecords(data, min, max);

  console.group("Акустична варта -- звіт моніторингу");

  console.log(`Пороги: попередження > ${warnLimit} dB; критичний рівень > ${critLimit} dB`);
  console.log(`Усього вимірювань: ${stats.total}`);
  console.log(`Коректних: ${stats.validCount}`);
  console.log(`Некоректних: ${stats.invalidCount}`);

  console.table([
    { "Категорія": "Без перевищення", "Кількість": stats.normal },
    { "Категорія": "Попередження", "Кількість": stats.warning },
    { "Категорія": "Критичні", "Кількість": stats.critical }
  ]);

  const formattedAvg = average !== null ? average.toFixed(2).replace(".", ",") : "null";
  console.log(`Середній рівень: ${formattedAvg} dB`);
  console.log(`Мінімальний рівень: ${minLevel !== null ? minLevel + " dB" : "null"}`);
  console.log(`Максимальний рівень: ${maxLevel !== null ? maxLevel + " dB" : "null"}`);

  if (firstValid !== null) {
    console.log(`Перше коректне вимірювання (do...while): ${statusLabel(firstValid.value)}, позиція ${firstValid.position}`);
  } else {
    console.log("Перше коректне вимірювання (do...while): не знайдено (null)");
  }

  if (firstCritical !== null) {
    console.log(`Перше критичне вимірювання: ${firstCritical.value} dB, позиція ${firstCritical.position}`);
  } else {
    console.log("Перше критичне вимірювання: не знайдено (null)");
  }

  if (recovery !== null) {
    console.log(`Відновлення -- три безпечні вимірювання поспіль: позиція ${recovery.position} (${recovery.value} dB)`);
  } else {
    console.log("Відновлення -- три безпечні вимірювання поспіль: не знайдено");
  }

  if (stats.exceededWarningTotal > 0) {
    console.warn(`Поріг ${warnLimit} dB перевищено у ${stats.exceededWarningTotal} вимірюваннях.`);
  }

  if (invalidList.length > 0) {
    const details = invalidList.map(item => `позиція ${item.position} (${item.value} dB)`).join(", ");
    console.error(`Некоректні дані: ${details}.`);
  }

  if (stats.critical > 0) {
    const recoveryText = recovery !== null
      ? `стійке відновлення зафіксовано на позиції ${recovery.position}.`
      : "після першого з них стійкого відновлення не виявлено.";
    console.log(`Висновок: зафіксовано ${stats.critical} критичні вимірювання; ${recoveryText}`);
  } else {
    console.log("Висновок: критичних перевищень рівня шуму не зафіксовано.");
  }

  console.groupEnd();
}

// Запуск звіту
printMonitoringReport(noiseLevels, warningLevel, criticalLevel, minValidLevel, maxValidLevel);