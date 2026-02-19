/**
 * =================================================================
 * МОДУЛЬ: МОБИЛЬНОЕ МЕНЮ
 * ФАЙЛ: js/menu.js
 * ОПИСАНИЕ: Управляет открытием/закрытием шторки и блокировкой скролла.
 * =================================================================
 */

// IIFE (Immediately Invoked Function Expression)
// Функция запускается сразу при чтении файла.
// Зачем: Чтобы переменные (burgerBtn, body) не попали в глобальную область видимости window
// и не конфликтовали с другими скриптами или библиотеками.
(function () {
  'use strict'; // Включает строгий режим (помогает отлавливать ошибки)

  // 1. ПОИСК ЭЛЕМЕНТОВ В DOM
  // Мы сохраняем ссылки на элементы в переменные, чтобы браузер не искал их каждый раз при клике.
  // Это называется "Кэширование DOM-элементов".
  const body = document.body;
  const burgerBtn = document.querySelector('.burger_btn');
  const menuContainer = document.querySelector('#menuContainer');
  
  // querySelectorAll возвращает NodeList (коллекцию элементов), похожую на массив.
  const menuLinks = document.querySelectorAll('.menu a');

  // 2. ЗАЩИТА ОТ ОШИБОК (GUARD CLAUSE)
  // Если на текущей странице нет кнопки или меню (например, техническая страница),
  // мы прерываем выполнение функции, чтобы не получить ошибку "null is not an object".
  if (!burgerBtn || !menuContainer) return;

  /**
   * Функция переключения состояния (Toggle)
   * Делает 3 вещи одновременно: меняет иконку, показывает меню, блокирует фон.
   */
  const toggleMenu = () => {
    // classList.toggle возвращает true, если класс был добавлен, и false, если убран.
    // Мы сохраняем это состояние в переменную isActive.
    const isActive = burgerBtn.classList.toggle('active');

    // Показываем/скрываем выпадающее меню
    menuContainer.classList.toggle('active');

    // Добавляем класс .lock на body (в CSS там overflow: hidden),
    // чтобы страница под меню не прокручивалась.
    body.classList.toggle('lock');

    // ВАЖНО ДЛЯ ДОСТУПНОСТИ (A11y):
    // Сообщаем скринридерам (для незрячих), открыто меню или закрыто.
    // Преобразуем булево значение (true/false) в строку.
    burgerBtn.setAttribute('aria-expanded', isActive.toString());
  };

  /**
   * Функция принудительного закрытия
   * Используется при клике на ссылку, чтобы меню уехало.
   */
  const closeMenu = () => {
    burgerBtn.classList.remove('active');
    menuContainer.classList.remove('active');
    body.classList.remove('lock');
    burgerBtn.setAttribute('aria-expanded', 'false');
  };

  // 3. ПОДПИСКА НА СОБЫТИЯ (EVENT LISTENERS)
  
  // Клик по кнопке бургера
  burgerBtn.addEventListener('click', toggleMenu);

  // Клик по ссылкам внутри меню
  // Метод forEach перебирает каждую найденную ссылку.
  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  
  // Опционально: Закрытие по клавише ESC (для удобства на клавиатуре)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuContainer.classList.contains('active')) {
      closeMenu();
    }
  });
  // СБРОС СОСТОЯНИЯ ПРИ РЕСАЙЗЕ
  // Если окно стало шире 500px, принудительно закрываем меню
  window.addEventListener('resize', () => {
    if (window.innerWidth > 500 && menuContainer.classList.contains('active')) {
      burgerBtn.classList.remove('active');
      menuContainer.classList.remove('active');
      body.classList.remove('lock');
      burgerBtn.setAttribute('aria-expanded', 'false');
    }
  });

})();