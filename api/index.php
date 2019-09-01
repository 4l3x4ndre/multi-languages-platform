<?php

//header('Access-Control-Allow-Origin: http://localhost:9000/');
$allowedOrigins = array(
    '(http(s)://)?(test\.lan|localhost)(:9000)?'
);
if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] != '') {
    foreach ($allowedOrigins as $allowedOrigin) {
      if (preg_match('#' . $allowedOrigin . '#', $_SERVER['HTTP_ORIGIN'])) {
        header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
        header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
        header('Access-Control-Max-Age: 1000');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        break;
      }
    }
  }

header('Content-type: application/json');

$content = trim(file_get_contents('php://input'));
$decoded = json_decode($content, true);

$mysqli = mysqli_connect("localhost", "alexandre", "thor", "labase");


// On recherche un user avec un login & pw reçus dans l'input
$sql_name= "SELECT * FROM users WHERE login = '".$decoded['name']."' AND pw = '".$decoded['pw']."';";
$result = $mysqli->query($sql_name);

// en fonction du result de la requête mySql, on renvoit:
if ($result->num_rows === 1) {
    echo '{"result": "got user"}';
} else {
    echo '{"result": "none"}';
}
