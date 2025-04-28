function applyTheme(theme) {
  const body = document.body;
  const navBar = document.getElementById('navBar');

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

  if (theme === 'default') {
    body.classList.add('bg-white');
    navBar.classList.add('bg-white');
  } else if (theme === 'pinkpurple') {
    body.classList.add('bg-gradient-to-b', 'from-pink-200', 'to-purple-300');
    navBar.classList.add('bg-gradient-to-b', 'from-pink-200', 'to-purple-300');
  } else {
    // 変な値が入ってたらデフォルトに強制
    body.classList.add('bg-white');
    navBar.classList.add('bg-white');
    localStorage.setItem('selectedTheme', 'default');
  }
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
