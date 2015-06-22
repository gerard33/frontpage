<?php

$config = array(
	'zones' => array(
                '115'   => '192.168.1.161', /* Kantoor */
				'116'   => '192.168.1.196', /* Keuken */
	),
	'radiostations' => array(
		'DasDing'  => 'swr-mp3-m-dasding.akacast.akamaistream.net/7/588/137139/v1/gnl.akacast.akamaistream.net/swr-mp3-m-dasding',
        '1Live'    => '1live-diggi.akacast.akamaistream.net/7/965/119435/v1/gnl.akacast.akamaistream.net/1live-diggi',
		'538'      => 'vip-icecast.538.lw.triple-it.nl/RADIO538_MP3',
	),
        'messagePath'   	=> 'spraak/',
        'messageStorePath'   => 'spraak/',
        'messageLang'   	=> 'nl',
        'currentRadio'  	=> 'currentRadio.txt',
        'filePhpSonos'  	=> 'PHPSonos.inc.php',
        'logging'       	=> false,
        'logfile'       	=> 'log.txt',
);
