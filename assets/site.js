/* ==========================================================================
   AlumNET — 共通スクリプト
   5ページ共通のヘッダー挙動だけを持つ。ページ固有のロジック
   （contact のフォーム送信、download のモーダル・浮遊CTA）は各ページに残す。
   ========================================================================== */
(function () {
  'use strict';

  // ---- モバイルナビの開閉 ----
  // 768px未満で nav ul が display:none になるため、その受け皿として
  // ハンバーガー＋パネルを開閉する。開閉状態は aria-expanded を単一の
  // 真実とし、見た目（3本線→×）はCSSの属性セレクタ側で追従させる。
  var toggle = document.getElementById('navToggle');
  var panel = document.getElementById('navPanel');
  if (!toggle || !panel) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    panel.classList.toggle('is-open', open);
    // 背面のスクロールを止める（閉じたら必ず戻す）
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function isOpen() {
    return toggle.getAttribute('aria-expanded') === 'true';
  }

  toggle.addEventListener('click', function () {
    setOpen(!isOpen());
  });

  // 項目を選んだら閉じる（同一ページ内アンカーでも遷移でも同じ挙動）
  panel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });

  // Escapeで閉じ、フォーカスをハンバーガーに戻す
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // 769px以上へ広がったらパネルは不要（CSSで非表示になるため状態も揃える）
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && isOpen()) setOpen(false);
  });
})();
