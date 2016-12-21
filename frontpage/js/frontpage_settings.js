<!-- Change the text for on/off switches -->
var icon_on = '<img src=icons/on.png>';
var icon_off = '<img src=icons/off.png>';
var txt_on = 'Aan';
var txt_off = 'Uit';
var txt_zonon = 'Uit'; <!-- Dicht -->
var txt_zonoff = 'In'; <!-- Open -->
var txt_zonstopped = 'Gestopt';
var txt_zonstop = '| |';
<!-- var txt_dim_plus = ' + '; -->
<!-- var txt_dim_min = ' - '; -->

<!-- Change the text displayed in PopUps -->
var txt_switch_protected = '\'Schakelaar is beveiligd\'';
var txt_switch_on = '\'Inschakelen\'';
var txt_switch_off = '\'Uitschakelen\'';
var txt_blind_up = '\'Zonnescherm uit\'';
var txt_blind_down = '\'Zonnescherm in\'';
var txt_blind_stop = '\'Zonnescherm stoppen\'';

var vplusmin_type_presence = 7;
var txt_presence_home = 'Thuis';
var txt_presence_away = 'Weg';

var vplusmin_type_contact = 8;
var txt_contact_open = 'Open';
var txt_contact_closed = 'Dicht';

<!-- Change the timeout of the PopUp -->
var switch_protected_timeout = '1500';
var switch_on_timeout = '1500';
var switch_off_timeout = '1500';
var camera_doorbell_timeout = '15400';

<!-- Value for ZWave dimmer when on-->
var idx_zdimmer = '171';
var z_dimmer = '';
var z_whichdimmer = '';
//var o_dimmer = '80'; //value 80 is for light in garden
//var o_whichdimmer = '';

<!-- Set values so colors can change -->
var temp_freeze = '0';
var temp_freeze_color = ';color:#0090ff;';
var humidity_max = '70';
var humidity_max_color = ';color:#0090ff;';
var color_on = ';color:#1B9772;';
var color_off = ';color:#E24E2A;';
var show_sonos_volume = true; <!-- show Sonos volume in desc text -->

<!-- Change idx of special items -->
var idx_FibaroWP = '1100';
var idx_Alarm = '11109';
var idx_BewegingF = '145';
var idx_ZonV = '110';
var idx_ZonA = '111';
var idx_Pi = '218';
var idx_PC = '216';
var idx_TV = '240';

var idx_water_meter = '1100';
var idx_doorbell = '1100';

var IsNight = false;
var pageRefreshTime = 8000;

<!-- Text for vdesc -->
var desc_alarm_off = 'Alarm uit';
var desc_alarm_home = 'Alarm aan (thuis)';
var desc_alarm_away = 'Alarm aan (weg)';
var desc_sunrise = 'Zon op';
var desc_sunset = 'Zon onder';
var desc_showsunboth = ''; // used to show sunrise and sunset in vdesc
var txt_sunboth='';
var txt_sunset='Zon onder';
var txt_sunrise='Zon op';
var var_sunrise='';
var var_sunset='';
var desc_protected = '<img src=icons/lock-closed_w.png align=right style="margin:1.5px 3px 0px -10px">'; //shows lock picture if device is protected or when plusmin is 4

<!-- This triggers the camera PopUp when the doorbell is pressed -->
<!-- Text could be 'On', 'Group On' or 'Chime' -->
var doorbell_status = 'On';
var idx_doorbell = '200'; //dummy switch which goes on when doorbell rings, goes off after 10 seconds
var doorbell_cmd = "lightbox_open('camera1', 15400);"

// ############################################################################################################
// #### vvvvv   USER VALUES below vvvvv   #######
// ############################################################################################################

$(document).ready(function() {
    $.roomplan = 2; // define roomplan in Domoticz and create items below, don't use roomplan = 0, it will get all your devices, which might slow down domoticz.
    $.domoticzurl = "http://192.168.1.49:8080";

    // format: idx, value, label, description,
    // lastseen(1 when lastseen is wanted, 2 is only time),
    // plusmin button or protected (0 for empty, 1 for buttons, 2 for volume of Sonos, 4 for protected, 5 for zwave dimmer, 6 for protected when on, 7 for presence, 8 for open/closed),
    // [override css], [alarm value]
    $.PageArray = [
        ['0', 'Desc',               'cell1',    'Buiten', '0', '0'], //Desc means show the sub cells
        ['805', 'Temp',             'cell1a',   'Buiten', '1', '0'], //Lastseen only from cell_a possible
        ['805', 'Humidity',         'cell1b',   'Buiten', '0', '0'],
        ['0', 'Desc',               'cell2',    'Badkamer', '0', '0'],
        ['2475', 'Temp',             'cell2a',   'Badkamer', '1', '0'],
        ['2475', 'Humidity',         'cell2b',   'Badkamer', '0', '0'],
        ['12', 'ForecastStr',       'cell3',    'Woonkamer', '0', '0'],
        ['0', 'Desc',               'cell4',    'Schuurtje', '0', '0'],
        ['2503', 'Temp',             'cell4a',   'Schuurtje', '1', '0'],
        ['2503', 'Humidity',         'cell4b',   'Schuurtje', '0', '0'],
        ['0', 'Desc',               'cell5',    'Boven','0', '0'],
        ['2477', 'Temp',             'cell5a',   'Boven','1', '0'],
        ['2477', 'Humidity',         'cell5b',   'Boven','0', '0'],

        ['1009', 'Status',          'cell6',    'AppleTV XBMC', '1', '1'],
        ['371', 'Status',           'cell7',    'Verlichting Links', '1', '1'],
        ['447', 'Temp',             'cell8',    'Woonkamer', '1', '0'],
        ['319', 'Status',           'cell9',    'Verlichting Rechts','1','1'],
        ['372', 'Status',           'cell10',   'AppleTV 3','1','1'], //6 is protected when on

        ['934', 'Status',           'cell11',   'ESP Boven','1', 0],
        ['1117', 'Status',          'cell12',   'Deurbel','1', 0],
        ['503', 'Status',           'cell13',   'Status Receiver','1', 0],
        ['330', 'Status',           'cell14',   'Status TV','1', 0],
        //Level using for ZWave dimmer, vplusmin = 5 to start with level from z_dimmer
        //['177', 'Status',         'cell15',   'Tuin','1','0'],
        ['1012', 'Status',           'cell15',   'TV', 1, 1],

        ['616', 'CounterToday',     'cell16',   'Vandaag','1','0'],
        ['616', 'Usage',            'cell17',   'Huidig gebruik','1','0'],
        //['0', 'Desc',             'cell18',   'Windrichting','0','0'],
        ['13', 'DirectionStr',      'cell18',   'Windrichting','0','0'],
        //['13', 'DirectionStr',    'cell18b',  'Windrichting','0','0'],
        //['10', 'Status',          'cell18',   'iPhone 5s','1','4'],
        ['406', 'Usage',            'cell19',   'Windmolen nu','1','0'],
        ['406', 'CounterToday',     'cell20',   'Windmolen vandaag','1','0'],

        ['1006', 'Status',          'cell21',   'Receiver boven','1', 1],
        ['0', 'Tijd',               'cell22',   'Tijd','0','0'],
        ['1003', 'Status',          'cell23',   'Buitenverlichting','1','1'],

        ['0', 'Temp',               'cell25',   'Temperatuur buiten (C)','0','0'],

        ['0', 'SunBoth',            'cell26',   'Dummy cel voor bepaling zon op en zon onder','0','0'],

        ['37', 'Status',            'cell00',   'IsDonker','0','0'],

        // Page 2
        ['0', 'Desc',               'cell2_1',  'Zon','0','0'],
        ['0', 'SunRise',            'cell2_1a', 'Zon op','1','0'],
        ['0', 'SunSet',             'cell2_1b', 'Zon onder','0','0'],
        ['0', 'Desc',               'cell2_2',  'Windrichting','0','0'],
        ['100', 'Data',             'cell2_2a', 'Windrichting','1','0'],
        ['101', 'Data',             'cell2_2b', 'Windsnelheid','0','0'],
        //['49','ForecastStr',      'cell2_3',  'Weersvoorspelling','0','0'],
        ['0', 'ForecastStr',        'cell2_3',  'Weersvoorspelling','0','0'],
        ['0', 'Desc',               'cell2_4',  'NAS CPU + HDD','0','0'],
        //['17','Data',             'cell2_4a', 'CPU','1','0'],
        //['13','Data',             'cell2_4b', 'HDD','0','0'],
        ['0', 'Desc',               'cell2_5',  'Temp + Lux F','1','0'],
        ['154', 'Data',             'cell2_5a', 'Temperatuur Fibaro','1','0'],
        ['147', 'Data',             'cell2_5b', 'Temperatuur Fibaro','1','0'],

        ['935', 'Status',               'cell2_6',  'RPi Zolder', 1 , 0],
        ['936', 'Status',            'cell2_7',  'RPi Meterkast', 1, 0], //vplusmin_type_contact],
        //['145','Data',            'cell2_8',  'Bewegingssensor F','1','4'],
        ['8', 'Data',               'cell2_8',  'HDD /','1','0', '', 20],
        ['10', 'Data',              'cell2_9',  'CPU Usage','1','0', 'border: 1px;', 10],
        ['33', 'Status',            'cell2_10', 'Led zolder','1','0'],

        ['12', 'Barometer',         'cell2_11', 'Barometer','1','0'],
        ['13', 'Speed',             'cell2_12', 'Windsnelheid','1','0'],
        ['902', 'Visibility',       'cell2_13', 'Zicht','1','0'],
        ['446', 'Data',             'cell2_14', 'Lux','1','0'],
        ['0', 'SunBoth',            'cell2_15', 'SunBoth','1','4'],

        ['616', 'Data',             'cell2_16', 'Verbruik - huidig','1','0'],
        ['139', 'Status',           'cell2_17', 'Droger','1','0'],
        ['218', 'Status',           'cell2_18', 'Raspberry Pi','1','4'],
        ['141', 'Status',           'cell2_19', 'IJskast','1','0'],
        ['142', 'Data',             'cell2_20', 'IJskast - huidig','1','0'],

        ['182', 'Data',             'cell2_21', 'Droger - totaal','1','0'], //CounterToday, Usage
        ['0', 'Tijd',               'cell2_22', 'Tijd','0','0'],
        ['181', 'Data',             'cell2_23', 'IJskast - totaal','1','0'],
        ['0', 'ForecastStr',        'cell2_25', 'Weersvoorspelling (FC)','0','0'],
    ];
    $.PageArray_Scenes = [
    //['5','Status',        'cell9',    'Lampen kamer','1','0'],
    // ['7','Status',        'cell13',   'Lamp achtertuin','1','0'],
    ];

// ############################################################################################################
// #### ^^^^^   USER VALUES above ^^^^^   #######
// ############################################################################################################

    RefreshData();
});


