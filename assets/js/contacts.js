
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const message = document.getElementById('contact-message');
  if (!form || !message) return;

  const productId = new URLSearchParams(location.search).get('product');
  const messageField = form.elements.message;
  if (productId && messageField && !messageField.value) {
    messageField.value = `Здравствуйте! Прошу подготовить предложение по позиции ${productId}.`;
  }

  // Бэкенда у статического сайта нет: письмо собирается в почтовом клиенте
  // пользователя. Заменить на Pages Function, когда появится SMTP-доступ.
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const subject = `Запрос с сайта RayOpto${productId ? ` — ${productId}` : ''}`;
    const body = [
      `Имя: ${data.get('name')}`,
      `Контакт: ${data.get('contact')}`,
      '',
      data.get('message')
    ].join('\n');

    message.hidden = false;
    message.textContent = 'Открываем почтовый клиент с готовым письмом. Если окно не появилось — напишите на info@rayopto.ru.';
    location.href = `mailto:info@rayopto.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});
