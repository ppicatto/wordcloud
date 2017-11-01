<?php
$str = file_get_contents('http://localhost/wordcloud-master/data/china_fixed.json');

$json = json_decode($str);

var_dump($json);
?>