// Word / sentence pools used by the server to generate prompts.
// Shared between server (require) and could be reused client-side for preview.
// Two languages supported: fa (Persian) and en (English).

const WORD_LISTS = {
  fa: {
    easy: [
      "کتاب", "دریا", "ستاره", "خورشید", "درخت", "گربه", "شهر", "باران",
      "کوه", "پرنده", "آسمان", "دوست", "مدرسه", "آینه", "چراغ", "ماشین",
      "گل", "باد", "برف", "رنگ", "موسیقی", "نامه", "کلید", "پنجره",
      "رودخانه", "جنگل", "ساعت", "میز", "صندلی", "لبخند"
    ],
    medium: [
      "باران آرام می‌بارد", "ستاره‌ها در شب می‌درخشند", "او کتاب جدیدی خرید",
      "ما فردا به پارک می‌رویم", "گربه روی دیوار نشسته است", "باد سرد می‌وزد",
      "خورشید پشت کوه‌ها غروب کرد", "دوستم نامه‌ای برایم فرستاد",
      "شهر در شب زیبا به نظر می‌رسد", "او با سرعت زیاد تایپ می‌کند",
      "این بازی بسیار سریع و جذاب است", "امروز هوا خیلی خوب است",
      "ما باید زودتر تمرین کنیم", "او همیشه با دقت کار می‌کند"
    ],
    hard: [
      "اگر امروز باران نبارد، فردا به کوهنوردی می‌رویم.",
      "او گفت که این پروژه تا پایان هفته تمام خواهد شد!",
      "با وجود سختی‌های زیاد، آن‌ها هرگز تسلیم نشدند.",
      "برنامه‌نویسی یک مهارت است که با تمرین مستمر بهتر می‌شود.",
      "چرا باید همیشه در آخرین لحظه کارها را انجام دهیم؟",
      "موفقیت واقعی، نتیجهٔ تلاش پیوسته و صبر طولانی‌مدت است.",
      "او با وجود خستگی، تا پایان مسابقه ادامه داد و پیروز شد.",
      "دانش و تجربه، دو بال پرواز به سوی آینده‌ای روشن هستند."
    ]
  },
  en: {
    easy: [
      "apple", "river", "cloud", "music", "forest", "window", "light",
      "spider", "bridge", "castle", "garden", "silver", "winter", "rocket",
      "pencil", "guitar", "mirror", "island", "planet", "candle"
    ],
    medium: [
      "the cat sat quietly", "rain is falling softly", "she reads every night",
      "the game starts now", "he types very fast", "we will win this fight",
      "the sun is bright today", "typing fast takes practice",
      "this battle is intense", "focus and you will win"
    ],
    hard: [
      "Victory belongs to those who never stop trying, even when it hurts.",
      "If you type this sentence fast enough, your rival will take damage!",
      "Great warriors are forged through discipline, patience and practice.",
      "The fastest fingers in the arena will claim the final victory today.",
      "Every keystroke brings you closer to defeating your opponent for good."
    ]
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = WORD_LISTS;
}
