document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.skills-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 1. Знімаємо клас active з усіх кнопок
      tabBtns.forEach(b => b.classList.remove('active'));
      // 2. Знімаємо клас active з усіх блоків контенту
      tabContents.forEach(c => c.classList.remove('active'));

      // 3. Додаємо клас active на натиснуту кнопку
      btn.classList.add('active');
      
      // 4. Шукаємо відповідний блок контенту за ID і показуємо його
      const targetId = btn.dataset.target;
      document.getElementById(targetId).classList.add('active');
    });
  });
});