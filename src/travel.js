document.addEventListener('DOMContentLoaded', () => {
  const yearFilter = document.getElementById('year-filter');
  const seasonFilter = document.getElementById('season-filter');
  const categoryBtns = document.querySelectorAll('.category-btn');
  const timelineItems = document.querySelectorAll('.timeline-item');
  const noResults = document.getElementById('no-results');

  // ІНІЦІАЛІЗАЦІЯ ДЛЯ ПЕРЕМІШУВАННЯ
  // Додаємо кожному відео унікальне випадкове число при завантаженні сторінки.
  // Це потрібно для того, щоб "З вікна / ASMR" та "Карпати" стабільно перемішувалися.
  timelineItems.forEach(item => {
    item.dataset.random = Math.random();
  });

 // 1. ЛОГІКА ФІЛЬТРАЦІЇ ТА СОРТУВАННЯ
  function filterVideos() {
    const selectedYear = yearFilter.value;
    const selectedSeason = seasonFilter.value;
    const activeCategoryBtn = document.querySelector('.category-btn.active');
    const activeCategory = activeCategoryBtn ? activeCategoryBtn.dataset.category : 'all';
    
    // Контейнер, куди будемо переставляти відфільтровані елементи
    const container = document.querySelector('.timeline'); 
    let visibleCount = 0;

    const itemsArray = Array.from(timelineItems);
    const seasonWeight = { 'winter': 1, 'spring': 2, 'summer': 3, 'autumn': 4 };

    // СОРТУВАННЯ ВІДЕО
    itemsArray.sort((a, b) => {
      
      // ПРАВИЛО 1: Для "Влог" та "Двіж" - шукаємо номери випусків
      if (activeCategory === 'dvizh' || activeCategory === 'vlog') {
        // Універсальний пошук для Влог та Двіж (навіть якщо російською "Движ")
        const regex = /(?:Двіж|Движ|Влог)\s*(?:Nº|№|#)\s*(\d+)/i;
        let matchA = a.querySelector('h3').innerText.match(regex);
        let matchB = b.querySelector('h3').innerText.match(regex);
        
        let numA = matchA ? parseInt(matchA[1]) : 9999;
        let numB = matchB ? parseInt(matchB[1]) : 9999;
        
        // Якщо хоча б одне відео має номер (не 9999), сортуємо за номером від меншого до більшого
        if (numA !== numB) return numA - numB;
      }
      
      // ПРАВИЛО 2: Для "З вікна / ASMR" та "Карпати" - замішуємо випадковим чином
      if (activeCategory === 'asmr' || activeCategory === 'karpaty') {
         return parseFloat(a.dataset.random) - parseFloat(b.dataset.random);
      }
      
      // ПРАВИЛО 3: Для "Усі відео", "До окупації", "Залізничні розповіді"
      // АБО для тих відео з Влогів і Двіжу, які не мають номерів (вони обидва мають 9999)
      // Сортуємо від новіших (2022) до старіших (2011)
      let yearA = parseInt(a.dataset.year) || 0;
      let yearB = parseInt(b.dataset.year) || 0;
      if (yearA !== yearB) return yearB - yearA; // Сортування років за спаданням
      
      let seasonA = seasonWeight[a.dataset.season] || 0;
      let seasonB = seasonWeight[b.dataset.season] || 0;
      return seasonB - seasonA; // Сортування сезонів за спаданням (Осінь -> Зима)
    });

    // ВІДОБРАЖЕННЯ
    itemsArray.forEach(item => {
      const itemYear = item.dataset.year;
      const itemSeason = item.dataset.season;
      const itemCategory = item.dataset.category || '';

      const matchYear = selectedYear === 'all' || itemYear === selectedYear;
      const matchSeason = selectedSeason === 'all' || itemSeason === selectedSeason;
      const matchCategory = activeCategory === 'all' || itemCategory.split(' ').includes(activeCategory);

      if (matchYear && matchSeason && matchCategory) {
        item.style.display = 'flex';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
      
      // Переставляємо HTML-блок на його законне нове місце у контейнері
      if(container) container.appendChild(item); 
    });

    if(noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      if(container && container.contains(noResults)) {
         container.appendChild(noResults); // Повідомлення про відсутність переносимо в самий низ
      }
    }
  }

  yearFilter.addEventListener('change', filterVideos);
  seasonFilter.addEventListener('change', filterVideos);

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      filterVideos();
    });
  });

  // 2. ЛОГІКА ЛАЙКІВ
  document.querySelectorAll('.like-btn').forEach(btn => {
    const videoId = btn.dataset.id;
    const countSpan = btn.querySelector('.like-count');
    
    let likes = parseInt(localStorage.getItem('likes_' + videoId)) || 0;
    let isLiked = localStorage.getItem('isLiked_' + videoId) === 'true';
    
    countSpan.textContent = likes;
    if (isLiked) btn.classList.add('liked');

    btn.addEventListener('click', () => {
      if (!isLiked) { likes++; isLiked = true; btn.classList.add('liked'); } 
      else { likes--; isLiked = false; btn.classList.remove('liked'); }
      countSpan.textContent = likes;
      localStorage.setItem('likes_' + videoId, likes);
      localStorage.setItem('isLiked_' + videoId, isLiked);
    });
  });

  // 3. ЛОГІКА "ПОДІЛИТИСЯ"
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const shareData = { title: btn.dataset.title, text: 'Подивіться це відео з архіву Dimi44s!', url: btn.dataset.url };
      try {
        if (navigator.share) await navigator.share(shareData);
        else { navigator.clipboard.writeText(shareData.url); alert('Посилання скопійовано!'); }
      } catch (err) { console.log('Скасовано поширення.'); }
    });
  });

  // 4. МОБІЛЬНЕ МЕНЮ ТА ПРОЗОРІСТЬ ПРИ СКРОЛІ
  const mobileFilterBtn = document.getElementById('mobile-filter-btn');
  const filtersPanel = document.getElementById('filters-panel');

  if (mobileFilterBtn && filtersPanel) {
    mobileFilterBtn.addEventListener('click', () => {
      filtersPanel.classList.toggle('show-panel');
    });

    // Ховаємо меню при виборі категорії на мобільному
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.innerWidth <= 900) filtersPanel.classList.remove('show-panel');
      });
    });

    // Зміна прозорості кнопки при гортанні вниз
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100 && window.innerWidth <= 900) {
        mobileFilterBtn.classList.add('scrolled');
      } else {
        mobileFilterBtn.classList.remove('scrolled');
      }
    });
  }

  // 5. КНОПКА "НАВЕРХ"
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) scrollTopBtn.classList.add('show');
    else scrollTopBtn.classList.remove('show');
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Початкова фільтрація при завантаженні сторінки
  filterVideos();

  // 6. ЛІНИВЕ ЗАВАНТАЖЕННЯ YOUTUBE (Заглушки)
  function initYouTubeFacades() {
    document.querySelectorAll('.youtube-facade').forEach(facade => {
      facade.addEventListener('click', function() {
        const videoId = this.dataset.id;
        // Створюємо справжній iframe тільки після кліку
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1`);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'true');
        
        // Стилі для iframe, щоб він заповнив контейнер
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';

        // Замінюємо картинку на відео
        this.innerHTML = '';
        this.appendChild(iframe);
      }, { once: true }); // once: true означає, що клік спрацює лише один раз
    });
  }

  initYouTubeFacades();

});