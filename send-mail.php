<?php
/**
 * お問い合わせフォーム メール送信スクリプト
 * Googleスプレッドシート連携対応版
 */

// セカンダリーメール送信関数
function send_secondary_mail($to, $subject, $body, $headers) {
    // 送信先ドメインがGmailの場合の特別な処理
    if (strpos($to, '@gmail.com') !== false) {
        error_log("Gmail宛ての特別処理を実行");
        
        // パラメータ設定
        $params = "-f info@idealjapan.co.jp";
        
        // MXレコードを直接指定して送信を試みる
        return mail($to, $subject, $body, $headers, $params);
    } else {
        // 通常のメール送信
        return mail($to, $subject, $body, $headers);
    }
}

// CORSの設定（本番環境で適切なドメインに変更）
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// POSTリクエストでない場合は処理しない
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// JSONデータの取得
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// 必須フィールドの検証
$required_fields = ['name', 'email', 'subject', 'message', 'privacy'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => '必須項目が入力されていません']);
        exit;
    }
}

// データのサニタイズ
$name = htmlspecialchars($data['name']);
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$phone = isset($data['phone']) ? htmlspecialchars($data['phone']) : '記入なし';
$subject = htmlspecialchars($data['subject']);
$message = htmlspecialchars($data['message']);

// メールの件名によって分岐
$subject_text = '';
switch ($subject) {
    case 'service':
        $subject_text = 'サービスについて';
        break;
    case 'recruitment':
        $subject_text = '採用について';
        break;
    case 'partnership':
        $subject_text = '協業について';
        break;
    case 'other':
        $subject_text = 'その他お問い合わせ';
        break;
    default:
        $subject_text = 'お問い合わせ';
}

// 管理者宛メール本文
$admin_mail_body = <<<EOT
idealjapanサイトからお問い合わせがありました。

【お名前】
{$name}

【メールアドレス】
{$email}

【電話番号】
{$phone}

【お問い合わせ内容】
{$subject_text}

【メッセージ】
{$message}

※このメールは自動送信されています。
※詳細はGoogleスプレッドシートをご確認ください。
EOT;

// ユーザー宛自動返信メール本文
$user_mail_body = <<<EOT
{$name} 様

idealjapan株式会社にお問い合わせいただき、誠にありがとうございます。
下記内容でお問い合わせを受け付けました。
担当者より改めてご連絡いたしますので、今しばらくお待ちください。

【お問い合わせ内容】
{$subject_text}

【メッセージ】
{$message}

---------------------------------------
idealjapan株式会社
〒065-0032
北海道札幌市東区北三十二条東17丁目1番7号
TEL: 011-600-6311
E-mail: info@idealjapan.co.jp
---------------------------------------
EOT;

// メールヘッダー
$admin_headers = "From: info@idealjapan.co.jp\r\n";
$admin_headers .= "Reply-To: {$email}\r\n";
$admin_headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$admin_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$personal_headers = "From: info@idealjapan.co.jp\r\n";
$personal_headers .= "Reply-To: {$email}\r\n";
$personal_headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$personal_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$user_headers = "From: info@idealjapan.co.jp\r\n";
$user_headers .= "Reply-To: info@idealjapan.co.jp\r\n";
$user_headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$user_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// メール送信
$admin_mail_sent = mail(
    'info@idealjapan.co.jp',
    "【お問い合わせ】{$subject_text} - {$name}様より",
    $admin_mail_body,
    $admin_headers
);

// 追加のメール送信（あなた個人のメールアドレスにも送信）
$personal_address = 'tarosukenoblog@gmail.com';
// 個人宛てメール送信用の特別で強化した関数を使用
$personal_mail_sent = send_secondary_mail(
    $personal_address,
    "[個人宛]【お問い合わせ】{$subject_text} - {$name}様より",
    $admin_mail_body,
    $personal_headers
);

// 通常の送信関数による再送信の試行
if (!$personal_mail_sent) {
    error_log("通常の送信関数で再試行");
    $personal_mail_sent = mail(
        $personal_address,
        "[再送信]【お問い合わせ】{$subject_text} - {$name}様より",
        $admin_mail_body,
        $personal_headers
    );
}

// ログに記録
error_log("個人宛てメール送信試行: {$personal_address}");

// ユーザー宛メール送信
$user_mail_sent = mail(
    $email,
    "【idealjapan株式会社】お問い合わせありがとうございます",
    $user_mail_body,
    $user_headers
);

// Googleスプレッドシートに送信
$spreadsheet_success = false;

// Google Apps Scriptのウェブアプリケーション URL
$gas_url = "https://script.google.com/macros/s/AKfycbx-JpvA30kHLtSzNsxs2qU7QmhiIgFPqycsr2k3tpnwlKb28_HujS77hJMJw6GSXeUp/exec";

// 送信データの準備
$post_data = [
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'subject' => $subject,
    'message' => $message
];

// cURLをチェック
if (!function_exists('curl_init')) {
    error_log('cURL is not available on the server');
} else {
    try {
        // cURLセッションの初期化
        $ch = curl_init();
        
        // cURLオプションの設定
        curl_setopt($ch, CURLOPT_URL, $gas_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post_data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        // SSLオプション - 本番環境では有効にすることを推奨
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        
        // タイムアウト設定
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        // cURLの実行
        $response = curl_exec($ch);
        
        // エラーチェック
        if ($response === false) {
            error_log('cURL error: ' . curl_error($ch));
        } else {
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            if ($http_code == 200) {
                $spreadsheet_success = true;
                error_log('Spreadsheet updated successfully');
            } else {
                error_log('Spreadsheet update failed with HTTP code: ' . $http_code);
                error_log('Response: ' . $response);
            }
        }
        
        // cURLセッションの終了
        curl_close($ch);
    } catch (Exception $e) {
        error_log('Exception in cURL request: ' . $e->getMessage());
    }
}

// 送信結果を返す
if ($admin_mail_sent) {
    error_log('Infoメール送信成功');
    error_log('Personalメール送信結果: ' . ($personal_mail_sent ? '成功' : '失敗'));
    error_log('Userメール送信結果: ' . ($user_mail_sent ? '成功' : '失敗'));
    
    http_response_code(200);
    echo json_encode([
        'success' => true, 
        'message' => 'お問い合わせを受け付けました',
        'mail_status' => [
            'admin' => $admin_mail_sent ? 'success' : 'failed',
            'personal' => $personal_mail_sent ? 'success' : 'failed',
            'user' => $user_mail_sent ? 'success' : 'failed'
        ],
        'spreadsheet' => $spreadsheet_success ? 'success' : 'failed',
        'debug_info' => [
            'curl_available' => function_exists('curl_init'),
            'gas_url' => $gas_url,
            'data_sent' => $post_data
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'メール送信に失敗しました']);
}
?>