<?php

$config = array(
	'zones' => array(
                'Kantoor'   => '192.168.1.161',
	),
	'radiostations' => array(
		'DasDing'  => 'swr-mp3-m-dasding.akacast.akamaistream.net/7/588/137139/v1/gnl.akacast.akamaistream.net/swr-mp3-m-dasding',
        '1Live'    => '1live-diggi.akacast.akamaistream.net/7/965/119435/v1/gnl.akacast.akamaistream.net/1live-diggi',
		'538'      => 'vip-icecast.538.lw.triple-it.nl/RADIO538_MP3',
	),
        'messagePath'   	=> '/volume1/web/domoticz/sonos2/spraak/',
        'messageStorePath'   => '/volume1/web/domoticz/sonos2/spraak/',
        'messageLang'   	=> 'nl',
        'currentRadio'  	=> 'currentRadio.txt',
        'filePhpSonos'  	=> 'PHPSonos.inc.php',
        'logging'       	=> false,
        'logfile'       	=> 'log.txt',
);
