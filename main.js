// 今日の日付をよみやすい形式で取得
function getTodayDate() {
  return new Date().toLocaleDateString('ja-JP');
}

// その日の気持ちの変化を記録から確認
function getTodayMoodIncrease() {
  const data = JSON.parse(localStorage.getItem('todayMoodData')) || {};
  const today = getTodayDate();
  return data[today] || 0;
}

// 気持ちの変化を記録に残す
function setTodayMoodIncrease(amount) {
  const data = JSON.parse(localStorage.getItem('todayMoodData')) || {};
  const today = getTodayDate();
  data[today] = (data[today] || 0) + amount;
  localStorage.setItem('todayMoodData', JSON.stringify(data));
}

// 未練メーターの現在値を確認
function getGaugePercent() {
  return parseInt(localStorage.getItem('gaugePercent') || '0');
}

// 未練メーターを更新（0〜100の間で）
function setGaugePercent(value) {
  const percent = Math.max(-100, Math.min(100, value));
  localStorage.setItem('gaugePercent', percent);
  updateGaugeDisplay();
}

// 未練メーターの表示を更新
function updateGaugeDisplay() {
  const percent = getGaugePercent();
  document.querySelector('.gauge-fill').style.width = `${percent}%`;
  document.querySelector('.gauge-text').textContent = `${percent}%`;
}

// 今日の気持ちの変化を表示
function updateTodayProgress() {
  const comment = document.querySelector('.progress-comment');
  const amount = getTodayMoodIncrease();
  if (comment) {
    comment.textContent = `今日は ${amount >= 0 ? '+' : ''}${amount}% 気持ちが変化しました`;
  }
}

// がんばり度をお知らせ
function showBanner(message) {
  const banner = document.createElement('div');
  banner.className = 'milestone-banner fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-100 border-2 border-purple-400 text-purple-800 px-8 py-4 text-2xl font-bold rounded-xl shadow-lg z-50 animate-bounce';
  banner.textContent = message;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 3000);
}

let lastCheckedPercent = 0;

// がんばり度の節目をお祝い
function checkMilestones() {
  const percent = getGaugePercent();
  const messages = {
    10: 'よし！10%達成！その調子！',
    30: 'すごい！30%まできたよ！',
    50: '半分達成！折り返し地点だね！',
    80: 'もうちょっと！80%まできたよ！',
    100: 'おめでとう！100%達成だよ！🎉'
  };

  document.querySelectorAll('.milestone-banner').forEach(b => b.remove());

  for (const threshold of Object.keys(messages).map(Number).sort((a, b) => a - b)) {
    if (lastCheckedPercent < threshold && percent >= threshold) {
      showBanner(messages[threshold]);
      break;
    }
  }

  lastCheckedPercent = percent;
}

// 気持ちの変化をプラスに
function increaseGauge(amount) {
  setGaugePercent(getGaugePercent() + amount);
  setTodayMoodIncrease(amount);
  updateTodayProgress();
  checkMilestones();
}

// 気持ちの変化をマイナスに
function decreaseGauge(amount) {
  setGaugePercent(getGaugePercent() - amount);
  setTodayMoodIncrease(-amount);
  updateTodayProgress();
  checkMilestones();
}

// やることリストを保存
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
}

// やることリストを表示
function renderTasks() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  tasks
    .sort((a, b) => {
      if (b.star !== a.star) return b.star - a.star;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .forEach((task, index) => {
      const now = new Date();
      const deadline = new Date(task.dueDate);
      const isLate = deadline < now;

      const taskDiv = document.createElement('div');
      taskDiv.className = `flex flex-col p-4 border-b ${isLate ? 'border-red-300 bg-red-100' : ''}`;

      const topRow = document.createElement('div');
      topRow.className = 'flex items-center justify-between';

      const leftDiv = document.createElement('div');
      leftDiv.className = 'flex items-center space-x-4';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'w-6 h-6';
      checkbox.checked = false;
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) markTaskComplete(index);
      });

      const textDiv = document.createElement('div');
      textDiv.className = 'flex flex-col';

      const span = document.createElement('span');
      span.textContent = task.text;
      span.className = `text-xl ${isLate ? 'text-red-600' : ''} ${task.star ? 'font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text' : ''}`;

      const due = document.createElement('span');
      due.textContent = `期限: ${new Date(task.dueDate).toLocaleString('ja-JP')}`;
      due.className = `text-sm ${isLate ? 'text-red-400' : 'text-gray-500'}`;

      textDiv.appendChild(span);
      textDiv.appendChild(due);
      leftDiv.appendChild(checkbox);
      leftDiv.appendChild(textDiv);

      const rightDiv = document.createElement('div');
      rightDiv.className = 'flex items-center space-x-2';

      //重要タスクの設定数設定
      const star = document.createElement('span');
      star.className = 'text-2xl cursor-pointer';
      star.textContent = task.star ? '⭐' : '☆';
      star.addEventListener('click', () => {
        const starCount = tasks.filter(t => t.star).length;
        if (!task.star && starCount >= 3) {
          showBanner('重要なタスクは3つまでにしようね！');
          return;
        }
        task.star = !task.star;
        saveTasks();
        renderTasks();
      });

      //タスク管理アイコン
      //タスク消去確認
      const edit = document.createElement('span');
      edit.className = 'text-2x1 cursor-pointer';
      edit.textContent = '✏️';
      edit.addEventListener('click', () => editTask(index));

      const trash = document.createElement('span');
      trash.className = 'text-2xl cursor-pointer';
      trash.textContent = '🗑️';
      trash.addEventListener('click', () => {
        if (confirm('このタスクを消しちゃう？')) {
          tasks.splice(index, 1);
          decreaseGauge(2);
          saveTasks();
          renderTasks();
        }
      });

      rightDiv.appendChild(star);
      rightDiv.appendChild(edit);
      rightDiv.appendChild(trash);

      topRow.appendChild(leftDiv);
      topRow.appendChild(rightDiv);

      const countdown = document.createElement('div');
      countdown.className = `text-xs ${isLate ? 'text-red-400' : 'text-gray-500'} mt-1`;
      updateCountdown(task, countdown);
      setInterval(() => updateCountdown(task, countdown), 1000);

      taskDiv.appendChild(topRow);
      taskDiv.appendChild(countdown);

      taskList.appendChild(taskDiv);
    });
}

// 残り時間を表示
function updateCountdown(task, element) {
  const now = new Date();
  const deadline = new Date(task.dueDate);
  const diff = deadline - now;

  if (diff <= 0) {
    const passed = now - deadline;
    const days = Math.floor(passed / (1000 * 60 * 60 * 24));
    const hours = Math.floor((passed / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((passed / (1000 * 60)) % 60);
    const seconds = Math.floor((passed / 1000) % 60);

    //期間超過の場合
    element.textContent = `期限を過ぎちゃった...（${days}日 ${hours}時間 ${minutes}分 ${seconds}秒）`;
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  element.textContent = `あと ${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`;
}

// タスクを編集
function editTask(index) {
  const newText = prompt('タスクを変更する？', tasks[index].text);
  const newDate = prompt('期限はいつにする？ (例: 2025-05-14T18:00)', tasks[index].dueDate);

  if (newText !== null && newText.trim() !== '' && newDate) {
    tasks[index].text = newText.trim();
    tasks[index].dueDate = newDate;
    saveTasks();
    renderTasks();
  }
}

// 終わったタスクを表示
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
      if (!checkbox.checked) moveToTodoList(index);
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
      if (confirm('このタスクを完全に消しちゃう？')) {
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

// 新しいタスクを追加
document.getElementById('addTaskBtn').addEventListener('click', () => {
  const taskList = document.getElementById('taskList');

  const inputDiv = document.createElement('div');
  inputDiv.className = 'flex flex-col space-y-2 mt-4';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'やることを入力してね';
  input.className = 'border p-2 rounded w-full text-lg';

  const dateInput = document.createElement('input');
  dateInput.type = 'datetime-local'; 
  dateInput.className = 'border p-2 rounded w-full text-lg';

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = '追加する';
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

// タスクを完了にする
function markTaskComplete(index) {
  const task = tasks.splice(index, 1)[0];
  let points = 0;

  const now = new Date();
  const deadline = new Date(task.dueDate);
  const isLate = deadline < now;

  if (isLate) {
    points = 1;  // 遅れちゃったけどやり遂げた
  } else if (task.star) {
    points = 3;  // 重要なタスクを期限内に完了
  } else {
    points = 2;  // 普通のタスクを期限内に完了
  }

  task.points = points;
  completedTasks.push(task);
  increaseGauge(points);

  saveTasks();
  renderTasks();
  renderCompletedTasks();
}

// 完了したタスクをもう一度やることにする
function moveToTodoList(index) {
  const task = completedTasks.splice(index, 1)[0];
  const points = task.points || 0;
  tasks.push(task);
  decreaseGauge(points);
  saveTasks();
  renderTasks();
  renderCompletedTasks();
}

// 終わったタスクを全部消す
document.getElementById('clearCompletedBtn').addEventListener('click', () => {
  if (confirm('終わったタスクを全部消しちゃう？')) {
    completedTasks.forEach(task => {
      const points = task.points || 0;
      decreaseGauge(points);
    });
    completedTasks = [];
    saveTasks();
    renderCompletedTasks();
  }
});

// 最初の表示
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  renderCompletedTasks();
  updateGaugeDisplay();
  updateTodayProgress();
  checkMilestones();
});
//finisshssshhshshshshhshshshshhhhhhhhhhhhhhhhh