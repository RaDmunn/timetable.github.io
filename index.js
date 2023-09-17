import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from"path";

import { reverseDateFormat } from './dateUtils.js';
import { addOneDay } from './dateUtils.js';
import { getNearestMonday } from './dateUtils.js';
import {sortDataAndWriteToFile} from './dateUtils.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
app.set('views', path.join(__dirname, 'docs'));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let items = JSON.parse(fs.readFileSync("data/items.json", "utf8"));

app.get("/", (req, res) => {
  res.render("index")
});

app.get("/timetable", (req, res) => {
  const currentDate = new Date();
  const nearestMonday = getNearestMonday(currentDate);
  const weeksToShow = parseInt(req.query.weeks) || 1; // По умолчанию 1 неделя

  const daysOfWeek = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота", "Неділя"];
  const schedulesForWeeks = [];

  const dl = JSON.parse(fs.readFileSync("data/deadlines.json", "utf8"));

  for (let i = 0; i < weeksToShow; i++) {
    const schedulesForWeek = daysOfWeek.map(day => {
      const scheduleForCurrentDay = JSON.parse(JSON.stringify(items.find(item => item.day === day)));

      const currentDateForDay = new Date(nearestMonday);
      currentDateForDay.setDate(nearestMonday.getDate() + (i * 7) + daysOfWeek.indexOf(day));

      const currentDateFormatted = currentDateForDay.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });

      scheduleForCurrentDay.classes = scheduleForCurrentDay.classes.filter(classInfo => {
        return classInfo.dates.includes("always") || classInfo.dates.some(date => date === currentDateFormatted || reverseDateFormat(date) === currentDateFormatted);
      });

      const currentDateFormattedReversed = reverseDateFormat(currentDateFormatted);
      return { day, schedule: scheduleForCurrentDay, currentDateFormatted: currentDateFormattedReversed };
    });

    schedulesForWeeks.push(schedulesForWeek);
  }
  res.render("timetable.ejs", { schedules: schedulesForWeeks.flat(), deadlinesData: dl, reverseDateFormat, addOneDay });
});

// Ваш маршрут
app.get("/dl", (req, res) => {
  const dl = JSON.parse(fs.readFileSync("data/deadlines.json", "utf8"));
  function parseDate(dateString) {
    const [day, month] = dateString.split('/');
    return new Date(`20${month}-${day}`);
  }
  res.render("dl", { deadlinesData: dl, parseDate });
});

app.post('/addDeadline', (req, res) => {
  const subject = req.body.subjectForDl;
  const date = req.body.dateForDl;
  const group = req.body.groupForDl;
  const task = req.body.taskForDl;

  // Отримуємо поточний JSON з файлу (якщо він існує)
  fs.readFile('data/deadlines.json', 'utf8', (err, data) => {
      if (err) {
          console.error(err);
          res.status(500).send('Помилка сервера');
          return;
      }

      const existingData = JSON.parse(data);
      // Додаємо новий об'єкт до масиву
      const newDeadline = {
          subject: subject,
          task: task,
          group: group,
          dates: date
      };
      existingData.push(newDeadline);
      
      // Зберігаємо оновлений JSON у файлі
      fs.writeFile('data/deadlines.json', JSON.stringify(existingData, null, 4), 'utf8', (err) => {
          if (err) {
              console.error(err);
              res.status(500).send('Помилка сервера');
              return;
          }
          sortDataAndWriteToFile('data/deadlines.json');

          // Після збереження можемо перенаправити користувача на іншу сторінку
          res.redirect("/dl");
      });
  });
});

app.post('/delete/:index', (req, res) => {
  const indexToDelete = parseInt(req.params.index);
  
  fs.readFile('data/deadlines.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Помилка сервера');
      return;
    }

    const existingData = JSON.parse(data);
    if (indexToDelete >= 0 && indexToDelete < existingData.length) {
      existingData.splice(indexToDelete, 1); // Удаление элемента по индексу
      fs.writeFile('data/deadlines.json', JSON.stringify(existingData, null, 4), 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Помилка сервера');
          return;
        }

        // После удаления перенаправляем пользователя на главную страницу
        res.redirect('/dl');
      });
    } else {
      res.status(400).send('Невірний індекс для видалення');
    }
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});