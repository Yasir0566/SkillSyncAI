const conversation = document.querySelector('#conversation');
const composer = document.querySelector('#composer');
const input = document.querySelector('#questionInput');
const themeButton = document.querySelector('#themeButton');
const messages = [];

lucide.createIcons();

function addMessage(text, type) {
  const article = document.createElement('article');
  article.className = `message ${type}-message`;
  article.innerHTML = type === 'user'
    ? `<div class="message-avatar">YOU</div><div><span class="message-label">You</span><p>${escapeHtml(text)}</p></div>`
    : `<div class="message-avatar">SS</div><div><span class="message-label">SKillSync AI</span><p>${escapeHtml(text)}</p></div>`;
  conversation.appendChild(article);
  conversation.scrollTop = conversation.scrollHeight;
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
}

async function submitQuestion(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;
  addMessage(cleanQuestion, 'user');
  messages.push({ role: 'user', content: cleanQuestion });
  input.value = '';
  input.style.height = 'auto';
  input.disabled = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The assistant could not respond.');
    addMessage(data.reply, 'assistant');
    messages.push({ role: 'assistant', content: data.reply });
  } catch (error) {
    addMessage(`Connection error: ${error.message}`, 'assistant');
    messages.pop();
  } finally {
    input.disabled = false;
    input.focus();
  }
}

composer.addEventListener('submit', (event) => {
  event.preventDefault();
  submitQuestion(input.value);
});

document.querySelectorAll('.suggestion').forEach((button) => {
  button.addEventListener('click', () => submitQuestion(button.dataset.question));
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});

themeButton.addEventListener('click', () => {
  document.body.classList.toggle('warm-mode');
});

