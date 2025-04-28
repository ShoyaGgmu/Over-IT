// ✅ 今日の日付を取得
function getTodayDate() {
  return new Date().toLocaleDateString('ja-JP');
}

// ✅ 今日の進捗%を取得
function getTodayMoodIncrease() {
  const data = JSON.parse(localStorage.getItem('todayMoodData')) || {};
  const today = getTodayDate();
  return data[today] || 0;
}

// ✅ 今日の進捗%を保存
function setTodayMoodIncrease(amount) {
  const data = JSON.parse(localStorage.getItem('todayMoodData')) || {};
  const today = getTodayDate();
  data[today] = (data[today] || 0) + amount;
  localStorage.setItem('todayMoodData', JSON.stringify(data));
}

// ✅ 保存されてる未練ゲージ％を読み込む
function getGaugePercent() {
  return parseInt(localStorage.getItem('gaugePercent') || '0');
}

// ✅ ゲージを保存する
function setGaugePercent(value) {
  const percent = Math.max(0, Math.min(100, value));
  localStorage.setItem('gaugePercent', percent);
  updateGaugeDisplay();
}

// ✅ ゲージ表示を更新
function updateGaugeDisplay() {
  const percent = getGaugePercent();
  document.querySelector('.gauge-fill').style.width = `${percent}%`;
  document.querySelector('.gauge-text').textContent = `${percent}%`;
}

// ✅ 今日の進捗コメント更新
function updateTodayProgress() {
  const comment = document.querySelector('.progress-comment');
  const amount = getTodayMoodIncrease();
  if (comment) {
    comment.textContent = `今日は ${amount >= 0 ? '+' : ''}${amount}% 忘れられました`;
  }
}

// ✅ 達成バナー管理
function checkMilestones() {
  const percent = getGaugePercent();
  const milestoneMessages = {
    10: '10%達成！いいスタート！',
    30: '30%達成！いい調子だね！',
    50: '50%達成！折り返し！',
    80: '80%達成！もうすぐ！',
    100: '100%達成！完全に忘れたね🎉'
  };

  document.querySelectorAll('.milestone-banner').forEach(b => b.remove());

  if (milestoneMessages[percent]) {
    showBanner(milestoneMessages[percent]);
  }
}

// ✅ バナーを表示
function showBanner(message) {
  const banner = document.createElement('div');
  banner.className = 'milestone-banner fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-100 border-2 border-purple-400 text-purple-800 px-8 py-4 text-2xl font-bold rounded-xl shadow-lg z-50 animate-bounce';
  banner.textContent = message;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 3000);
}

// ✅ ゲージ加算
function increaseGauge(amount) {
  const current = getGaugePercent();
  setGaugePercent(current + amount);
  setTodayMoodIncrease(amount);
  updateTodayProgress();
  checkMilestones();
}

// ✅ ゲージ減算
function decreaseGauge(amount) {
  const current = getGaugePercent();
  setGaugePercent(current - amount);
  setTodayMoodIncrease(-amount);
  updateTodayProgress();
  checkMilestones();
}

// ✅ タスク保存
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
}

// ✅ タスク表示
function renderTasks() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  tasks
    .sort((a, b) => {
      if (b.star !== a.star) return b.star - a.star;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .forEach((task, index) => {
      const taskDiv = document.createElement('div');
      taskDiv.className = 'flex items-center justify-between p-4 border-b';

      const leftDiv = document.createElement('div');
      leftDiv.className = 'flex items-center space-x-4';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'w-6 h-6';
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          completeTask(index);
        }
      });

      const textDiv = document.createElement('div');
      textDiv.className = 'flex flex-col';

      const span = document.createElement('span');
      span.textContent = task.text;
      span.className = `text-xl ${task.star ? 'font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text' : ''}`;

      const today = new Date();
      const taskDue = new Date(task.dueDate);
      if (taskDue < today) {
        span.classList.add('text-red-500', 'font-bold');
      }

      const due = document.createElement('span');
      due.textContent = `期限: ${task.dueDate}`;
      due.className = 'text-sm text-gray-500';

      textDiv.appendChild(span);
      textDiv.appendChild(due);

      leftDiv.appendChild(checkbox);
      leftDiv.appendChild(textDiv);

      const rightDiv = document.createElement('div');
      rightDiv.className = 'flex items-center space-x-2';

      const star = document.createElement('span');
      star.className = 'text-2xl cursor-pointer';
      star.textContent = task.star ? '⭐' : '☆';
      star.addEventListener('click', () => {
        task.star = !task.star;
        saveTasks();
        renderTasks();
      });

      const trash = document.createElement('span');
      trash.className = 'text-2xl cursor-pointer';
      trash.textContent = '🗑️';
      trash.addEventListener('click', () => {
        if (confirm('本当にこのタスクを削除しますか？')) {
          tasks.splice(index, 1);
          decreaseGauge(5);
          saveTasks();
          renderTasks();
        }
      });

      rightDiv.appendChild(star);
      rightDiv.appendChild(trash);

      taskDiv.appendChild(leftDiv);
      taskDiv.appendChild(rightDiv);

      taskList.appendChild(taskDiv);
    });
}

// ✅ 完了タスク表示
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
      if (!checkbox.checked) {
        moveBackToTasks(index);
      }
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

// ✅ タスク追加
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

// ✅ タスク完了
function completeTask(index) {
  const task = tasks.splice(index, 1)[0];
  completedTasks.push(task);
  saveTasks();
  renderTasks();
  renderCompletedTasks();
  increaseGauge(5); // 完了で+5%
}

// ✅ 完了から復活
function moveBackToTasks(index) {
  const task = completedTasks.splice(index, 1)[0];
  tasks.push(task);
  saveTasks();
  renderTasks();
  renderCompletedTasks();
  decreaseGauge(5); // 復活で-5%
}

// ✅ 完了タスク全削除
document.getElementById('clearCompletedBtn').addEventListener('click', () => {
  if (confirm('完了済みタスクをすべて空にしますか？')) {
    completedTasks.forEach(() => decreaseGauge(5));
    completedTasks = [];
    saveTasks();
    renderCompletedTasks();
  }
});

// ✅ ページロード時
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  renderCompletedTasks();
  updateGaugeDisplay();
  updateTodayProgress();
  checkMilestones();
});
