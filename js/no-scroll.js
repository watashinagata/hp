/**
 * すべてのスクロール機能を完全に無効化するスクリプト
 */

document.addEventListener('DOMContentLoaded', function() {
  // 全てのスクロール可能性のある要素を取得
  disableAllScrolling();
  
  // 動的に追加される要素にも対応するため
  const observer = new MutationObserver(function() {
    disableAllScrolling();
  });
  
  // DOM変更を監視
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // リサイズ時にも再実行
  window.addEventListener('resize', function() {
    disableAllScrolling();
  });
});

/**
 * ページ内のすべてのスクロールを無効化する関数
 */
function disableAllScrolling() {
  // スクロールしそうな要素のセレクタ一覧
  const selectors = [
    '#profile *',
    '#careers *',
    '.profile-card',
    '.profile-details',
    '.profile-bio',
    '.message-content',
    '.message-details',
    '.position-card',
    '.scrollable-content',
    '[style*="overflow"]',
    '[style*="overflow-y"]',
    '[style*="height"]',
    '[style*="max-height"]'
  ];
  
  // 全ての要素に強制的にスクロール無効化スタイルを適用
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
      // インラインスタイルを上書き
      element.style.setProperty('overflow', 'visible', 'important');
      element.style.setProperty('overflow-y', 'visible', 'important');
      element.style.setProperty('max-height', 'none', 'important');
      element.style.setProperty('height', 'auto', 'important');
      
      // class属性に直接スタイルを追加
      element.classList.add('no-scroll');
      
      // コンテナ要素のスタイル調整
      if (element.classList.contains('container')) {
        element.style.setProperty('width', '100%', 'important');
        element.style.setProperty('max-width', '100%', 'important');
        element.style.setProperty('padding', '0 1rem', 'important');
      }
      
      // スクロールイベントリスナーを無効化
      element.addEventListener('scroll', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);
    });
  });
  
  // 特に問題となるセクションのみのチェック
  const problemSections = ['profile', 'careers'];
  
  problemSections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // セクション全体を走査して、computedStyleをチェック
    const allElements = section.querySelectorAll('*');
    
    allElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      
      // スクロール可能性のある要素を検出
      if (
        computedStyle.overflow !== 'visible' ||
        computedStyle.overflowY !== 'visible' ||
        (computedStyle.maxHeight !== 'none' && computedStyle.maxHeight !== 'auto' && computedStyle.maxHeight !== '')
      ) {
        // スクロール無効化
        element.style.setProperty('overflow', 'visible', 'important');
        element.style.setProperty('overflow-y', 'visible', 'important');
        element.style.setProperty('max-height', 'none', 'important');
        element.style.setProperty('height', 'auto', 'important');
        element.classList.add('no-scroll-fixed');
      }
    });
  });
}
