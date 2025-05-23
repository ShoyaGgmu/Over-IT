// 日付フォーマットするやつ
function getTodayDate() {
  return new Date().toLocaleDateString('ja-JP');
}

// 今日の気分変化を見るやつ
function getTodayMoodIncrease() {
  const data = JSON.parse(localStorage.getItem('todayMoodData')) || {};
  const today = getTodayDate();
  return data[today] || 0;
}

// 今日の気分を記録するやつ
function setTodayMoodIncrease(amount) {
  const data = JSON.parse(localStorage.getItem('todayMoodData')) || {};
  const today = getTodayDate();
  data[today] = (data[today] || 0) + amount;
  localStorage.setItem('todayMoodData', JSON.stringify(data));
}

// 未練ゲージの現在値を取得
function getGaugePercent() {
  return parseInt(localStorage.getItem('gaugePercent') || '0');
}

// 未練ゲージを更新
function setGaugePercent(value) {
  const percent = Math.max(0, Math.min(100, value));
  localStorage.setItem('gaugePercent', percent);
  updateGaugeDisplay();
}

// 画面のゲージを更新
function updateGaugeDisplay() {
  const percent = getGaugePercent();
  const gaugeFill = document.querySelector('.gauge-fill');
  const gaugeText = document.querySelector('.gauge-text');
  if (gaugeFill) gaugeFill.style.width = `${percent}%`;
  if (gaugeText) gaugeText.textContent = `${percent}%`;
}

// 今日の進捗メッセージを更新
function updateTodayProgress() {
  const comment = document.querySelector('.progress-comment') || document.getElementById('progress-comment');
  const amount = getTodayMoodIncrease();
  if (comment) {
    comment.textContent = `今日は ${amount >= 0 ? '+' : ''}${amount}% 忘れられました`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateGaugeDisplay();
  updateTodayProgress();

  const moodButtons = document.querySelectorAll('.mood-btn');
  const saveBtn = document.getElementById('saveDiaryBtn');
  const clearBtn = document.getElementById('clearDiaryBtn');
  const input = document.getElementById('diaryInput');
  const list = document.getElementById('diaryList');

  let selectedMood = "";
  let moodIncrease = 0;

  let diaries = JSON.parse(localStorage.getItem('diaries') || "[]");

  // 保存してある日記を全部表示
  diaries.forEach(entry => {
    createDiaryEntry(entry);
  });

  // 気分ボタンを押したときの処理
  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      moodButtons.forEach(b => b.classList.remove('scale-125'));
      btn.classList.add('scale-125');
      selectedMood = btn.dataset.mood;

      switch (selectedMood) {
        case '😊': moodIncrease = 5; break;
        case '🙂': moodIncrease = 2; break;
        case '😭': moodIncrease = -5; break;
        case '😡': moodIncrease = -2; break;
        default: moodIncrease = 0;
      }
    });
  });

  // 保存ボタン押したとき
  saveBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!selectedMood) {
      alert("気分を選んでね！");
      return;
    }
    if (text === '') {
      alert("日記を入力してね！");
      return;
    }

    const now = new Date();
    const date = now.toLocaleDateString('ja-JP');
    const time = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false });

    const diaryData = { mood: selectedMood, text, date, time, moodIncrease };

    diaries.unshift(diaryData);
    localStorage.setItem('diaries', JSON.stringify(diaries));

    createDiaryEntry(diaryData);

    setGaugePercent(getGaugePercent() + moodIncrease);
    setTodayMoodIncrease(moodIncrease);
    updateTodayProgress();

    input.value = '';
    moodButtons.forEach(b => b.classList.remove('scale-125'));
    selectedMood = "";
    moodIncrease = 0;
  });

  // 全部消すボタン押したとき
  clearBtn.addEventListener('click', () => {
    if (confirm('すべての日記を削除しますか？')) {
      diaries.forEach(d => {
        setGaugePercent(getGaugePercent() - (d.moodIncrease || 0));
        setTodayMoodIncrease(-(d.moodIncrease || 0));
      });
      diaries = [];
      localStorage.setItem('diaries', JSON.stringify(diaries));
      list.innerHTML = '';
      updateTodayProgress();
    }
  });

  // 日記カードを作って表示する関数
  function createDiaryEntry(entry) {
    const div = document.createElement('div');
    div.className = "border border-black rounded p-4 bg-white shadow flex justify-between items-center";

    div.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-4xl">${entry.mood}</div>
        <div class="flex flex-col">
          <p class="text-sm text-gray-500">${entry.date} ${entry.time}</p>
          <p class="text-lg font-medium break-words">${entry.text}</p>
        </div>
      </div>
      <button class="delete-diary-btn text-2xl text-gray-400 hover:text-red-500 ml-4">🗑️</button>
    `;

    div.querySelector('.delete-diary-btn').addEventListener('click', () => {
      if (confirm('この日記を削除しますか？')) {
        setGaugePercent(getGaugePercent() - (entry.moodIncrease || 0));
        setTodayMoodIncrease(-(entry.moodIncrease || 0));
        updateTodayProgress();

        const index = diaries.findIndex(d => d.date === entry.date && d.time === entry.time && d.text === entry.text);
        if (index !== -1) {
          diaries.splice(index, 1);
          localStorage.setItem('diaries', JSON.stringify(diaries));
        }

        // ふわっと消える
        div.classList.add('fade-out');
        setTimeout(() => {
          div.remove();
        }, 500);
      }
    });

    list.prepend(div);
  }
});