function applyTheme(theme) {
  const body = document.body;
  const navBar = document.getElementById('navBar');

  // すべての背景系クラスを一旦削除
  body.classList.remove(
    'bg-white', 
    'bg-gradient-to-b', 
    'from-purple-100', 
    'via-white', 
    'to-pink-100', 
    'from-pink-200', 
    'to-purple-300'
  );
  navBar.classList.remove(
    'bg-white', 
    'bg-gradient-to-b', 
    'from-purple-100', 
    'via-white', 
    'to-pink-100', 
    'from-pink-200', 
    'to-purple-300'
  );

  // テーマごとの背景クラスを付与
  if (theme === 'default') {
    // デフォルトテーマ：真っ白
    body.classList.add('bg-white');
    navBar.classList.add('bg-white');
  } else if (theme === 'pinkpurple') {
    // ピンク＆パープルテーマ：グラデーション
    body.classList.add('bg-gradient-to-b', 'from-pink-200', 'to-purple-300');
    navBar.classList.add('bg-gradient-to-b', 'from-pink-200', 'to-purple-300');
  } else {
    // 想定外のテーマ名が来たら、デフォルトに戻す
    body.classList.add('bg-white');
    navBar.classList.add('bg-white');
    localStorage.setItem('selectedTheme', 'default');
  }

  // 選択されたテーマを保存
  localStorage.setItem('selectedTheme', theme);
}

// ✅ ページロード時にテーマ適用＋ロゴ押したらhomeへ
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('selectedTheme') || 'default';
  applyTheme(savedTheme);

  const logo = document.getElementById('homeLogo');
  if (logo) {
    logo.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
});
