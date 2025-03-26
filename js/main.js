// Googleフォームとの連携に関するコメント
// 現在は、iframeによるGoogleフォームの埋め込みを使用しています。
// フォーム送信中の問題を回避するためのアプローチです。

// メインJavaScriptファイル
document.addEventListener('DOMContentLoaded', function() {
  // 各モジュールの初期化
  initPreloader();
  initHeaderScroll();
  initMobileMenu();
  initSmoothScroll();
  initActiveNavigation();
  initContactForm();
  initBackToTop();
  initHeroCanvas();
  initAOS();
  initMobileScrollables();
});

// ローディングアニメーション
function initPreloader() {
  const loader = document.querySelector('.loader-wrapper');
  const body = document.body;
  if (!loader) return;
  
  // ページ読み込み完了後、一定時間後にローダーを非表示にする
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      body.classList.remove('loading'); // loading クラスを削除してコンテンツを表示
    }, 2500);
  });
  
  // バックアッププラン：5秒経過しても load イベントが発火しない場合に対応
  setTimeout(() => {
    if (!loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      body.classList.remove('loading');
    }
  }, 5000);
}

// スクロール時のヘッダー変更
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// モバイルメニュー
function initMobileMenu() {
  const menuIcon = document.querySelector('.menu-icon');
  const navLinks = document.querySelector('.nav-links');
  
  if (!menuIcon || !navLinks) return;
  
  menuIcon.addEventListener('click', () => {
    menuIcon.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  
  // メニュー項目クリック時にメニューを閉じる
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      menuIcon.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

// スムーススクロール
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      // ヘッダーのリンクの場合、実際のURL遷移を許可
      if (link.getAttribute('href').indexOf('#') === 0 && link.getAttribute('href').length > 1) {
        e.preventDefault();
        
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (!target) return;
        
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// アクティブなナビゲーションリンク
function initActiveNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  if (sections.length === 0 || navLinks.length === 0) return;
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 200;
      const sectionHeight = section.offsetHeight;
      
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// お問い合わせフォーム（Googleフォーム連携）
function initContactForm() {
  // iframeからのメッセージをリッスン
  window.addEventListener('message', function(event) {
    // Google Formsのドメインからのメッセージか確認
    if (event.origin.indexOf('google.com') > -1) {
      if (event.data.includes('formSubmitted')) {
        // フォーム送信成功時の処理
        showFormSuccess();
      }
    }
  });
  
  // URLハッシュからの成功メッセージも処理
  if (window.location.hash === '#form-success') {
    showFormSuccess();
  }
  
  // iframeの読み込み完了時のイベントを追加
  const googleFormIframe = document.getElementById('google-form-iframe');
  if (googleFormIframe) {
    googleFormIframe.onload = function() {
      // iframeが読み込まれたことを確認
      console.log('Google Form iframe loaded');
      
      // URLをチェックして送信完了か確認
      try {
        // iframeのURLをチェックして、「完了画面」かどうか確認
        if (googleFormIframe.contentWindow.location.href.indexOf('formResponse') > -1) {
          showFormSuccess();
        }
      } catch (e) {
        // セキュリティポリシーによりiframeのコンテンツにアクセスできない場合
        console.log('Cannot access iframe content due to security policy');
      }
    };
  }
}

// フォーム送信成功時の処理
function showFormSuccess() {
  const formContainer = document.getElementById('form-container');
  const successMsg = document.getElementById('form-success');
  
  if (formContainer && successMsg) {
    // フォームを非表示にし、成功メッセージを表示
    formContainer.style.display = 'none';
    successMsg.style.display = 'flex';
    successMsg.style.opacity = '1';
    successMsg.style.transform = 'translateY(0)';
    
    // 5秒後にフォームを元に戻す
    setTimeout(() => {
      successMsg.style.opacity = '0';
      successMsg.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        formContainer.style.display = 'block';
        successMsg.style.display = 'none';
        // iframeのリロード
        const iframe = document.getElementById('google-form-iframe');
        if (iframe) {
          iframe.src = iframe.src;
        }
        // URLハッシュを削除
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }, 500);
    }, 5000);
  }
}

// ヒーローセクションのキャンバスアニメーション
function initHeroCanvas() {
  const heroCanvas = document.querySelector('.hero-canvas');
  if (!heroCanvas) return;
  
  // ランダムな浮遊粒子を生成
  for (let i = 0; i < 50; i++) {
    createFloatingParticle(heroCanvas);
  }
}

// 浮遊粒子の生成
function createFloatingParticle(container) {
  const particle = document.createElement('div');
  particle.classList.add('floating-particle');
  
  // ランダムな位置とサイズを設定
  const size = Math.random() * 4 + 1;
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const duration = Math.random() * 20 + 10;
  const delay = Math.random() * 5;
  const opacity = Math.random() * 0.3 + 0.1;
  
  // スタイル設定
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${left}%`;
  particle.style.top = `${top}%`;
  particle.style.opacity = opacity;
  particle.style.animationDuration = `${duration}s`;
  particle.style.animationDelay = `${delay}s`;
  
  // 色のバリエーション
  const colors = [
    'rgba(66, 153, 225, 0.6)',
    'rgba(237, 137, 54, 0.5)',
    'rgba(255, 255, 255, 0.7)'
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  particle.style.backgroundColor = randomColor;
  
  container.appendChild(particle);
}

// トップへ戻るボタン
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('active');
    } else {
      backToTopBtn.classList.remove('active');
    }
  });
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// AOS (Animate On Scroll)初期化
function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600, // アニメーション時間を短縮
      easing: 'ease-out',
      once: true, // 一度だけアニメーションを実行
      offset: 50, // 要素が画面に50px入ったらアニメーション開始（早めに表示）
      delay: 0 // 遅延なし
    });
  }
}

// モバイル用縦スクロール最適化
function initMobileScrollables() {
  // すべてのセクションの余白調整
  const allSections = ['services', 'philosophy', 'about', 'profile', 'careers', 'contact'];
  allSections.forEach(section => {
    adjustSectionSpacing(section);
  });
  
  // すべてのセクション内要素のスクロールを無効化
  const allSectionSelectors = allSections.map(id => `#${id} *`).join(', ');
  const allElements = document.querySelectorAll(allSectionSelectors);
  
  allElements.forEach(element => {
    // 必要なスタイルを適用
    element.style.overflow = 'visible';
    element.style.overflowY = 'visible';
    element.style.maxHeight = 'none';
    element.style.height = 'auto';
    element.style.touchAction = 'auto';
    
    // 特定のクラスを追加
    element.classList.add('no-section-scroll');
  });
  
  // 例外：テキストエリアとセレクトボックスはスクロール可能にする
  const formElements = document.querySelectorAll('textarea, select');
  formElements.forEach(element => {
    element.style.overflow = 'auto';
    element.classList.remove('no-section-scroll');
  });
  
  // ページ全体のスクロールを確保
  document.body.style.overflow = 'auto';
  document.body.style.overflowX = 'hidden';
  document.body.style.height = 'auto';
  
  // 画面サイズ変更時に再計算
  window.addEventListener('resize', () => {
    allSections.forEach(section => {
      adjustSectionSpacing(section);
    });
  });
}

// セクションのスペースを調整
function adjustSectionSpacing(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  
  // 上部のパディングを調整
  section.style.paddingTop = '2rem';
  section.style.paddingBottom = '2rem';
  
  // 各要素の余白を調整
  const cards = section.querySelectorAll('.profile-card, .position-card, .message-content');
  cards.forEach(card => {
    card.style.marginBottom = '1rem';
  });
}