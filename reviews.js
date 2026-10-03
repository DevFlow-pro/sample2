// ============ ОТЗЫВЫ ============
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby9PAv4RcnMzAzsNpwK1nci7DTotYK_sP9UZOFzvXYecHnsDsn057cM4T-J8I-PoGkE/exec";

const badWords = [
    'шешен', 'шешең', 'шешенд', 'шешени', 'шешені', 'шеше', 'шешенник', 'шешенго',
    'қотақ', 'котак', 'қотақбас', 'котакбас', 'қотақбасы', 'құйғақ', 'міс', 'мис', 
    'текпе', 'сасық', 'сасык', 'сисек', 'амы', 'ам', 'ама', 'қобын', 'кобын', 
    'жезөкше', 'жезокше', 'қатын', 'катын', 'қаңбақ', 'мұрын', 'есек', 'есеке', 
    'ит', 'иттің', 'иттин', 'иттер', 'шошқа', 'шошка', 'пасық', 'пасык', 
    'бәле', 'бале', 'надан', 'тезек', 'маймақ', 'қаракөс', 'құрт', 'арыз',
    'хуй', 'хуя', 'хую', 'хуем', 'хуе', 'хуи', 'хуев', 'хуях', 'хуями', 'охуе', 'захуе', 'похуе', 'ныхуя', 'нихуя', 'хуесос', 'хуепл', 'хуеверт', 'уебан', 'уебок',
    'пизд', 'писд', 'пезд', 'пизда', 'пизды', 'пизде', 'пизду', 'пиздой', 'пиздец', 'пиздеж', 'пиздеть', 'пиздит', 'спиздил', 'отпизди', 'пиздюк', 'пездюк',
    'еб', 'ебл', 'ебы', 'ебн', 'ебт', 'еба', 'ебе', 'ебу', 'еби', 'ебо', 'ебь', 'ебать', 'ебал', 'ебаный', 'ебану', 'ебнуть', 'ебнулся', 'выеб', 'заеб', 'поеб', 'наеб', 'уеб', 'перееб',
    'бля', 'блять', 'блядь', 'бляд', 'блядина', 'бляду', 'блядо', 'блядск', 'бляди',
    'сук', 'сука', 'суки', 'суку', 'сучка', 'сучкам', 'сучками',
    'мраз', 'мразот', 'мрази', 'мразь',
    'шлюх', 'шлюха', 'шлюхи', 'шлюшку',
    'гондон', 'гандон', 'гондоны', 'гандоны',
    'мудак', 'мудила', 'мудило', 'муди',
    'дерьм', 'дерьмо', 'дерьме', 'дерьмом', 'говн', 'говно', 'говна', 'говну', 'говне', 'говном', 'говен',
    'сран', 'срать', 'срань', 'срал', 'серут', 'посрал',
    'чмо', 'чмыр', 'чмошник',
    'пидор', 'пидар', 'педик', 'пидорас', 'пидарас', 'петух', 'петухи',
    'залуп', 'залупа', 'манда', 'мудо', 'елда', 'елдын', 'дроч', 'дрочить', 'дрочил', 'задрот',
    'fuck', 'fuk', 'fcking', 'fucker', 'motherfucker', 'shit', 'sht', 'shitty', 'bitch', 'btch', 'bastard', 'asshole', 'ass', 'dick', 'cock', 'pussy', 'whore', 'slut', 'cunt', 'crap', 'idiot', 'retard', 'nigga', 'nigger', 'fag', 'faggot',
    'хач', 'чурка', 'жид', 'ниггер', 'нигер', 'узкоглаз', 'черножоп', 'косоглаз', 'пидорс', 'трансфо', 'фашист', 'нацист', 'нацик', 'педофил', 'педо'
];

function containsBadWords(text) {
    if (!text) return false;
    let clean = text.toLowerCase()
        .replace(/a/g, 'а').replace(/e/g, 'е').replace(/o/g, 'о').replace(/p/g, 'р')
        .replace(/c/g, 'с').replace(/y/g, 'у').replace(/x/g, 'х').replace(/i/g, 'и')
        .replace(/3/g, 'з').replace(/0/g, 'о').replace(/1/g, 'и');

    let words = clean.match(/[a-zа-яёқғңөұүһіә]+/g);
    if (!words) return false;

    for (let w of words) {
        for (let bw of badWords) {
            if (w.includes(bw) || bw.includes(w)) {
                if (w === bw || (w.length >= 3 && bw.length >= 3 && (w.startsWith(bw) || w.endsWith(bw) || w.includes(bw)))) {
                    return true;
                }
            }
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

    async function fetchReviews() {
        try {
            const response = await fetch(`${WEB_APP_URL}?action=get`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Ошибка загрузки отзывов:", error);
            return [];
        }
    }

    async function renderReviews() {
        const list = document.getElementById('reviewsList');
        const summaryStars = document.getElementById('summaryStars');
        const summaryCount = document.getElementById('summaryCount');

        const reviews = await fetchReviews();
        const isAdmin = localStorage.getItem('is_honey_admin') === 'true';
        const currentAuthor = localStorage.getItem('my_review_author') || '';

        list.innerHTML = '';

        if (reviews.length === 0) {
            list.innerHTML = '<div class="no-reviews-msg">Отзывов пока нет. Будьте первыми!</div>';
            summaryStars.textContent = '★★★★★';
            summaryCount.textContent = '(0 отзывов)';
            return;
        }

        let totalScore = 0;
        reviews.forEach(rev => totalScore += Number(rev.rating || 5));
        const avgRating = (totalScore / reviews.length).toFixed(1);
        const fullStarsCount = Math.round(totalScore / reviews.length);
        summaryStars.textContent = '★'.repeat(fullStarsCount) + '☆'.repeat(5 - fullStarsCount);
        summaryCount.textContent = `(${reviews.length} ${getDeclension(reviews.length)}) — ${avgRating} / 5`;

        reviews.forEach((rev) => {
            const card = document.createElement('div');
            card.className = 'review-card';

            const starsHtml = '★'.repeat(rev.rating || 5) + '☆'.repeat(5 - (rev.rating || 5));
            let actionsHtml = '';
            let isMyReview = currentAuthor && rev.author.toLowerCase() === currentAuthor.toLowerCase();

            if (isAdmin) {
                actionsHtml += `
                    <button class="action-btn reply-admin-btn" onclick="openAdminReplyModal('${rev.rowId}')">Ответить</button>
                    <button class="action-btn delete-btn" onclick="removeReview('${rev.rowId}', true)">Удалить</button>
                `;
            } else if (isMyReview) {
                actionsHtml += `
                    <button class="action-btn edit-btn" onclick="openEditModal('${rev.rowId}', '${escapeAttr(rev.author)}', '${escapeAttr(rev.text)}', ${rev.rating || 5})">Редактировать</button>
                    <button class="action-btn delete-btn" onclick="removeReview('${rev.rowId}', false)">Удалить</button>
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
                            <span class="playmarket-reply-author">
                                Администратор
                            </span>
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
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    function escapeAttr(text) {
        if (!text) return '';
        return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    const form = document.getElementById('reviewForm');
    const profanityErrorBox = document.getElementById('profanityError');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const authorInput = document.getElementById('reviewAuthor').value.trim();
        const textInput = document.getElementById('reviewText').value.trim();
        const rating = parseInt(ratingInput.value);

        if (!authorInput || !textInput) return;

        if (containsBadWords(authorInput) || containsBadWords(textInput)) {
            profanityErrorBox.style.display = 'block';
            return;
        } else {
            profanityErrorBox.style.display = 'none';
        }

        localStorage.setItem('my_review_author', authorInput);

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

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
                alert('Режим администратора успешно активирован на этом устройстве!');
            } else if (result.status === 'success') {
                alert('Отзыв отправлен! Если он не появился сразу, пожалуйста, обновите страницу.');
            }

            form.reset();
            document.getElementById('reviewAuthor').value = authorInput;
            submitBtn.textContent = 'Оставить отзыв';
            ratingInput.value = 5;
            updateStars(5, stars);

            await renderReviews();
        } catch (error) {
            console.error('Ошибка отправки:', error);
            alert('Отзыв отправлен. Если он не появился, пожалуйста, обновите страницу.');
            await renderReviews();
        } finally {
            submitBtn.disabled = false;
        }
    });

    window.removeReview = async function(rowId, isAdminAction) {
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
                    alert('Отзыв успешно удален.');
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

    document.getElementById('closeAdminModal').addEventListener('click', () => {
        document.getElementById('adminModal').classList.remove('active');
    });

    document.getElementById('sendAdminReplyBtn').addEventListener('click', async () => {
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
                alert('Изменения успешно сохранены! Обновите страницу, если они не отобразились.');
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

    renderReviews();
});