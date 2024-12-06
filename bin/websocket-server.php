<?php
require dirname(__DIR__) . '/vendor/autoload.php';

use Bidspace\BidspaceWebSocketServer;

$server = new BidspaceWebSocketServer();
$server->run();
