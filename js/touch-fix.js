/**
 * スマホでのスクロール問題を修正するスクリプト
 * サイト全体のスクロールを優先し、セクション内のスクロールを防止
 */

document.addEventListener('DOMContentLoaded', function() {
  // 全てのセクションに対してスクロール修正を実施
  fixTouchScroll();
  
  // load完了後にも再適用
  window.addEventListener('load', function() {
    setTimeout(fixTouchScroll, 500);
  });
});

function fixTouchScroll() {
  // すべてのセクションIDを対象にする
  const allSections = [
    'services',     // 事業内容
    'philosophy',   // 理念
    'about',        // 会社概要
    'profile',      // 代表者
    'careers',      // 採用
    'contact'       // お問い合わせ
  ];
  
  // 各セクションに対して処理
  allSections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // セクション自体のスクロールを無効化
    section.style.overflow = 'visible';
    section.style.touchAction = 'auto';
    
    // セクション内のすべての要素を取得
    const allElements = section.querySelectorAll('*');
    
    // 各要素のスクロールを無効化
    allElements.forEach(element => {
      // スタイルを直接変更
      element.style.overflow = 'visible';
      element.style.overflowY = 'visible';
      element.style.overflowX = 'visible';
      element.style.touchAction = 'auto';
      
      // スクロールが動作する可能性のあるタッチイベントを無効化
      element.addEventListener('touchstart', preventScroll, { passive: false });
      element.addEventListener('touchmove', preventScroll, { passive: false });
    });
  });
  
  // スクロールを防ぐ要素に対するより強力な対策
  const scrollElements = [
    '.service-card', '.services-grid',
    '.philosophy-card', '.philosophy-cards',
    '.about-content', '.company-details',
    '.profile-card', '.profile-bio',
    '.message-content', '.position-card',
    '.contact-form', '.contact-form-wrapper'
  ];
  
  scrollElements.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // 強制的にスクロールを無効化
      element.style.overflow = 'visible !important';
      element.style.overflowY = 'visible !important';
      element.style.maxHeight = 'none !important';
      element.style.height = 'auto !important';
      
      // 特定のCSSクラスを追加
      element.classList.add('no-section-scroll');
    });
  });
  
  // フォーム要素は除外（スクロール許可）
  const formElements = document.querySelectorAll('textarea, select');
  formElements.forEach(element => {
    element.style.overflow = 'auto';
    element.classList.remove('no-section-scroll');
    element.removeEventListener('touchstart', preventScroll);
    element.removeEventListener('touchmove', preventScroll);
  });
  
  // ページ全体のスクロールを有効化
  document.documentElement.style.overflow = 'auto';
  document.documentElement.style.height = 'auto';
  document.body.style.overflow = 'auto';
  document.body.style.height = 'auto';
}

// タッチイベントを防止する関数
function preventScroll(e) {
  // フォーム要素内のスクロールは許可
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
    return true;
  }
  
  // その他の要素ではスクロールを防止
  e.stopPropagation();
}
