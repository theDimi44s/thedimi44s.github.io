document.addEventListener('DOMContentLoaded', () => {

  // 1. ЛОГІКА ВИПАДАЮЧОГО ПЛЕЄРА
  const playButtons = document.querySelectorAll('.play-btn');

  playButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const trackItem = this.closest('.track-item');
      const audioEl = trackItem.querySelector('audio');

      const isExpanded = trackItem.classList.toggle('playing');

      if (isExpanded) {
        this.innerHTML = '⏸';
      } else {
        this.innerHTML = '▶';
        if (audioEl) audioEl.pause();
      }

      // Закриваємо інші розгорнуті плеєри
      document.querySelectorAll('.track-item').forEach(otherTrack => {
        if (otherTrack !== trackItem && otherTrack.classList.contains('playing')) {
          otherTrack.classList.remove('playing');
          otherTrack.querySelector('.play-btn').innerHTML = '▶';
          const otherAudio = otherTrack.querySelector('audio');
          if (otherAudio) otherAudio.pause();
        }
      });
    });
  });

  // 2. ЛОГІКА МОДАЛЬНОГО ВІКНА (ТЕКСТ І АКОРДИ)
  const textButtons = document.querySelectorAll('.text-btn');
  const modal = document.getElementById('lyricsModal');
  const closeModalBtn = document.getElementById('closeModal');
  
  const modalTitle = document.getElementById('modalTitle');
  const modalMeta = document.getElementById('modalMeta');
  const modalLyrics = document.getElementById('modalLyrics');

  textButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const trackItem = this.closest('.track-item');
      
      const title = trackItem.querySelector('h4').innerText;
      const meta = trackItem.querySelector('.track-meta').innerText;

      // Шукаємо прихований блок з текстом
      const lyricsNode = trackItem.querySelector('.lyrics-data');
      let lyricsText = lyricsNode ? lyricsNode.textContent.trim() : "Текст пісні ще не додано...";
      
      // Повертаємо пустий span (без розпірок), щоб слова не розривалися!
      let formattedLyrics = lyricsText
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\[(.*?)\]/g, '<span class="chord" data-chord="$1"></span>');

      // Заповнюємо модальне вікно
      modalTitle.innerText = title;
      modalMeta.innerText = meta;
      modalLyrics.innerHTML = formattedLyrics; 

      // Показуємо модал
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  // Закриття модального вікна
  closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });

});