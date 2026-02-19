/**
 * =================================================================
 * МОДУЛЬ: СТАТУСА, ГОД
 * ФАЙЛ: js/status.js
 * ОПИСАНИЕ: Копирует текст статуса из секции "About" в футер.
 * =================================================================
 */

// IIFE для изоляции области видимости.
// NOTE: Обертка DOMContentLoaded не нужна, так как скрипт подключен с 'defer',
// что уже гарантирует выполнение после построения DOM.
(function () {
    'use strict';

    // [1.0] ПОИСК ЭЛЕМЕНТОВ
    const statusIntro = document.querySelector('.status_intro');
    const statusFooter = document.getElementById('footerStatus');

    // [1.1] ВЫПОЛНЕНИЕ ЛОГИКИ (GUARD CLAUSE)
    if (statusIntro && statusFooter) {
        statusFooter.textContent = statusIntro.textContent;
    }
})();

// Динамический год.
document.getElementById('currentYear').textContent = new Date().getFullYear();