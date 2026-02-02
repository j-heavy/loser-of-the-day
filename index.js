const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = '8466382774:AAHzuRkrv9HHTBSxm4EMFC1sU0mTsrc92nQ';
const bot = new TelegramBot(token, { polling: true });

const DATA_FILE = './data.json';

// ---------- funny texts ----------
const funnyTexts = [
  'Тебе дрочили в зип 🌚',
  'На уровне стрижа 📶',
  'Фортуна сегодня сказала: «не сегодня» ❌',
  'Ты не пидор — ты просто стабилен 🤡',
  'Алиена помнишь? Нет, ты - пидор 🏆',
  'Сегодня ты — живой пример, как НЕ надо',
  'Где-то грустит котик. Это из-за тебя 🐈',
  'Ты доказал, что дно — не предел 💀',
  'Ты выиграл! К сожалению',
  'Фейл дня официально зафиксирован 📉',
  'Сегодня ты — причина чужих успехов',
  'Вселенная: «Ну кто, если не ты?»',
  'Ты чмо',
  'Твоя бывшая скачет на хуе твоего лучшего друга',
  'Ты солевой наркоман и ничего более',
  'Ты спиздил МК у Гидры. Ты чмо. И пидор',
];

// ---------- achievements ----------
const ACHIEVEMENTS = [
  {
    id: 'streak_3',
    title: '🔥 3 дня подряд',
    condition: (u) => u.streak === 3
  },
  {
    id: 'streak_5',
    title: '💀 Абсолютное дно',
    condition: (u) => u.streak === 5
  },
  {
    id: 'total_10',
    title: '🏆 Легендарный пидор',
    condition: (u) => u.score === 10
  }
];

// ---------- utils ----------
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { users: {}, lastDate: null };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// ---------- commands ----------

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🤡 *ПИДОР ДНЯ*

Команды:
/reg — вступить в игру
/pidor — выбрать пидора дня
/rating — рейтинг
/achievements — твои ачивки`,
    { parse_mode: 'Markdown' }
  );
});

// /register
bot.onText(/\/reg/, (msg) => {
  const data = loadData();
  const id = msg.from.id;

  if (data.users[id]) {
    return bot.sendMessage(msg.chat.id, 'Ты уже зарегистрирован 😏');
  }

  data.users[id] = {
    name: msg.from.username || msg.from.first_name,
    score: 0,
    streak: 0,
    achievements: []
  };

  saveData(data);
  bot.sendMessage(msg.chat.id, '✅ Регистрация успешна. Удачи, пидор.');
});

// /loser
bot.onText(/\/pidor/, (msg) => {
  const data = loadData();
  const userIds = Object.keys(data.users);

  if (userIds.length < 2) {
    return bot.sendMessage(msg.chat.id, 'Нужно минимум 2 участника 😬');
  }

  if (data.lastDate === today()) {
    const funnyText = funnyTexts[Math.floor(Math.random() * funnyTexts.length)];
    const mention = mentionUser(loserId, user.username);

    const message = `🤡 *ПИДОР ДНЯ* 🤡

    ${mention} ${funnyText}
    `;

bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });

    return bot.sendMessage(msg.chat.id, 'Пидор дня уже выбран 😏');
  }

  const loserId = userIds[Math.floor(Math.random() * userIds.length)];

  userIds.forEach(id => {
    if (id === loserId) {
      data.users[id].score += 1;
      data.users[id].streak += 1;
    } else {
      data.users[id].streak = 0;
    }
  });

  const user = data.users[loserId];
  data.lastDate = today();

  const newAchievements = [];

  ACHIEVEMENTS.forEach(a => {
    if (a.condition(user) && !user.achievements.includes(a.id)) {
      user.achievements.push(a.id);
      newAchievements.push(a.title);
    }
  });

  saveData(data);

  let message = `🤡 *ПИДОР ДНЯ* 🤡

@${user.name}
${funnyTexts[Math.floor(Math.random() * funnyTexts.length)]}
`;

  if (newAchievements.length) {
    message += `\n🏅 *Новые ачивки:*\n` +
      newAchievements.map(a => `• ${a}`).join('\n');
  }

  bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
});

// /rating
bot.onText(/\/rating/, (msg) => {
  const data = loadData();

  const list = Object.values(data.users)
    .sort((a, b) => b.score - a.score)
    .map((u, i) => `${i + 1}. ${u.name} — ${u.score}`)
    .join('\n');

  bot.sendMessage(
    msg.chat.id,
    `🏆 *Рейтинг пидоров:*\n\n${list || 'Пусто 🤷‍♂️'}`,
    { parse_mode: 'Markdown' }
  );
});

// /achievements
bot.onText(/\/achievements/, (msg) => {
  const data = loadData();
  const user = data.users[msg.from.id];

  if (!user) {
    return bot.sendMessage(msg.chat.id, 'Сначала зарегистрируйся 🤡');
  }

  if (!user.achievements.length) {
    return bot.sendMessage(msg.chat.id, 'Ачивок пока нет 😏');
  }

  const list = user.achievements
    .map(id => ACHIEVEMENTS.find(a => a.id === id)?.title)
    .join('\n');

  bot.sendMessage(
    msg.chat.id,
    `🏅 *Твои ачивки:*\n\n${list}`,
    { parse_mode: 'Markdown' }
  );
});
