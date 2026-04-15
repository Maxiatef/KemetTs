<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'POST only']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON body']);
    exit;
}

$dataFile = __DIR__ . '/data.json';
$data = ['posts' => [], 'messages' => []];

if (file_exists($dataFile)) {
    $existing = json_decode(file_get_contents($dataFile), true);
    if (is_array($existing)) {
        if (isset($existing['posts']) && is_array($existing['posts'])) {
            $data['posts'] = $existing['posts'];
        }
        if (isset($existing['messages']) && is_array($existing['messages'])) {
            $data['messages'] = $existing['messages'];
        }
    }
}

if (isset($input['posts']) && is_array($input['posts'])) {
    $data['posts'] = $input['posts'];
}

if (isset($input['messages']) && is_array($input['messages'])) {
    $data['messages'] = $input['messages'];
}

$fp = fopen($dataFile, 'c+');
if (!$fp) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Unable to open data file']);
    exit;
}

if (!flock($fp, LOCK_EX)) {
    fclose($fp);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Unable to lock data file']);
    exit;
}

ftruncate($fp, 0);
rewind($fp);
$written = fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

if ($written === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Write failed']);
    exit;
}

echo json_encode([
    'success' => true,
    'postsCount' => count($data['posts']),
    'messagesCount' => count($data['messages'])
]);
?>
