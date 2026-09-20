const fs = require('fs');
const path = require('path');

// Пути к папкам и файлам
const IMAGES_DIR = path.join(__dirname, 'images');
const OUTPUT_FILE = path.join(__dirname, 'catalog.json');

// Поддерживаемые форматы картинок
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

function updateCatalog() {
  console.log('🔍 Сканирование папки с изображениями...');

  // Проверяем наличие папки images/
  if (!fs.existsSync(IMAGES_DIR)) {
    console.warn('⚠️ Папка "images" не найдена. Создаём пустую папку...');
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // Читаем файлы
  const allFiles = fs.readdirSync(IMAGES_DIR);

  // Фильтруем только изображения, исключая скрытые файлы (.DS_Store, .gitkeep и т.д.)
  const imageFiles = allFiles.filter(file => {
    if (file.startsWith('.')) return false;
    const ext = path.extname(file).toLowerCase();
    return ALLOWED_EXTENSIONS.has(ext);
  });

  // Сортируем по алфавиту
  imageFiles.sort((a, b) => a.localeCompare(b, 'ru'));

  // Записываем результат в catalog.json с красивым форматированием
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(imageFiles, null, 2), 'utf-8');

  // Небольшой отчёт в консоль
  const specialFiles = imageFiles.filter(f => {
    const u = f.toUpperCase();
    return u.startsWith('LOGO') || u.startsWith('ORIENTIR');
  });

  console.log(`✅ Файл catalog.json успешно обновлён!`);
  console.log(`📦 Всего изображений: ${imageFiles.length}`);
  console.log(`🏷️ Из них товаров: ${imageFiles.length - specialFiles.length}`);
  if (specialFiles.length > 0) {
    console.log(`ℹ️ Системные фото: ${specialFiles.join(', ')}`);
  }
}

updateCatalog();
