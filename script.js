const opts = { allspaces: true, punct: false, numbers: false, emojis: false, html: false, invert: false };
let caseMode = null;
let frVisible = false;

const prepositions = new Set([
  'de','da','do','das','dos','na','no','nas','nos',
  'em','a','o','as','os','e','é','ou','que','por',
  'para','com','um','uma','uns','umas','ao','aos','à','às'
]);

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeLabel').textContent = isDark ? 'Modo escuro' : 'Modo claro';
}

function toggleOpt(btn) {
  const op = btn.dataset.op;
  opts[op] = !opts[op];
  btn.classList.toggle('active', opts[op]);
  process();
}

function setCase(btn) {
  const c = btn.dataset.case;
  if (caseMode === c) {
    caseMode = null;
    btn.classList.remove('active');
  } else {
    caseMode = c;
    document.querySelectorAll('[data-case]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  process();
}

function toggleFindReplace() {
  frVisible = !frVisible;
  document.getElementById('findReplace').classList.toggle('visible', frVisible);
  document.getElementById('btnFR').classList.toggle('active', frVisible);
  process();
}

function toTitleCase(str) {
  let firstWord = true;
  return str.replace(/(\s*)(\S+)/g, (match, space, word) => {
    const lower = word.toLowerCase();
    let result;
    if (firstWord || !prepositions.has(lower)) {
      result = lower.charAt(0).toUpperCase() + lower.slice(1);
    } else {
      result = lower;
    }
    firstWord = false;
    return space + result;
  });
}

function process() {
  const raw = document.getElementById('input').value;
  let out = raw;

  if (opts.html)      out = out.replace(/<[^>]*>/g, '');
  if (opts.emojis)    out = out.replace(/\p{Emoji}/gu, '');
  if (opts.punct)     out = out.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~«»""'']/g, '');
  if (opts.numbers)   out = out.replace(/[0-9]/g, '');
  if (opts.allspaces) out = out.replace(/\s+/g, '');

  if (frVisible) {
    const find = document.getElementById('frFind').value;
    const rep  = document.getElementById('frReplace').value;
    if (find) {
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out.replace(new RegExp(escaped, 'g'), rep);
    }
  }

  if (caseMode === 'upper') out = out.toUpperCase();
  else if (caseMode === 'lower') out = out.toLowerCase();
  else if (caseMode === 'title') out = toTitleCase(out);

  if (opts.invert) out = [...out].reverse().join('');

  document.getElementById('output').textContent = out;

  const words = out.trim() === '' ? 0 : out.trim().split(/\s+/).length;
  const lines = out === '' ? 0 : out.split('\n').length;
  document.getElementById('s-chars').textContent = out.length;
  document.getElementById('s-words').textContent = words;
  document.getElementById('s-lines').textContent = lines;
  document.getElementById('s-diff').textContent  = Math.max(0, raw.length - out.length);
}

function clearAll() {
  document.getElementById('input').value = '';
  document.getElementById('output').textContent = '';
  ['s-chars','s-words','s-lines','s-diff'].forEach(id =>
    document.getElementById(id).textContent = 0
  );
}

function copyOutput() {
  const text = document.getElementById('output').textContent;
  if (!text) return;
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);

  const btn = document.getElementById('copyBtn');
  btn.textContent = 'Copiado!';
  btn.classList.add('copied');
  showToast();
  setTimeout(() => {
    btn.textContent = 'Copiar resultado';
    btn.classList.remove('copied');
  }, 2000);
}

function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
