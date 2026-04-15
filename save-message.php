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
    echo json_encode(['success' => false, 'error' => 'POST only']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['name']) || !isset($input['email'])) {
    echo json_encode(['success' => false, 'error' => 'Missing name or email']);
    exit;
}

// Read current data
$dataFile = __DIR__ . '/data.json';
$data = ['posts' => [], 'messages' => []];

if (file_exists($dataFile)) {
    $existing = json_decode(file_get_contents($dataFile), true);
    if (is_array($existing)) {
        $data = $existing;
    }
}

if (!isset($data['messages']) || !is_array($data['messages'])) {
    $data['messages'] = [];
}

// Add new message
$message = [
    'id'       => time() . rand(100, 999),
    'name'     => $input['name'],
    'email'    => $input['email'],
    'phone'    => isset($input['phone'])    ? $input['phone']    : '',
    'company'  => isset($input['company'])  ? $input['company']  : '',
    'service'  => isset($input['service'])  ? $input['service']  : '',
    'budget'   => isset($input['budget'])   ? $input['budget']   : '',
    'project'  => isset($input['project'])  ? $input['project']  : '',
    'timeline' => isset($input['timeline']) ? $input['timeline'] : '',
    'notes'    => isset($input['notes'])    ? $input['notes']    : '',
    'source'   => isset($input['source'])   ? $input['source']   : '',
    'message'  => isset($input['message'])  ? $input['message']  : (isset($input['project']) ? $input['project'] : ''),
    'date'     => date('F j, Y'),
    'time'     => date('H:i')
];

array_unshift($data['messages'], $message);

// Save with lock
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

echo json_encode(['success' => true]);
?>
