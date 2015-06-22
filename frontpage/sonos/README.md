sonos a wrapper for PHPSonos
=====

## Introduction 

*sonos* is a wrapper arround the php class PHPSonos to control sonos player via urls from a home automation server. 

## Installation 

Checkout repository to a directory of your php enabled webserver (in this case 'sonos'). 
Download PHPSonos from [here](http://www.ip-symcon.de/forum/threads/14938-br_sonos?p=133623#post133623), extract the file scripts/PHPSonos.inc.php from zip and copy to same directory 

## Configuration 
Configuration is done in config.php. 
Add your zones and favourite Radiostations. 
Config path for messages must be accesible from sonos player. 

Be sure your webserver can write in this directory (here 'sonos'), current playing radiostation is saved in a text file. 

## Usage 
(for url compatibility to my [old script](http://trautner.net/313-sonos-mit-gira-homeserver-steuern) 'action' can also be 'do')

###Play 
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=Play 
``` 

###Stop 
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=Stop 
``` 

###Toggle between play and stop 
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=TogglePlayStop 
``` 

###Volume up / down 
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=VolumeUp
http://yourserver/sonos/index.php?zone=kitchen&action=VolumeDown
``` 
---------------------
---------------------
http://yourserver/sonos/index.php?zone=kitchen&action=GetVolume
http://yourserver/sonos/index.php?zone=kitchen&action=GetMediaInfo
---------------------
---------------------

###Mute
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=Mute 
``` 

###Next radio from list 
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=nextRadio 
``` 

###Play message 
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=sendMessage&messageId=1&volume=20
``` 
Stops current playing radio/list, plays the message 1.mp3, continues previously played radio/list 

``` 
http://yourserver/sonos//index.php?zone=kitchen&action=sendMessage&message=Hello world&volume=55&lang=en
``` 
Stops current playing radio/list, plays the message "Hello world", continues previously played radio/list

## Bugs

None (feel free to write pull requests if you found bugs) 

## To Do

*write tests

## Credits 

* [Forum users of IP-Symcon]( http://www.ip-symcon.de/forum) for PHPSonos Class 
