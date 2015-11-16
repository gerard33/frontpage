sonos a wrapper for PHPSonos
=====

## Introduction 
Forked from [ThomasTr/sonos](https://github.com/ThomasTr/sonos) and changed it a bit.
I use this in combination with Domoticz and my [Frontpage](https://github.com/gerard33/frontpage)

*sonos* is a wrapper arround the php class PHPSonos to control sonos player via urls from a home automation server. 

## Installation 

Checkout repository to a directory of your php enabled webserver (in this case 'sonos'). 

## Configuration 
Configuration is done in config.php. 
Add your zones and favourite Radiostations. 
Config path for messages must be accessible from sonos player. 

Be sure your webserver can write in this directory (here 'sonos'), current playing radiostation is saved in a text file. 

## Usage
Below some examples of what's possible. Kitchen is the zone name you have entered in config.php.
In my config.php I use the IDX number from Domoticz, which makes it possible to change volume and radio stations from my Domoticz frontpage.

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

###Mute
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=Mute 
``` 

###Next radio from list 
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=nextRadio 
``` 

###Previous radio from list 
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=PrevRadio 
``` 

###Media info 
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=GetMediaInfo 
``` 

###Position info 
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=GetPositionInfo 
``` 

###Is Sonos playing? 1=playing, 2=pause, 3=stop 
``` 
http://yourserver/sonos/index.php?zone=kitchen&action=GetTransportInfo 
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

## Credits 

* [Forum users of IP-Symcon]( http://www.ip-symcon.de/forum) for PHPSonos Class 
* [ThomasTr/sonos](https://github.com/ThomasTr/sonos)
