<?php
namespace Bidspace;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\App;

class AuctionHandler implements MessageComponentInterface {
    private $clients;
    private $auction_rooms;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->auction_rooms = [];
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);
        
        switch($data['type']) {
            case 'join_auction':
                $auction_id = $data['auction_id'];
                if (!isset($this->auction_rooms[$auction_id])) {
                    $this->auction_rooms[$auction_id] = new \SplObjectStorage;
                }
                $this->auction_rooms[$auction_id]->attach($from);
                break;

            case 'new_bid':
                $auction_id = $data['auction_id'];
                if (isset($this->auction_rooms[$auction_id])) {
                    foreach ($this->auction_rooms[$auction_id] as $client) {
                        if ($from !== $client) {
                            $client->send(json_encode([
                                'type' => 'bid_update',
                                'data' => $data['bid']
                            ]));
                        }
                    }
                }
                break;
        }
    }

    public function onClose(ConnectionInterface $conn) {
        foreach ($this->auction_rooms as $auction_id => $room) {
            $room->detach($conn);
        }
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }
}

class BidspaceWebSocketServer {
    private $server;

    public function __construct() {
        $this->server = new App(
            'localhost',
            8080,
            '0.0.0.0'
        );

        $this->server->route('/auction', new AuctionHandler());
    }

    public function run() {
        $this->server->run();
    }
}
