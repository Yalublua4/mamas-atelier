const fs = require('fs');
const path = require('path');

// Пути к папкам и файлам
const IMAGES_DIR = path.join(__dirname, 'images');
const OUTPUT_FILE = path.join(__dirname, 'catalog.json');

// Поддерживаемые форматы картинок
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

/**
 * Рекурсивный поиск всех картинок во всех вложенных папках
 */
function scanDirectory(dir, baseDir = dir) {
  let results = [];

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    // Пропускаем скрытые файлы и папки (.DS_Store, .git и т.д.)
    if (item.name.startsWith('.')) continue;

    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      // Если это папка (раздел) — заходим внутрь
      results = results.concat(scanDirectory(fullPath, baseDir));
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      if (ALLOWED_EXTENSIONS.has(ext)) {
        // Получаем относительный путь от папки images (например: "Пуговицы/300_SH_A_AO.jpg")
        const relativePath = path.relative(baseDir, fullPath);

        // Превращаем системные слэши Windows (\) в стандартные веб-слэши (/)
        const webPath = relativePath.replace(/\\/g, '/');
        results.push(webPath);
      }
    }
  }

  return results;
}

function updateCatalog() {
  console.log('🔍 Сканирование папки images и её разделов...');

  // Проверяем наличие папки images/
  if (!fs.existsSync(IMAGES_DIR)) {
    console.warn('⚠️ Папка "images" не найдена. Создаём пустую папку...');
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // Получаем файлы со всех подпапок
  const imageFiles = scanDirectory(IMAGES_DIR);

  // Сортируем по алфавиту
  imageFiles.sort((a, b) => a.localeCompare(b, 'ru'));

  // Записываем результат в catalog.json
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(imageFiles, null, 2), 'utf-8');

  // Определяем системные файлы (LOGO, ORIENTIR)
  const specialFiles = imageFiles.filter(f => {
    const filename = path.basename(f).toUpperCase();
    return filename.startsWith('LOGO') || filename.startsWith('ORIENTIR');
  });

  // Собираем статистику по разделам (папкам)
  const categoriesCount = {};
  imageFiles.forEach(f => {
    const parts = f.split('/');
    if (parts.length > 1) {
      const folder = parts[0];
      categoriesCount[folder] = (categoriesCount[folder] || 0) + 1;
    }
  });

  console.log(`\n✅ Файл catalog.json успешно обновлён!`);
  console.log(`📦 Всего файлов: ${imageFiles.length}`);
  console.log(`🏷️ Из них товаров: ${imageFiles.length - specialFiles.length}`);

  const folders = Object.keys(categoriesCount);
  if (folders.length > 0) {
    console.log(`\n📁 Найденные разделы (${folders.length}):`);
    folders.forEach(name => {
      console.log(`   • ${name}: ${categoriesCount[name]} шт.`);
    });
  }

  if (specialFiles.length > 0) {
    console.log(`\nℹ️ Системные фото: ${specialFiles.join(', ')}`);
  }
}

updateCatalog();