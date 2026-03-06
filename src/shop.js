document.addEventListener('DOMContentLoaded', () => {

  // 1. ЛОГІКА ФІЛЬТРІВ (Категорії)
  const filterBtns = document.querySelectorAll('.filter-btn');
  const products = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Знімаємо active з усіх кнопок і вішаємо на натиснуту
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.dataset.filter;

      // Ховаємо або показуємо товари
      products.forEach(product => {
        if (filterValue === 'all' || product.dataset.category === filterValue) {
          product.style.display = 'flex';
        } else {
          product.style.display = 'none';
        }
      });
    });
  });

  // 2. ЛОГІКА МОДАЛЬНОГО ВІКНА (Характеристики)
  const specsBtns = document.querySelectorAll('.specs-btn');
  const modal = document.getElementById('specsModal');
  const closeBtn = document.getElementById('closeSpecs');
  
  const modalTitle = document.getElementById('modalProductTitle');
  const modalSpecs = document.getElementById('modalProductSpecs');

  specsBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.product-card');
      const title = card.querySelector('.product-title').innerText;
      
      // Шукаємо прихований блок з характеристиками
      const hiddenSpecs = card.querySelector('.hidden-specs');
      const specsHtml = hiddenSpecs ? hiddenSpecs.innerHTML : '<p>Немає детального опису.</p>';

      modalTitle.innerText = title;
      modalSpecs.innerHTML = specsHtml; // Вставляємо HTML (з тегами <b>, <p> тощо)

      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  // Закриття модального вікна
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });

  // 3. ЛОГІКА SMART CHECKOUT (Покупка через Telegram)
  // Використовую мій акаунт - 'Dimi44s' (без @)
  const TELEGRAM_USERNAME = 'Dimi44s'; 

  const buyBtns = document.querySelectorAll('.buy-btn');

  buyBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.product-card');
      const title = card.querySelector('.product-title').innerText;
      const price = card.querySelector('.product-price').innerText;

      // Формуємо текст повідомлення
      const message = `Привіт! 👋\nХочу придбати у тебе на барахолці:\n🛒 ${title}\n💰 Ціна: ${price}\nЧи ще актуально?`;

      // Генеруємо посилання на Telegram API
      const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;

      // Відкриваємо в новій вкладці
      window.open(telegramUrl, '_blank');
    });
  });

});