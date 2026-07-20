
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const message = document.getElementById('contact-message');
  form.addEventListener('submit', event => {
    event.preventDefault();
    message.hidden = false;
    message.textContent = 'Форма подготовлена. Подключение отправки писем будет следующим этапом.';
  });
});
