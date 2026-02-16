/**
 * =================================================================
 * МОДУЛЬ: ГАЛЕРЕЯ (POPUP)
 * ФУНКЦИИ: 
 * 1. Открывает картинки в модальном окне.
 * 2. Автоматически ищет русскую версию картинки (-ru), если сайт на русском.
 * 3. Если русской версии нет (ошибка 404) — незаметно подсовывает оригинал.
 * =================================================================
 */

// (function(){...})() — Это IIFE (Самовызывающаяся функция).
// Мы прячем весь код внутри неё, чтобы наши переменные (modal, body и т.д.)
// не "торчали" наружу и не сломали другие скрипты на сайте.
(function () {
    'use strict'; // Строгий режим: браузер будет ругаться на плохой код (полезно для отладки)

    // =============================================================
    // [1] ПОИСК И "ЗАПОМИНАНИЕ" ЭЛЕМЕНТОВ (КЭШИРОВАНИЕ DOM)
    // Мы ищем эти элементы один раз при загрузке страницы.
    // =============================================================
    
    const modal = document.getElementById("imageModal");      // Само черное окно на весь экран
    const modalImg = document.getElementById("modalImg");     // Тег <img> внутри этого окна
    const closeBtn = document.querySelector(".close_modal");  // Кнопка "Крестик"
    const prevBtn = document.querySelector(".modal_prev");    // Стрелка "Назад"
    const nextBtn = document.querySelector(".modal_next");    // Стрелка "Вперед"
    const body = document.body;                               // Тег <body> (чтобы запретить ему скроллиться)

    // querySelectorAll находит ВСЕ элементы по селектору и кладет их в список (как массив)
    // 1. Все картинки внутри карточек проектов (по ним будем кликать)
    const projectImages = document.querySelectorAll('.project_media_wrapper img');
    // 2. Сами карточки проектов (чтобы можно было открыть их нажатием Enter с клавиатуры)
    const focusableCards = document.querySelectorAll('.project_media_wrapper[tabindex="0"]');

    // Переменные, которые будут меняться в процессе работы скрипта
    let currentGallery = [];    // Список ссылок на картинки в текущей галерее ['1.png', '2.png']
    let currentIndex = 0;       // Номер картинки, которую мы видим сейчас (0 — первая, 1 — вторая...)
    let lastFocusedElement;     // Кнопка, на которую мы нажали ДО открытия окна (нужно для доступности)

    // "Предохранитель": Если на странице нет модального окна (например, на странице 404),
    // мы сразу останавливаем скрипт, чтобы не было ошибок в консоли.
    if (!modal || !modalImg) return;


    // =============================================================
    // [2] ФУНКЦИЯ ЛОКАЛИЗАЦИИ (Смена имени файла)
    // Задача: Превратить "photo.png" в "photo-ru.png", но только если сайт на RU.
    // =============================================================
    function localizePath(path) {
        // Смотрим в HTML: <html lang="ru">? (true или false)
        const isRu = document.documentElement.lang === 'ru';
        
        // ЕСЛИ язык не русский ИЛИ в названии файла УЖЕ есть '-ru.',
        // ТО возвращаем путь без изменений.
        if (!isRu || path.includes('-ru.')) return path;

        // ИНАЧЕ используем "Регулярное выражение" (Regex):
        // 1. /(\.[a-z0-9]+)$/i — это шаблон поиска. Он ищет расширение файла в конце строки (.png, .jpg)
        // 2. '-ru$1' — это на что заменить. $1 означает "то, что нашло выражение" (то есть само расширение).
        // Было: "image.png" -> Стало: "image-ru.png"
        return path.replace(/(\.[a-z0-9]+)$/i, '-ru$1');
    }


    // =============================================================
    // [3] ОБНОВЛЕНИЕ КАРТИНКИ НА ЭКРАНЕ (Самая важная часть!)
    // Сюда мы добавили "умную" проверку ошибок.
    // =============================================================
    function updateView() {
        // Проверяем: у нас одна картинка или много?
        const isSingle = currentGallery.length <= 1;

        // Если картинка одна — скрываем ('none') стрелки. Если много — показываем ('flex').
        if (prevBtn) prevBtn.style.display = isSingle ? 'none' : 'flex';
        if (nextBtn) nextBtn.style.display = isSingle ? 'none' : 'flex';

        // 1. Делаем старую картинку полупрозрачной (начало анимации смены)
        modalImg.style.opacity = '0.5';

        // 2. Очищаем "слушатель ошибок". 
        // Это как сбросить настройки перед новой задачей, чтобы старые ошибки не мешали.
        modalImg.onerror = null; 

        // 3. НАСТРАИВАЕМ ПЛАН "Б" (Что делать, если картинка не найдется?)
        // .onerror — это событие, которое срабатывает, если сервер сказал "404 Not Found".
        modalImg.onerror = function() {
            const badSrc = this.src; // Адрес битой картинки
            
            // Проверяем: мы пытались загрузить русскую версию? (в адресе есть "-ru.")
            if (badSrc.includes('-ru.')) {
                // Если да, значит русской версии нет. 
                
                // Важно: отключаем onerror, чтобы не попасть в бесконечный цикл, 
                // если вдруг и оригинальной картинки тоже нет.
                this.onerror = null;
                
                // Убираем "-ru" из пути и пробуем загрузить снова.
                // Браузер увидит новый src и попытается его скачать.
                this.src = badSrc.replace(/-ru(\.[a-z0-9]+)$/i, '$1');
            }
        };

        // 4. Загружаем новую картинку с небольшой задержкой (150мс) для красоты анимации.
        setTimeout(() => {
            // currentGallery[currentIndex] — это ссылка на текущую картинку из нашего списка
            modalImg.src = currentGallery[currentIndex]; 
            // Возвращаем яркость (конец анимации)
            modalImg.style.opacity = '1';
        }, 150);
    }


    // =============================================================
    // [4] НАВИГАЦИЯ (ЛИСТАЛКА)
    // =============================================================
    
    // dir: -1 (назад) или +1 (вперед)
    function changeImage(dir) {
        currentIndex += dir; // Меняем номер: 5 + 1 = 6.

        // Магия "карусели" (бесконечный круг):
        // Если номер стал меньше 0 -> идем в самый конец списка (length - 1)
        if (currentIndex < 0) currentIndex = currentGallery.length - 1;
        // Если номер больше длины списка -> идем в самое начало (0)
        if (currentIndex >= currentGallery.length) currentIndex = 0;
        
        updateView(); // Командуем: "Покажи новую картинку!"
    }


    // =============================================================
    // [5] ОТКРЫТИЕ И ЗАКРЫТИЕ ОКНА
    // =============================================================

    // Функция, которая вызывается при клике
    function openModal(sourcesString, alt) {
        // Сохраняем кнопку, которую нажал пользователь (чтобы потом вернуть туда фокус)
        lastFocusedElement = document.activeElement;

        // ШАГ 1: Превращаем длинную строку "img1.png, img2.png" в список (массив)
        let rawPaths = sourcesString ? sourcesString.split(',').map(s => s.trim()) : [];

        // ШАГ 2: Сразу пробуем превратить пути в русские
        // Функция .map берет каждый путь и пропускает через localizePath
        currentGallery = rawPaths.map(path => localizePath(path));

        currentIndex = 0; // Всегда начинаем просмотр с первой картинки

        // Визуальная магия:
        modal.style.display = "flex";               // Делаем окно видимым
        body.classList.add('lock');                 // Блокируем скролл на сайте
        modal.setAttribute('aria-hidden', 'false'); // Говорим "читалкам" для незрячих, что окно открыто
        
        modalImg.alt = alt || ""; // Ставим описание картинки
        
        updateView(); // Загружаем первую картинку

        // Через 50мс (когда окно точно откроется) переносим фокус клавиатуры внутрь окна
        setTimeout(() => {
            // Если картинок много — фокус на стрелку "вперед", если одна — на "закрыть"
            if (currentGallery.length > 1 && nextBtn) nextBtn.focus();
            else closeBtn.focus();
        }, 50);
    }

    // Закрытие
    function closeModal() {
        modal.style.display = "none";               // Прячем
        body.classList.remove('lock');              // Разрешаем скролл
        modal.setAttribute('aria-hidden', 'true');
        modalImg.removeAttribute('src');            // Убираем картинку из памяти
        modalImg.onerror = null;                    // Убираем слушатели ошибок
        
        // Возвращаем фокус туда, где он был до открытия (удобно при навигации Tab'ом)
        if (lastFocusedElement) lastFocusedElement.focus();
    }


    // =============================================================
    // [6] "ЛОВУШКА ФОКУСА" (Для доступности/A11y)
    // Чтобы нажимая Tab, пользователь не "улетел" курсором за пределы открытого окна.
    // =============================================================
    function handleTab(e) {
        // Находим все кнопки, которые сейчас видны в модальном окне
        const buttons = [prevBtn, nextBtn, closeBtn].filter(btn => {
            // Проверяем: кнопка существует и не скрыта (display: none)?
            return btn && getComputedStyle(btn).display !== 'none';
        });

        // Если кнопок нет (странно, но бывает) — выходим
        if (buttons.length === 0) { e.preventDefault(); return; }

        const first = buttons[0];                   // Первая кнопка в цикле
        const last = buttons[buttons.length - 1];   // Последняя кнопка

        if (e.shiftKey) { 
            // Если нажали Shift + Tab (назад) и мы на первой кнопке...
            if (document.activeElement === first) {
                e.preventDefault(); 
                last.focus(); // ...прыгаем в конец
            }
        } else {
            // Если нажали Tab (вперед) и мы на последней кнопке...
            if (document.activeElement === last) {
                e.preventDefault(); 
                first.focus(); // ...прыгаем в начало
            }
        }
    }


    // =============================================================
    // [7] ПОДПИСКА НА СОБЫТИЯ (Кто и что нажимает)
    // =============================================================

    // ГЛОБАЛЬНЫЙ СЛУШАТЕЛЬ КЛАВИАТУРЫ (Нажат любой клавише на странице)
    document.addEventListener('keydown', (e) => {
        if (modal.style.display !== "flex") return; // Если окно закрыто — игнорируем

        if (e.key === "Tab") handleTab(e);          // Tab — ловим фокус
        else if (e.key === "Escape") closeModal();  // Escape — закрываем
        else if (currentGallery.length > 1) {       // Стрелки — только если картинок много
            if (e.key === "ArrowLeft") changeImage(-1);
            if (e.key === "ArrowRight") changeImage(1);
        }
    });

    // Хелпер: читает атрибуты у картинки и запускает открытие
    const tryOpen = (img) => {
        // Ищем в таком порядке: Галерея? -> Полная версия? -> Сам src картинки
        let src = img.getAttribute('data-gallery') || img.getAttribute('data-full') || img.src;
        openModal(src, img.alt);
    };

    // Вешаем "клик" на каждую картинку в портфолио
    projectImages.forEach(img => {
        img.addEventListener('click', (e) => {
            // Проверка: не открываем, если родительский блок имеет класс 'development' (проект в разработке)
            // .closest ищет ближайшего родителя с таким классом вверх по дереву HTML
            if (!img.closest('.development')) tryOpen(img);
        });
    });

    // Вешаем "Enter" на карточки (для навигации клавиатурой)
    focusableCards.forEach(card => {
        card.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !card.closest('.development')) {
                e.preventDefault(); // Запрещаем стандартное действие пробела (прокрутку страницы)
                const img = card.querySelector('img'); // Находим картинку внутри карточки
                if (img) tryOpen(img);
            }
        });
    });

    // Кнопки управления (стрелки, крестик)
    // e.stopPropagation() — "не всплывай!". Нужно, чтобы клик по стрелке не считался кликом по фону.
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); changeImage(-1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); changeImage(1); });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Закрытие по клику на темный фон
    modal.addEventListener('click', (e) => {
        // e.target — то, на что кликнули мышкой. modal — это темная подложка.
        // Если кликнули по картинке, e.target будет img, и условие не сработает.
        if (e.target === modal) closeModal();
    });

})();