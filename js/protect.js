/**
 * =================================================================
 * МОДУЛЬ: ЗАЩИТА EMAIL (ГИБРИДНАЯ ВЕРСИЯ)
 * ФАЙЛ: js/protect.js
 * -----------------------------------------------------------------
 * ГЛАВНАЯ ЗАДАЧА:
 * При клике на кнопку "Contact Me":
 * 1. Скопировать email в буфер обмена.
 * 2. СРАЗУ ПОСЛЕ этого попытаться открыть почтовый клиент по умолчанию.
 * 3. Показать пользователю сообщение "Email Copied!".
 * =================================================================
 */

(function () {
    'use strict';

    // [1] ЗАШИФРОВАННЫЕ ДАННЫЕ
    const credentials = {
        u: "bmlr",          // Твой зашифрованный логин
        d: "Z21haWwuY29t"   // Твой зашифрованный домен
    };

    // [2] ПОИСК КНОПОК
    const mailLinks = document.querySelectorAll('.js_email');
    if (mailLinks.length === 0) return;

    // [3] ДОБАВЛЕНИЕ ОБРАБОТЧИКА КЛИКА
    mailLinks.forEach(link => {
        
        const originalContent = link.innerHTML;

        link.addEventListener('click', function (e) {
            e.preventDefault();

            try {
                // Декодируем email
                const user = atob(credentials.u);
                const domain = atob(credentials.d);
                const email = `${user}@${domain}`;

                // --- ШАГ 1: КОПИРОВАНИЕ В БУФЕР ---
                // Пытаемся скопировать email.
                navigator.clipboard.writeText(email).then(() => {
                    
                    // ЭТОТ КОД ВЫПОЛНИТСЯ, ЕСЛИ КОПИРОВАНИЕ УДАЛОСЬ
                    
                    // --- ШАГ 2: ВЫЗОВ ПОЧТОВОГО КЛИЕНТА ---
                    // Сразу после успешного копирования, мы пытаемся открыть почтовый клиент.
                    // Пользователь увидит системное окно с предложением.
                    window.location.href = `mailto:${email}`;

                    // --- ШАГ 3: ВИЗУАЛЬНАЯ ОБРАТНАЯ СВЯЗЬ ---
                    // Показываем пользователю, что копирование прошло успешно.
                    // Это сообщение появится, даже если он откажется открывать почтовый клиент.
                    link.classList.add('copied'); 
                    link.textContent = 'Email Copied!'; 
                    
                    // Возвращаем кнопку в исходное состояние через 2 секунды.
                    setTimeout(() => {
                        link.classList.remove('copied');
                        link.innerHTML = originalContent;
                    }, 2000);

                }).catch(err => {
                    // ЭТОТ КОД ВЫПОЛНИТСЯ, ЕСЛИ КОПИРОВАНИЕ НЕ СРАБОТАЛО
                    // Это наш "запасной план": если буфер обмена недоступен,
                    // мы хотя бы просто попробуем открыть почтовый клиент.
                    console.error('Не удалось скопировать текст: ', err);
                    window.location.href = `mailto:${email}`;
                });

            } catch (err) {
                console.error("Системная ошибка: данные для email повреждены.");
            }
        });
    });
})();