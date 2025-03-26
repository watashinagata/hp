/**
 * WordPressブログから最新記事を取得して表示するスクリプト
 * idealjapan.co.jp/blog/ のREST APIを使用
 */
document.addEventListener('DOMContentLoaded', function() {
  const postsList = document.querySelector('.recent-posts');
  const blogSection = document.getElementById('blog');
  
  if (!postsList) return;
  
  // ローディング表示を追加
  const loadingElement = document.createElement('div');
  loadingElement.className = 'loading-posts';
  loadingElement.innerHTML = '<span>記事を読み込み中...</span>';
  postsList.innerHTML = '';
  postsList.appendChild(loadingElement);
  
  // WordPressのREST APIから最新記事を取得
  fetch('https://idealjapan.co.jp/blog/wp-json/wp/v2/posts?per_page=3&_embed')
    .then(response => {
      if (!response.ok) {
        throw new Error('API応答エラー: ' + response.status);
      }
      return response.json();
    })
    .then(posts => {
      // ローディング表示を削除
      postsList.removeChild(loadingElement);
      
      if (posts && posts.length > 0) {
        // 記事を追加
        posts.forEach(post => {
          const date = new Date(post.date);
          const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
          
          const listItem = document.createElement('li');
          listItem.className = 'post-item';
          listItem.innerHTML = `
            <div class="post-date">${formattedDate}</div>
            <h3 class="post-title">
              <a href="${post.link}">${post.title.rendered}</a>
            </h3>
          `;
          
          postsList.appendChild(listItem);
        });
        
        // ブログセクションの表示
        blogSection.style.display = 'block';
      } else {
        // 記事がない場合はブログセクションを非表示
        blogSection.style.display = 'none';
      }
    })
    .catch(error => {
      console.error('ブログ記事の取得に失敗しました:', error);
      
      // エラーメッセージを表示
      postsList.innerHTML = `
        <li class="post-item error">
          <p>記事の読み込みに失敗しました。後ほど再度お試しください。</p>
        </li>
      `;
      
      // 念のためブログセクションは表示
      blogSection.style.display = 'block';
    });
});
