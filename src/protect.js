// Блокуємо контекстне меню (правий клік)
document.addEventListener('contextmenu', event => event.preventDefault());

// Блокуємо гарячі клавіші розробника та копіювання
document.addEventListener('keydown', (e) => {
  // Блокуємо F12, Ctrl+Shift+I (DevTools), Ctrl+U (Перегляд коду), Ctrl+S (Зберегти сторінку), Ctrl+C (Копіювати)
  if (
    e.key === 'F12' || 
    (e.ctrlKey && e.shiftKey && e.key === 'I') || 
    (e.ctrlKey && e.key === 'u') ||
    (e.ctrlKey && e.key === 's') ||
    (e.ctrlKey && e.key === 'c')
  ) {
    e.preventDefault();
  }
});