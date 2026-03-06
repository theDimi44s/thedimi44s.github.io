document.addEventListener('DOMContentLoaded', () => {

  // 1. ЛОГІКА ФІЛЬТРІВ СТАТЕЙ
  const filterBtns = document.querySelectorAll('.filter-btn');
  const posts = document.querySelectorAll('.blog-post');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.dataset.filter;

      posts.forEach(post => {
        if (filterValue === 'all' || post.dataset.category === filterValue) {
          post.style.display = 'block';
        } else {
          post.style.display = 'none';
        }
      });
    });
  });

  // 2. ЛОГІКА ВІДКРИТТЯ СТАТТІ
  const readBtns = document.querySelectorAll('.read-more-btn');
  const modal = document.getElementById('articleModal');
  const closeBtn = document.getElementById('closeArticle');
  
  const modalMeta = document.getElementById('modalArticleMeta');
  const modalTitle = document.getElementById('modalArticleTitle');
  const modalBody = document.getElementById('modalArticleBody');

  readBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const post = this.closest('.blog-post');
      
      const title = post.querySelector('.post-title').innerText;
      const metaHtml = post.querySelector('.post-meta').innerHTML;
      
      const hiddenContent = post.querySelector('.hidden-post-content');
      const bodyHtml = hiddenContent ? hiddenContent.innerHTML : '<p>Текст відсутній.</p>';

      modalTitle.innerText = title;
      modalMeta.innerHTML = metaHtml;
      modalBody.innerHTML = bodyHtml;

      modal.classList.add('show');
      document.body.style.overflow = 'hidden'; // Блокуємо скрол фону
    });
  });

  // Закриття
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  });

  // Закриття клавішею Escape (дуже зручно для читачів)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });

  // 3. АВТОВІДКРИТТЯ СТАТТІ ЗА ПОСИЛАННЯМ З ХЕШЕМ (#)
  // Перевіряємо, чи є в адресному рядку хеш (наприклад, #aria-ukulele)
  if (window.location.hash) {
    // Шукаємо статтю з таким ID на сторінці
    const targetPost = document.querySelector(window.location.hash);
    
    if (targetPost) {
      // Якщо статтю знайдено, знаходимо в ній кнопку "Читати повністю"
      const readBtn = targetPost.querySelector('.read-more-btn');
      if (readBtn) {
        // Програмно "клікаємо" по цій кнопці
        readBtn.click();
        
        // Опціонально: трохи прокручуємо сторінку вниз до цієї статті на фоні, 
        // щоб після закриття модалки користувач був у потрібному місці
        setTimeout(() => {
          targetPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }

});