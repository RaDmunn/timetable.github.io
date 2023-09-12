import ejs from 'ejs';
import fs from 'fs';

// Чтение исходных .ejs файлов и генерация .html
const filesToGenerate = ['docs/index.ejs', 'docs/dl.ejs']; // Замените на ваши файлы
for (const file of filesToGenerate) {
  const ejsContent = fs.readFileSync(file, 'utf-8');
  const htmlContent = ejs.render(ejsContent);
  const htmlFileName = file.replace('.ejs', '.html');
  fs.writeFileSync(htmlFileName, htmlContent);
}