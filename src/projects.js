document.addEventListener('DOMContentLoaded', () => {

  const detailsBtns = document.querySelectorAll('.details-btn');
  const modal = document.getElementById('projectModal');
  const closeBtn = document.getElementById('closeProject');
  
  const modalTitle = document.getElementById('modalProjTitle');
  const modalRole = document.getElementById('modalProjRole');
  const modalTags = document.getElementById('modalProjTags');
  const modalBody = document.getElementById('modalProjBody');

  detailsBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Знаходимо картку, на якій клікнули
      const card = this.closest('.project-card');
      
      // Витягуємо дані
      const title = card.querySelector('.project-title').innerText;
      const role = card.querySelector('.project-role').innerText;
      
      // Клонуємо теги, щоб вони теж відображалися в модалці
      const tagsHtml = card.querySelector('.project-tags').innerHTML;
      
      // Беремо прихований детальний опис
      const hiddenData = card.querySelector('.hidden-project-data');
      const bodyHtml = hiddenData ? hiddenData.innerHTML : '<p>Опис відсутній.</p>';

      // Вставляємо дані у модальне вікно
      modalTitle.innerText = title;
      modalRole.innerText = role;
      modalTags.innerHTML = tagsHtml;
      modalBody.innerHTML = bodyHtml;

      // Показуємо вікно
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  // Закриття вікна
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  });

  // Закриття по кліку на темний фон
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });

});