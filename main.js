// ✅ 今日の日付を「YYYY/MM/DD」形式で取得する
function getTodayDate() {
  return new Date().toLocaleDateString('ja-JP');
}

// ✅ 今日の「忘れられた％（気分の回復）」を取得（localStorageから）
function getTodayMoodIncrease() {
  const data = JSON.parse(localStorage.getItem('todayMoodData')) || {};
  const today = getTodayDate();
  return data[today] || 0;
}

// ✅ 今日の「忘れられた％（気分の回復）」を加算して保存
function setTodayMoodIncrease(amount) {
  const data = JSON.parse(localStorage.getItem('todayMoodData')) || {};
  const today = getTodayDate();
  data[today] = (data[today] || 0) + amount;
  localStorage.setItem('todayMoodData', JSON.stringify(data));
}

// ✅ 現在の未練ゲージ（0〜100％）を取得
function getGaugePercent() {
  return parseInt(localStorage.getItem('gaugePercent') || '0');
}

// ✅ 未練ゲージを0〜100の範囲に制限して保存し、表示を更新
function setGaugePercent(value) {
  const percent = Math.max(0, Math.min(100, value));
  localStorage.setItem('gaugePercent', percent);
  updateGaugeDisplay(); // 表示を更新
}

// ✅ ゲージの見た目（横棒＋数値）を更新する
function updateGaugeDisplay() {
  const percent = getGaugePercent();
  document.querySelector('.gauge-fill').style.width = `${percent}%`;
  document.querySelector('.gauge-text').textContent = `${percent}%`;
}

// ✅ 今日の進捗コメント（例：今日は+5%忘れられました）を表示
function updateTodayProgress() {
  const comment = document.querySelector('.progress-comment');
  const amount = getTodayMoodIncrease();
  if (comment) {
    comment.textContent = `今日は ${amount >= 0 ? '+' : ''}${amount}% 忘れられました`;
  }
}

// ✅ 節目に達したときに画面中央にバナーを一時的に表示
function showBanner(message) {
  const banner = document.createElement('div');
  banner.className = 'milestone-banner fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-100 border-2 border-purple-400 text-purple-800 px-8 py-4 text-2xl font-bold rounded-xl shadow-lg z-50 animate-bounce';
  banner.textContent = message;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 3000); // 3秒後に自動で消す
}

let previousGaugePercent = 0; // 前回のゲージ％を記録しておく変数

// ✅ ゲージが10％,30％,50％,80％,100％を超えたときにバナー表示
function checkMilestones() {
  const percent = getGaugePercent();
  const messages = {
    10: '10%達成！いいスタート！',
    30: '30%達成！いい調子だね！',
    50: '50%達成！折り返し！',
    80: '80%達成！もうすぐ！',
    100: '100%達成！完全に忘れたね🎉'
  };

  document.querySelectorAll('.milestone-banner').forEach(b => b.remove());

  for (const threshold of Object.keys(messages).map(Number).sort((a, b) => a - b)) {
    if (previousGaugePercent < threshold && percent >= threshold) {
      showBanner(messages[threshold]);
      break;
    }
  }

  previousGaugePercent = percent;
}

// ✅ ゲージを増加し、関連データや表示も更新
function increaseGauge(amount) {
  setGaugePercent(getGaugePercent() + amount);
  setTodayMoodIncrease(amount);
  updateTodayProgress();
  checkMilestones();
}

// ✅ ゲージを減少し、関連データや表示も更新
function decreaseGauge(amount) {
  setGaugePercent(getGaugePercent() - amount);
  setTodayMoodIncrease(-amount);
  updateTodayProgress();
  checkMilestones();
}

// ✅ タスク一覧と完了タスクをlocalStorageに保存
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
}

// ✅ タスクを画面に表示（スター付きや締切順に並び替え）
function renderTasks() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  tasks
    .sort((a, b) => {
      if (b.star !== a.star) return b.star - a.star;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .forEach((task, index) => {
      // タスク要素の構築（見た目と機能）
      const now = new Date();
      const deadline = new Date(task.dueDate);
      const overdue = deadline < now;

      const taskDiv = document.createElement('div');
      taskDiv.className = `flex flex-col p-4 border-b ${overdue ? 'border-red-300 bg-red-100' : ''}`;

      const topRow = document.createElement('div');
      topRow.className = 'flex items-center justify-between';

      const leftDiv = document.createElement('div');
      leftDiv.className = 'flex items-center space-x-4';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'w-6 h-6';
      checkbox.checked = false;
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) completeTask(index);
      });

      const textDiv = document.createElement('div');
      textDiv.className = 'flex flex-col';

      const span = document.createElement('span');
      span.textContent = task.text;
      span.className = `text-xl ${overdue ? 'text-red-600' : ''} ${task.star ? 'font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text' : ''}`;

      const due = document.createElement('span');
      due.textContent = `期限: ${task.dueDate}`;
      due.className = `text-sm ${overdue ? 'text-red-400' : 'text-gray-500'}`;

      textDiv.appendChild(span);
      textDiv.appendChild(due);
      leftDiv.appendChild(checkbox);
      leftDiv.appendChild(textDiv);

      const rightDiv = document.createElement('div');
      rightDiv.className = 'flex items-center space-x-2';

      // ⭐ スター機能（最大3個まで）
      const star = document.createElement('span');
      star.className = 'text-2xl cursor-pointer';
      star.textContent = task.star ? '⭐' : '☆';
      star.addEventListener('click', () => {
        const starCount = tasks.filter(t => t.star).length;
        if (!task.star && starCount >= 3) {
          showBanner('スター付きタスクは最大3個までです！');
          return;
        }
        task.star = !task.star;
        saveTasks();
        renderTasks();
      });

      // ✏️ 編集ボタン
      const edit = document.createElement('span');
      edit.className = 'text-2xl cursor-pointer';
      edit.textContent = '✏️';
      edit.addEventListener('click', () => editTask(index));

      // 🗑️ 削除ボタン
      const trash = document.createElement('span');
      trash.className = 'text-2xl cursor-pointer';
      trash.textContent = '🗑️';
      trash.addEventListener('click', () => {
        if (confirm('本当にこのタスクを削除しますか？')) {
          tasks.splice(index, 1);
          decreaseGauge(2); // タスク削除でゲージ減少
          saveTasks();
          renderTasks();
        }
      });

      rightDiv.appendChild(star);
      rightDiv.appendChild(edit);
      rightDiv.appendChild(trash);

      topRow.appendChild(leftDiv);
      topRow.appendChild(rightDiv);

      // ⏳ 締切までの残り時間を表示
      const countdown = document.createElement('div');
      countdown.className = `text-xs ${overdue ? 'text-red-400' : 'text-gray-500'} mt-1`;
      updateCountdown(task, countdown);
      setInterval(() => updateCountdown(task, countdown), 1000);

      taskDiv.appendChild(topRow);
      taskDiv.appendChild(countdown);

      taskList.appendChild(taskDiv);
    });
}

// ✅ 締切までのカウントダウン表示
function updateCountdown(task, element) {
  const now = new Date();
  const deadline = new Date(task.dueDate);
  const diff = deadline - now;

  if (diff <= 0) {
    element.textContent = '締切オーバー';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  element.textContent = `締切まで ${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`;
}

// ✅ タスク内容や締切の編集
function editTask(index) {
  const newText = prompt('タスクを編集', tasks[index].text);
  const newDate = prompt('新しい締切日を設定 (例: 2025-05-01)', tasks[index].dueDate);

  if (newText !== null && newText.trim() !== '' && newDate) {
    tasks[index].text = newText.trim();
    tasks[index].dueDate = newDate;
    saveTasks();
    renderTasks();
  }
}

// ✅ 完了済みタスクを表示（チェック付き・削除可能）
function renderCompletedTasks() {
  const completedList = document.getElementById('completedTasks');
  completedList.innerHTML = '';

  completedTasks.forEach((task, index) => {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'flex items-center justify-between text-gray-400 line-through p-4 border-b';

    const leftDiv = document.createElement('div');
    leftDiv.className = 'flex items-center space-x-4';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.className = 'w-6 h-6';
    checkbox.addEventListener('change', () => {
      if (!checkbox.checked) moveBackToTasks(index); // 元に戻す
    });

    const span = document.createElement('span');
    span.textContent = task.text;
    span.className = 'text-xl';

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(span);

    const trash = document.createElement('span');
    trash.className = 'text-2xl cursor-pointer';
    trash.textContent = '🗑️';
    trash.addEventListener('click', () => {
      if (confirm('本当にこの完了タスクを削除しますか？')) {
        completedTasks.splice(index, 1);
        saveTasks();
        renderCompletedTasks();
      }
    });

    taskDiv.appendChild(leftDiv);
    taskDiv.appendChild(trash);
    completedList.appendChild(taskDiv);
  });
}

// ✅ タスク追加ボタンの動作：入力欄を生成してリストに追加
document.getElementById('addTaskBtn').addEventListener('click', () => {
  const taskList = document.getElementById('taskList');

  const inputDiv = document.createElement('div');
  inputDiv.className = 'flex flex-col space-y-2 mt-4';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'タスク内容';
  input.className = 'border p-2 rounded w-full text-lg';

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'border p-2 rounded w-full text-lg';

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = '追加';
  confirmBtn.className = 'px-4 py-2 bg-black text-white rounded text-lg';

  confirmBtn.addEventListener('click', () => {
    if (input.value.trim() !== '' && dateInput.value !== '') {
      tasks.push({ text: input.value.trim(), dueDate: dateInput.value, star: false });
      saveTasks();
      renderTasks();
      inputDiv.remove();
    }
  });

  inputDiv.appendChild(input);
  inputDiv.appendChild(dateInput);
  inputDiv.appendChild(confirmBtn);

  taskList.prepend(inputDiv);
  input.focus();
});

// ✅ タスクを完了にする（条件に応じてゲージ加算）
function completeTask(index) {
  const task = tasks.splice(index, 1)[0];
  completedTasks.push(task);

  const now = new Date();
  const deadline = new Date(task.dueDate);
  const overdue = deadline < now;

  if (overdue) {
    increaseGauge(1); // 遅刻タスク
  } else if (task.star) {
    increaseGauge(3); // スター付き
  } else {
    increaseGauge(2); // 通常
  }

  saveTasks();
  renderTasks();
  renderCompletedTasks();
}

// ✅ タスクを完了済みから未完了に戻す（ゲージを減らす）
function moveBackToTasks(index) {
  const task = completedTasks.splice(index, 1)[0];
  tasks.push(task);
  saveTasks();
  renderTasks();
  renderCompletedTasks();
  decreaseGauge(5);
}

// ✅ 完了済みタスクを全削除（ゲージも減らす）
document.getElementById('clearCompletedBtn').addEventListener('click', () => {
  if (confirm('完了済みタスクをすべて空にしますか？')) {
    completedTasks.forEach(() => decreaseGauge(5));
    completedTasks = [];
    saveTasks();
    renderCompletedTasks();
  }
});

// ✅ 初期表示時の処理（保存データの読み込み・表示）
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  renderCompletedTasks();
  updateGaugeDisplay();
  updateTodayProgress();
  checkMilestones();
});
