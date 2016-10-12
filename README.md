## Domoticz Frontpage

See http://www.domoticz.com/forum/viewtopic.php?f=8&t=4698.

## Screenshot
page 1 (day)
![Alt text](/screenshot/frontpage_new.png "Frontpage night (page 1)")
page 1 (night)
![Alt text](/screenshot/frontpage-night.jpg "Frontpage night (page 1)")
page 2 (day)
![Alt text](/screenshot/frontpage-day.jpg "Frontpage day (page 2)")

## Introduction

Setting up the frontpage requires some time. Please take a good look at the forum topic mentioned above and the (high level) instructions below.
It will take some time and a lot of trial and error but it is definitely worth it!

## Installation instructions when using domoticz www folder
1) copy the files from the frontpage map to domoticz/www so the frontpage.html and the subfolders file needs to be in domoticz/www

2) edit settings.js
   
2a) edit url of domoticz
   
2b) edit switches (idx, descriptions, etc)

## Installation instructions when using webserver (eg Synology)
1) copy the complete frontpage folder to /volume1/web

2) edit settings.js

2a) edit url of domoticz
   
2b) edit switches (idx, descriptions, etc)

## If you have a Sonos
1) Add the Sonos as a dummy switch in Domoticz

2) Check the idx of this switch

3) In the On command of the switch place: http://yourip/folder/frontpage/sonos/index.php?zone=IDX&action=Play (change IDX with the idx of your Sonos in Domoticz)

4) In the Off command of the switch place: http://yourip/folder/frontpage/sonos/index.php?zone=IDX&action=Stop (change IDX with the idx of your Sonos in Domoticz)

5) Edit config.php in sonos folder, fill in the idx and the ip address

6) Volume of Sonos can also be changed via the frontpage, in the settings.js file set the plusmin button to value 2 (see the example)
