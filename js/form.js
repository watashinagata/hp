/**
 * フォーム送信処理
 * Googleスプレッドシート連携対応版
 */
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const submitButton = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // 送信ボタンを無効化して「送信中...」に変更
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送信中...';
      }
      
      // フォームデータの取得
      const formData = new FormData(contactForm);
      const formDataObj = {};
      
      // FormDataオブジェクトをJSONに変換
      formData.forEach((value, key) => {
        formDataObj[key] = value;
      });
      
      try {
        // PHPスクリプトに送信
        // 本番では正しいURLに置き換える
        // ローカルで開発中は相対パス、本番ではドメインに変更
        const response = await fetch('/send-mail.php', { // 注意: エックスサーバーにアップロードする前にここのパスを確認してください
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formDataObj)
        });
        
        const result = await response.json();
        console.log('APIレスポンス:', result);
        
        // メール送信結果の詳細をログに表示
        if (result.mail_status) {
          console.log('メール送信結果:', result.mail_status);
        }
        
        if (response.ok && result.success) {
          // 送信成功
          contactForm.reset();
          contactForm.style.display = 'none';
          formSuccess.style.display = 'flex';
          formSuccess.style.opacity = '1';
          formSuccess.style.transform = 'translateY(0)';
          
          console.log('Googleスプレッドシート送信結果:', result.spreadsheet);
          
          // 5秒後にフォームを再表示
          setTimeout(() => {
            formSuccess.style.opacity = '0';
            formSuccess.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
              formSuccess.style.display = 'none';
              contactForm.style.display = 'block';
              
              // ボタンを元に戻す
              if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = '送信する';
              }
            }, 300);
          }, 5000);
        } else {
          // エラー時の処理
          console.error('Server error:', result);
          alert('送信に失敗しました。後ほど再度お試しください。');
          
          // ボタンを元に戻す
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '送信する';
          }
        }
      } catch (error) {
        console.error('Error:', error);
        alert('エラーが発生しました。後ほど再度お試しください。');
        
        // ボタンを元に戻す
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = '送信する';
        }
      }
    });
  }
});