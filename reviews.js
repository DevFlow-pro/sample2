// ============ ОТЗЫВЫ ============
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby9PAv4RcnMzAzsNpwK1nci7DTotYK_sP9UZOFzvXYecHnsDsn057cM4T-J8I-PoGkE/exec";

/*
  ВАЖНО:
  Из списка убраны все короткие и неоднозначные корни, которые давали ложные срабатывания
  на обычных словах: хлебушек, хлеб, сукно, бляха, мандарин, жидкость, хачапури, Нигерия,
  чмок, класс, бастард, фаг, ретардация, петух (птица), шешен (оратор), міс (медь),
  құрт (червь), арыз (заявление), бале (на балу), итог, амбар, Катынь, мұрын (нос),
  шошқа (свинья), есек (осёл), пасынок, надан, тезек, маймақ, қаракөс, текпе и т.п.

  Логика проверки:
  - для слов длиной <= 3 символов — только ТОЧНОЕ совпадение;
  - для слов длиной >= 4 символов — вхождение подстроки.

  Нормализация (защита от подмены букв):
  1) латиница → кириллица по визуальному сходству;
  2) цифры → буквы (0→о, 1→и, 3→з, 4→ч, 5→с, 6→б, 7→т, 8→в, 9→я);
  3) знаки валют и спецсимволы → буквы:
     $ → с, ¥ → у, ₸ → у, Ұ → у, Y → у, € → е, £ → е, @ → а,
     # → ш, ! → и, | → и, I → и, l → и;
  4) все остальные не-буквенные символы внутри токена удаляются
     (., - _ + = ~ ^ % & ? / \ ( ) [ ] { } < > " ' ; : , * и т.п.);
  5) дополнительно проверяется «склеенный» текст без пробелов и разделителей —
     на случай «х у й», «х-у-й», «х.у.й»; но только для длинных корней (>=4),
     чтобы не было ложных срабатываний.
*/
function normalizeText(text) {
    if (!text) return '';
    return String(text).toLowerCase()
        // латиница → кириллица
        .replace(/a/g, 'а').replace(/b/g, 'в').replace(/c/g, 'с').replace(/d/g, 'д')
        .replace(/e/g, 'е').replace(/f/g, 'ф').replace(/g/g, 'г').replace(/h/g, 'н')
        .replace(/i/g, 'и').replace(/j/g, 'й').replace(/k/g, 'к').replace(/l/g, 'л')
        .replace(/m/g, 'м').replace(/n/g, 'п').replace(/o/g, 'о').replace(/p/g, 'р')
        .replace(/q/g, 'к').replace(/r/g, 'р').replace(/s/g, 'с').replace(/t/g, 'т')
        .replace(/u/g, 'у').replace(/v/g, 'в').replace(/w/g, 'в').replace(/x/g, 'х')
        .replace(/y/g, 'у').replace(/z/g, 'з')
        // знаки валют и похожие символы → буквы
        .replace(/\$/g, 'с')
        .replace(/[¥₸Ұ]/g, 'у')
        .replace(/[€£]/g, 'е')
        .replace(/@/g, 'а')
        .replace(/#/g, 'ш')
        .replace(/[!|]/g, 'и')
        // цифры → буквы
        .replace(/0/g, 'о').replace(/1/g, 'и').replace(/3/g, 'з').replace(/4/g, 'ч')
        .replace(/5/g, 'с').replace(/6/g, 'б').replace(/7/g, 'т').replace(/8/g, 'в').replace(/9/g, 'я')
        // ё → е
        .replace(/ё/g, 'е');
}

function stripNonLetters(text) {
    if (!text) return '';
    // оставляем только буквы (кириллица, латиница уже нормализована, казахские)
    return String(text).replace(/[^a-zа-яёқғңөұүһіә]/g, '');
}

function containsBadWords(text) {
    if (!text) return false;

    const normalized = normalizeText(text);

    // 1) проверка по отдельным словам
    let words = normalized.match(/[a-zа-яёқғңөұүһіә]+/g);
    if (words) {
        for (let rawWord of words) {
            // убираем внутри слова возможные остатки спецсимволов (на случай, если попали)
            let w = stripNonLetters(rawWord);
            if (!w) continue;
            for (let bw of badWords) {
                if (bw.length <= 3) {
                    if (w === bw) return true;
                } else {
                    if (w.includes(bw)) return true;
                }
            }
        }
    }

    // 2) проверка «склеенного» текста без пробелов и разделителей
    //    (для случаев «х у й», «х-у-й», «х.у.й» и т.п.)
    let glued = normalized.replace(/[^a-zа-яёқғңөұүһіә]/g, '');
    if (glued) {
        for (let bw of badWords) {
            // для коротких корней склейка опасна (ложные срабатывания),
            // поэтому в glued-режиме ищем только длинные корни (>=4)
            if (bw.length >= 4 && glued.includes(bw)) return true;
        }
    }

    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    const stars = document.querySelectorAll('#starContainer span');
    const ratingInput = document.getElementById('reviewRating');

    const savedAuthor = localStorage.getItem('my_review_author');
    if (savedAuthor) {
        document.getElementById('reviewAuthor').value = savedAuthor;
    }

    function updateStars(val, container = stars) {
        container.forEach(s => {
            if (s.getAttribute('data-value') <= val) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    }
    updateStars(5, stars);

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = star.getAttribute('data-value');
            ratingInput.value = val;
            updateStars(val, stars);
        });
    });

    const modalStars = document.querySelectorAll('#modalStarContainer span');
    const editRatingInput = document.getElementById('editReviewRating');
    modalStars.forEach(star => {
        star.addEventListener('click', () => {
            const val = star.getAttribute('data-value');
            editRatingInput.value = val;
            updateStars(val, modalStars);
        });
    });

    function showReviewStatus(message, type = 'success') {
        const reviewsList = document.getElementById('reviewsList');
        if (!reviewsList) return;

        let statusBox = document.getElementById('reviewsStatusMessage');
        if (!statusBox) {
            statusBox = document.createElement('div');
            statusBox.id = 'reviewsStatusMessage';
            statusBox.className = 'reviews-status-message';
            reviewsList.insertAdjacentElement('beforebegin', statusBox);
        }

        statusBox.className = `reviews-status-message ${type}`;
        statusBox.innerHTML = `
            <span>${message}</span>
            <button type="button" class="close-status-btn" onclick="this.parentElement.remove()">×</button>
        `;
    }

    async function fetchReviews() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        try {
            const response = await fetch(`${WEB_APP_URL}?action=get`, { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            clearTimeout(timeoutId);
            console.error("Ошибка загрузки отзывов:", error);
            const list = document.getElementById('reviewsList');
            if (list) {
                list.innerHTML = '<div class="no-reviews-msg">Не удалось загрузить отзывы. Обновите страницу.</div>';
            }
            return [];
        }
    }

    async function renderReviews() {
        const list = document.getElementById('reviewsList');
        const summaryStars = document.getElementById('summaryStars');
        const summaryCount = document.getElementById('summaryCount');
        if (!list) return;

        const reviews = await fetchReviews();
        const isAdmin = localStorage.getItem('is_honey_admin') === 'true';
        const currentAuthor = localStorage.getItem('my_review_author') || '';

        list.innerHTML = '';

        if (reviews.length === 0) {
            list.innerHTML = '<div class="no-reviews-msg">Отзывов пока нет. Будьте первыми!</div>';
            if (summaryStars) summaryStars.textContent = '★★★★★';
            if (summaryCount) summaryCount.textContent = '(0 отзывов)';
            return;
        }

        let totalScore = 0;
        reviews.forEach(rev => totalScore += Number(rev.rating || 5));
        const avgRating = (totalScore / reviews.length).toFixed(1);
        const fullStarsCount = Math.round(totalScore / reviews.length);
        if (summaryStars) summaryStars.textContent = '★'.repeat(fullStarsCount) + '☆'.repeat(5 - fullStarsCount);
        if (summaryCount) summaryCount.textContent = `(${reviews.length} ${getDeclension(reviews.length)}) — ${avgRating} / 5`;

        reviews.forEach((rev) => {
            const card = document.createElement('div');
            card.className = 'review-card';

            const starsHtml = '★'.repeat(rev.rating || 5) + '☆'.repeat(5 - (rev.rating || 5));
            let actionsHtml = '';
            let isMyReview = currentAuthor && rev.author && rev.author.toLowerCase() === currentAuthor.toLowerCase();

            if (isAdmin) {
                actionsHtml += `
                    <button class="action-btn reply-admin-btn" onclick="openAdminReplyModal('${rev.rowId}')">Ответить</button>
                    <button class="action-btn delete-btn" onclick="removeReview('${rev.rowId}')">Удалить</button>
                `;
            } else if (isMyReview) {
                actionsHtml += `
                    <button class="action-btn edit-btn" onclick="openEditModal('${rev.rowId}', '${escapeAttr(rev.author)}', '${escapeAttr(rev.text)}', ${rev.rating || 5})">Редактировать</button>
                    <button class="action-btn delete-btn" onclick="removeReview('${rev.rowId}')">Удалить</button>
                `;
            }

            if (actionsHtml) {
                actionsHtml = `<div class="review-actions">${actionsHtml}</div>`;
            }

            let adminReplyHtml = '';
            if (rev.adminReply) {
                adminReplyHtml = `
                    <div class="playmarket-reply-box">
                        <div class="playmarket-reply-header">
                            <span class="playmarket-reply-author">Администратор</span>
                        </div>
                        <div class="playmarket-reply-text">${escapeHtml(rev.adminReply)}</div>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="review-card-header">
                    <span class="review-author-name">${escapeHtml(rev.author)}</span>
                    <span class="review-card-stars">${starsHtml}</span>
                </div>
                <div class="review-card-text">${escapeHtml(rev.text)}</div>
                ${adminReplyHtml}
                ${actionsHtml}
            `;

            list.appendChild(card);
        });
    }

    function getDeclension(number) {
        let n = Math.abs(number) % 100;
        let n1 = n % 10;
        if (n > 10 && n < 20) return 'отзывов';
        if (n1 > 1 && n1 < 5) return 'отзыва';
        if (n1 == 1) return 'отзыв';
        return 'отзывов';
    }

    function escapeHtml(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    function escapeAttr(text) {
        if (!text) return '';
        return String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    const form = document.getElementById('reviewForm');
    const profanityErrorBox = document.getElementById('profanityError');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const authorInput = document.getElementById('reviewAuthor').value.trim();
            const textInput = document.getElementById('reviewText').value.trim();
            const rating = parseInt(ratingInput.value);

            if (!authorInput || !textInput) return;

            if (containsBadWords(authorInput) || containsBadWords(textInput)) {
                if (profanityErrorBox) profanityErrorBox.style.display = 'block';
                return;
            } else {
                if (profanityErrorBox) profanityErrorBox.style.display = 'none';
            }

            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';
            }

            try {
                const response = await fetch(WEB_APP_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'save',
                        author: authorInput,
                        text: textInput,
                        rating: rating
                    })
                });

                const result = await response.json();

                if (result.status === 'admin_success') {
                    localStorage.setItem('is_honey_admin', 'true');
                    showReviewStatus('Режим администратора успешно активирован на этом устройстве!', 'success');
                } else if (result.status === 'success') {
                    localStorage.setItem('my_review_author', authorInput);
                    showReviewStatus('✅ Отзыв успешно оставлен. Если отзыв не появился — обновите страницу.', 'success');
                }

                form.reset();
                const reviewAuthorEl = document.getElementById('reviewAuthor');
                if (reviewAuthorEl) reviewAuthorEl.value = authorInput;
                if (submitBtn) submitBtn.textContent = 'Оставить отзыв';
                ratingInput.value = 5;
                updateStars(5, stars);

                await renderReviews();
            } catch (error) {
                console.error('Ошибка отправки:', error);
                showReviewStatus('Отзыв отправлен. Если отзыв не появился — обновите страницу.', 'error');
                await renderReviews();
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    window.removeReview = async function(rowId) {
        if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            const isAdmin = localStorage.getItem('is_honey_admin') === 'true';
            const adminMarker = isAdmin ? 'honey123' : '';
            const authorKey = localStorage.getItem('my_review_author') || '';

            try {
                const response = await fetch(WEB_APP_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'delete',
                        rowId: rowId,
                        adminMarker: adminMarker,
                        authorKey: authorKey
                    })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    showReviewStatus('Отзыв успешно удален.', 'success');
                    await renderReviews();
                } else {
                    alert(result.message || 'Ошибка удаления');
                }
            } catch (e) {
                alert('Ошибка соединения. Обновите страницу и попробуйте снова.');
            }
        }
    };

    window.openAdminReplyModal = function(rowId) {
        document.getElementById('modalTitle').textContent = 'Ответ администратора';
        document.getElementById('modalMode').value = 'reply';
        document.getElementById('editAuthorWrapper').style.display = 'none';
        document.getElementById('editRatingWrapper').style.display = 'none';
        document.getElementById('replyRowId').value = rowId;
        document.getElementById('adminModalText').value = '';
        document.getElementById('modalProfanityError').style.display = 'none';
        document.getElementById('adminModal').classList.add('active');
    };

    window.openEditModal = function(rowId, author, text, rating) {
        document.getElementById('modalTitle').textContent = 'Редактировать отзыв';
        document.getElementById('modalMode').value = 'edit';
        document.getElementById('editAuthorWrapper').style.display = 'flex';
        document.getElementById('editReviewAuthor').value = author;
        document.getElementById('editRatingWrapper').style.display = 'flex';
        document.getElementById('replyRowId').value = rowId;
        document.getElementById('adminModalText').value = text;
        document.getElementById('editReviewRating').value = rating;
        document.getElementById('modalProfanityError').style.display = 'none';
        updateStars(rating, modalStars);
        document.getElementById('adminModal').classList.add('active');
    };

    const closeAdminModalBtn = document.getElementById('closeAdminModal');
    if (closeAdminModalBtn) {
        closeAdminModalBtn.addEventListener('click', () => {
            document.getElementById('adminModal').classList.remove('active');
        });
    }

    const sendAdminReplyBtn = document.getElementById('sendAdminReplyBtn');
    if (sendAdminReplyBtn) {
        sendAdminReplyBtn.addEventListener('click', async () => {
            const rowId = document.getElementById('replyRowId').value;
            const mode = document.getElementById('modalMode').value;
            const textVal = document.getElementById('adminModalText').value;
            const newAuthorVal = document.getElementById('editReviewAuthor').value.trim();
            const modalErr = document.getElementById('modalProfanityError');

            if (!textVal) {
                alert('Поле текста не может быть пустым!');
                return;
            }

            if (mode === 'edit') {
                if (!newAuthorVal) {
                    alert('Имя автора не может быть пустым!');
                    return;
                }
                if (containsBadWords(newAuthorVal) || containsBadWords(textVal)) {
                    modalErr.style.display = 'block';
                    return;
                } else {
                    modalErr.style.display = 'none';
                }
            }

            try {
                let bodyData = {};
                if (mode === 'reply') {
                    const isAdmin = localStorage.getItem('is_honey_admin') === 'true';
                    const adminMarker = isAdmin ? 'honey123' : '';
                    bodyData = {
                        action: 'adminReply',
                        rowId: rowId,
                        adminMarker: adminMarker,
                        replyText: textVal
                    };
                } else {
                    bodyData = {
                        action: 'editReview',
                        rowId: rowId,
                        authorKey: localStorage.getItem('my_review_author') || '',
                        newAuthor: newAuthorVal,
                        newText: textVal,
                        newRating: parseInt(document.getElementById('editReviewRating').value)
                    };
                    localStorage.setItem('my_review_author', newAuthorVal);
                }

                const response = await fetch(WEB_APP_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(bodyData)
                });
                const result = await response.json();
                if (result.status === 'success') {
                    showReviewStatus('Изменения успешно сохранены!', 'success');
                    document.getElementById('adminModal').classList.remove('active');
                    await renderReviews();
                } else {
                    alert(result.message || 'Ошибка выполнения операции');
                }
            } catch (e) {
                alert('Ошибка соединения. Обновите страницу.');
                await renderReviews();
            }
        });
    }

    renderReviews();
});