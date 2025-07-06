// Скрипт для создания базовых иконок (если нет готовых)

const fs = require('fs');
const path = require('path');

console.log(`
Для создания иконок приложения RoadMap:

1. Создайте иконку 1024x1024px с:
   - Фон: градиент #5656D6 → #7B68EE
   - Иконка: белая книга/школа
   - Скругленные углы: 180px радиус

2. Сохраните как:
   - assets/icon.png (1024x1024)
   - assets/adaptive-icon.png (1024x1024)
   - assets/splash.png (1284x2778)

3. Или воспользуйтесь онлайн-генераторами:
   - https://www.appicon.co/
   - https://icon.kitchen/
   - https://makeappicon.com/

4. После создания иконок запустите:
   npx expo prebuild --clean
`);
