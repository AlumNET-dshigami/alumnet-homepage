/* AIナビゲーター「高橋 葵」 — 第1段（用意された案内文の表示のみ。API接続なし） */
(function () {
  'use strict';
  if (window.__aoiNavigator) return;
  window.__aoiNavigator = true;

  var FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScFIHCpSUwW9EbqPbryuMRxY0Pc5Lsfc5-yn0AO8VSmFAM0IQ/viewform';
  var LINKS = {
    training: { label: 'AI研修プログラムのページを見る', href: '/lp/ai-training/' },
    form: { label: '無料相談フォームへ', href: FORM_URL, external: true },
    services: { label: '支援領域の一覧を見る', href: '/#services' },
    whitepaper: { label: 'ホワイトペーパーのページを見る', href: 'https://alum-net.jp/lp/whitepaper/' }
  };

  var GREETING = 'こんにちは。AlumNETのAIナビゲーター、高橋葵です。サービスや研修について、気になっていることをお聞かせください。下から選んでいただいても構いません。';
  var FALLBACK = 'ご質問ありがとうございます。その内容は選択肢にないため、無料相談フォームからお問い合わせください。担当者が回答します。';
  var NOTE = 'このナビゲーターはAIです。表示される回答は、あらかじめ用意された案内文です。金額・条件の確定は担当者が行います。';

  // キーワードは上から順に判定する（先に一致したものを返す）
  var QA = [
    { id: 'cost', chip: '研修の費用はどのくらいですか？', link: 'training',
      keys: ['費用', '料金', '価格', '金額', 'いくら', 'モニター'],
      answer: 'AI研修プログラムは、半日（3時間）15万円〜、1日（6時間）30万円〜（いずれも税別）です。先着3社さまにはモニター価格（半日10万円・税別、匿名事例の公開にご協力いただく条件）もご用意しています。内容の詳細はAI研修プログラムのページをご覧ください。' },
    { id: 'start', chip: '何から始めるのがいいですか？', link: 'form',
      keys: ['何から', '始め', 'はじめ'],
      answer: 'まずは現状と優先順位の整理から始めるのがおすすめです。無料相談（30分）で御社の状況をうかがい、進め方をご提案します。' },
    { id: 'apply', chip: '無料相談を申し込みたい', link: 'form',
      keys: ['相談', '申し込', '申込', '問い合わせ', '問合せ'],
      answer: 'ありがとうございます。無料相談は30分で、現状と優先順位の整理から始めます。下のフォームからお申し込みください。' },
    { id: 'whitepaper', chip: '無料の資料を見たい', link: 'whitepaper',
      keys: ['資料', 'ホワイトペーパー', 'ダウンロード'],
      answer: 'ホワイトペーパーを3本公開しています（スカウト採用の成果を分ける条件／人事・採用部門の生成AI活用ガイド／アルムナイ採用のはじめ方）。フォーム入力後、メールでURLをお送りします。' },
    { id: 'menu', chip: '採用支援のメニューを知りたい', link: 'services',
      keys: ['Recruit AI Ops', 'RAO', 'RPO', 'アルムナイ', 'メニュー', '支援', 'サービス', 'CHRO', 'Indeed'],
      answer: '支援領域は8つあります。RPO、CHRO代行、Indeed運用支援、LP・Web制作支援、アルムナイ構築・運用、人材紹介事業の立ち上げ支援、Recruit AI Ops、AI研修プログラムです。トップページの支援領域一覧で、それぞれの詳細をご覧いただけます。' },
    { id: 'content', chip: '研修の内容を知りたい', link: 'training',
      keys: ['研修', '内容', 'AI研修', 'セミナー'],
      answer: '人事・採用部門向けに、生成AIの基礎と注意点、求人票・スカウト文の作成実践、書類選考・面接設計へのAI活用、自社業務への落とし込みワークを扱います。オンライン・対面のどちらにも対応します。' }
  ];

  // チップの表示順（依頼書のQ&A順）
  var CHIP_ORDER = ['cost', 'start', 'content', 'menu', 'whitepaper', 'apply'];

  function byId(id) {
    for (var i = 0; i < QA.length; i++) if (QA[i].id === id) return QA[i];
    return null;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function makeLink(def) {
    var a = el('a', 'aoi-link', def.label + ' →');
    a.href = def.href;
    if (def.external) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  }

  function findAnswer(text) {
    var t = text.toLowerCase();
    for (var i = 0; i < QA.length; i++) {
      for (var j = 0; j < QA[i].keys.length; j++) {
        if (t.indexOf(QA[i].keys[j].toLowerCase()) !== -1) return QA[i];
      }
    }
    return null;
  }

  function build() {
    var root = el('div', 'aoi-nav');

    var fab = el('button', 'aoi-fab');
    fab.type = 'button';
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'aoi-panel');
    var fabImg = el('img');
    fabImg.src = '/assets/aoi-avatar.jpg';
    fabImg.alt = '';
    fabImg.width = 44; fabImg.height = 44;
    var fabText = el('span', 'aoi-fab-text');
    fabText.appendChild(el('span', 'aoi-fab-main', '葵に相談'));
    fabText.appendChild(el('span', 'aoi-fab-sub', 'AIナビゲーター'));
    fab.appendChild(fabImg);
    fab.appendChild(fabText);

    var panel = el('section', 'aoi-panel');
    panel.id = 'aoi-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'AIナビゲーター 高橋 葵');

    var head = el('div', 'aoi-head');
    var headImg = el('img');
    headImg.src = '/assets/aoi-panel.jpg';
    headImg.alt = '高橋 葵（AIナビゲーター）のポートレート';
    headImg.width = 48; headImg.height = 48;
    var headText = el('div', 'aoi-head-text');
    headText.appendChild(el('span', 'aoi-name', '高橋 葵'));
    headText.appendChild(el('span', 'aoi-role', 'AIナビゲーター'));
    var close = el('button', 'aoi-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', '閉じる');
    head.appendChild(headImg);
    head.appendChild(headText);
    head.appendChild(close);

    var body = el('div', 'aoi-body');
    body.setAttribute('aria-live', 'polite');
    body.appendChild(botMsg(GREETING));
    var chips = el('div', 'aoi-chips');
    CHIP_ORDER.forEach(function (id) {
      var qa = byId(id);
      var c = el('button', 'aoi-chip', qa.chip);
      c.type = 'button';
      c.addEventListener('click', function () { ask(qa.chip, qa); });
      chips.appendChild(c);
    });
    body.appendChild(chips);

    var form = el('form', 'aoi-form');
    var input = el('input', 'aoi-input');
    input.type = 'text';
    input.placeholder = 'ご質問を入力';
    input.maxLength = 200;
    input.setAttribute('aria-label', 'ご質問を入力');
    var send = el('button', 'aoi-send', '送信');
    send.type = 'submit';
    form.appendChild(input);
    form.appendChild(send);

    var note = el('p', 'aoi-note', NOTE);

    panel.appendChild(head);
    panel.appendChild(body);
    panel.appendChild(form);
    panel.appendChild(note);
    root.appendChild(fab);
    root.appendChild(panel);

    function botMsg(text, linkKey) {
      var m = el('div', 'aoi-msg bot');
      m.appendChild(el('p', null, text));
      if (linkKey) m.appendChild(makeLink(LINKS[linkKey]));
      return m;
    }

    function scrollDown() { body.scrollTop = body.scrollHeight; }

    function ask(question, qa) {
      body.appendChild(el('div', 'aoi-msg user', question));
      body.appendChild(qa ? botMsg(qa.answer, qa.link) : botMsg(FALLBACK, 'form'));
      scrollDown();
    }

    function open() {
      root.classList.add('is-open');
      fab.setAttribute('aria-expanded', 'true');
      close.focus();
    }
    function shut() {
      root.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
      fab.focus();
    }

    fab.addEventListener('click', open);
    close.addEventListener('click', shut);
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') shut();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.replace(/^\s+|\s+$/g, '');
      if (!text) return;
      input.value = '';
      ask(text, findAnswer(text));
    });

    document.body.appendChild(root);
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
