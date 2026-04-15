<?php
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header('Access-Control-Allow-Origin: ' . ($origin !== '' ? $origin : '*'));
header('Vary: Origin');

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Upload-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode([
    'success' => false,
    'message' => 'Method not allowed'
  ]);
  exit;
}

// Optional token protection. Set this to a secure value on production.
$uploadToken = '';
$incomingToken = isset($_SERVER['HTTP_X_UPLOAD_TOKEN']) ? $_SERVER['HTTP_X_UPLOAD_TOKEN'] : '';
if ($uploadToken !== '' && !hash_equals($uploadToken, $incomingToken)) {
  http_response_code(401);
  echo json_encode([
    'success' => false,
    'message' => 'Unauthorized upload token'
  ]);
  exit;
}

if (!isset($_FILES['cover'])) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'message' => 'Missing file field: cover'
  ]);
  exit;
}

$file = $_FILES['cover'];
if (!is_array($file) || !isset($file['error'], $file['tmp_name'], $file['size'])) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'message' => 'Invalid upload payload'
  ]);
  exit;
}

if ($file['error'] !== UPLOAD_ERR_OK) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'message' => 'Upload error code: ' . $file['error']
  ]);
  exit;
}

$maxBytes = 5 * 1024 * 1024; // 5MB
if ((int)$file['size'] <= 0 || (int)$file['size'] > $maxBytes) {
  http_response_code(413);
  echo json_encode([
    'success' => false,
    'message' => 'File is too large. Max allowed is 5MB.'
  ]);
  exit;
}

$allowedExts = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif'
];

$originalName = isset($file['name']) ? (string)$file['name'] : '';
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExts, true)) {
  http_response_code(415);
  echo json_encode([
    'success' => false,
    'message' => 'Unsupported file type. Use JPG, PNG, WEBP, or GIF.'
  ]);
  exit;
}

$imgInfo = @getimagesize($file['tmp_name']);
if ($imgInfo === false) {
  http_response_code(415);
  echo json_encode([
    'success' => false,
    'message' => 'Invalid image file.'
  ]);
  exit;
}

$postIdRaw = isset($_POST['postId']) ? $_POST['postId'] : 'post';
$postId = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$postIdRaw);
if ($postId === '') {
  $postId = 'post';
}

$titleRaw = isset($_POST['title']) ? $_POST['title'] : '';
$titleSlug = preg_replace('/[^a-zA-Z0-9_-]/', '-', strtolower(trim((string)$titleRaw)));
$titleSlug = preg_replace('/-+/', '-', $titleSlug);
$titleSlug = trim($titleSlug, '-');
if ($titleSlug === '') {
  $titleSlug = 'cover';
}

$uploadDir = __DIR__ . DIRECTORY_SEPARATOR . 'blogs-cover-imgs';
if (!is_dir($uploadDir)) {
  if (!mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
    http_response_code(500);
    echo json_encode([
      'success' => false,
      'message' => 'Could not create upload directory.'
    ]);
    exit;
  }
}

$random = function_exists('random_bytes') ? bin2hex(random_bytes(5)) : substr(md5(uniqid((string)mt_rand(), true)), 0, 10);
$fileName = date('YmdHis') . '-' . $postId . '-' . $titleSlug . '-' . $random . '.' . $ext;
$targetPath = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Failed to save file on server.'
  ]);
  exit;
}

$publicPath = '/blogs-cover-imgs/' . $fileName;
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
$publicUrl = $host !== '' ? ($scheme . '://' . $host . $publicPath) : $publicPath;

echo json_encode([
  'success' => true,
  'message' => 'Upload successful',
  'path' => $publicPath,
  'url' => $publicUrl
]);
