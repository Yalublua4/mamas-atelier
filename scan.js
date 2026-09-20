const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const outputFile = path.join(__dirname, 'catalog.json');

// Если папки images нет, создаём пустой каталог
if (!fs.existsSync(imagesDir)) {
  fs.writeFileSync(outputFile, JSON.stringify([], null, 2), 'utf8');
  console.log('Папка images не найдена, создан пустой catalog.json');
  process.exit(0);
}

const files = fs.readdirSync(imagesDir);
const catalog = [];

files.forEach((file) => {
  const ext = path.extname(file).toLowerCase();
  
  // Берем только графические файлы
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return;

  const fileName = path.parse(file).name;

  // Пропускаем служебные файлы логотипа и ориентира
  if (['LOGO', 'ORIENTIR'].includes(fileName.toUpperCase())) return;

  // Разбиваем имя по нижнему подчёркиванию: Название_Цена_Единица_Статус
  const parts = fileName.split('_');

  if (parts.length >= 4) {
    const rawTitle = parts[0];
    const price = parseInt(parts[1], 10) || 0;
    const unitRaw = parts[2].toUpperCase();
    const statusRaw = parts[3].toUpperCase();

    // Превращаем дефисы в названиях обратно в пробелы
    const title = rawTitle.replace(/-/g, ' ');

    // Расшифровываем единицу измерения
    let unit = unitRaw;
    if (unitRaw === 'M') unit = 'за 1 метр';
    if (unitRaw === 'SH') unit = 'за 1 шт.';

    // Статус наличия (A — есть, N — нет)
    const inStock = statusRaw === 'A';

    catalog.push({
      id: file,
      title: title,
      price: price,
      unit: unit,
      inStock: inStock,
      image: `images/${file}`
    });
  }
});

// Сортируем: сначала показываем товары, которые есть в наличии
catalog.sort((a, b) => b.inStock - a.inStock);

// Записываем результат в catalog.json
fs.writeFileSync(outputFile, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`Каталог успешно обновлён! Обработано товаров: ${catalog.length}`);
