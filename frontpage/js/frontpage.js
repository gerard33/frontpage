<!-- Javascript for Domoticz frontpage -->
<!-- Create popup -->
function lightbox_open(id, timeout, txt)
{
    window.scrollTo(0, 0);
    if (typeof txt != 'undefined') {
        $('#popup_' + id).html('<div>' + txt + '</div>');
    }
    $('#popup_' + id).fadeIn('fast');
    $('#fade').fadeIn('fast');
    return setTimeout(function() {
        lightbox_close(id);
    }, timeout);
}
<!-- Close popup -->
function lightbox_close(id)
{
    $('#popup_' + id).fadeOut('fast');
    $('#fade').fadeOut('fast');
}

function stringpad (string, maxlength)
{
    string = string.toString();
    return string.length < maxlength ? stringpad("0" + string, maxlength) : string;
}

<!-- Main Frontpage function -->
function RefreshData()
{
    clearInterval($.refreshTimer);

    var jurl = $.domoticzurl + "/json.htm?type=devices&plan=" + $.roomplan + "&jsoncallback=?";
    $.getJSON(jurl,
    {
       format: "json"
    },
    function(data) {
        if (typeof data.Sunrise != 'undefined') {
            var_sunrise = data.Sunrise.substring(0, 5);
        }
        if (typeof data.Sunset != 'undefined') {
            var_sunset = data.Sunset.substring(0, 5);
        }
        var today = new Date();
        var theCurrentTime = stringpad(today.getHours(), 2) + ":" + stringpad(today.getMinutes(), 2);
        if (theCurrentTime > var_sunrise && theCurrentTime < var_sunset) {
            document.getElementById('dark-styles').disabled  = true;
            IsNight = false;
        } else {
            document.getElementById('dark-styles').disabled  = false;
            IsNight = true;
        }

        if (typeof data.result != 'undefined') {
            $.each(data.result, function(i, item) {
                for (var ii = 0, len = $.PageArray.length; ii < len; ii++) {
                    if ($.PageArray[ii][0] === item.idx) {      // Domoticz idx number
                        var vtype = $.PageArray[ii][1];         // Domoticz type (like Temp, Humidity)
                        var vlabel = $.PageArray[ii][2];        // cell number from HTML layout
                        var vdesc = $.PageArray[ii][3];         // description
                        var lastseen = $.PageArray[ii][4];      // Display lastseen or not
                        var vplusmin = $.PageArray[ii][5];      // minplus buttons
                        var vattr = $.PageArray[ii][6] || '';   // extra css attributes
                        var valarm = $.PageArray[ii][7];        // alarm value to turn text to red
                        var vdata = item[vtype];                // current value
                        var vstatus = item["Status"];           // current status
                        var vls = item["LastUpdate"];           // Last Seen
                        var vdataSuffix = '';                   // The extra info after the raw value (%, W, kWh, Lux...)
                        var lastSeenArray = getLastSeen(item["LastUpdate"]);
                        var vdate = '';

                        //Added by GZ used for last seen to only show day if <> today
                        var thisday = (new Date()).toISOString().slice(0,10);

                        var vdimmercurrent = item["LevelInt"];	// What is the dim level int
                        var vdimmervalue = item["Level"];		// What is the dim level
                        if (typeof vdata == 'undefined') {
                            vdata = "?!";
                            vdata = item.idx;
                        } else {
                            // remove too much text
                            vdata = new String(vdata).split(" Level:",1)[0];
                            vdata = new String(vdata).replace("Set","On");
                            vdata = new String(vdata).split("m3",1)[0];
                            vdata = new String(vdata).replace("true","protected");
                            //Added by GZ to only show date if <> today, see below
                            vdate = new String(vls).split(" ",2)[0];
                        }

                        alarmcss='';

                        //Check whether we want to add the last seen to the block
                        if (lastseen == '1') {
                            if (thisday == vdate) {
                                $('#ls_' + vlabel).html(lastSeenArray["time"]);                                 // Show only the time if last change date = today
                            } else {
                                $('#ls_' + vlabel).html(lastSeenArray["time"] + ' | ' + lastSeenArray["date"]); // Change this 'Last Seen' into something you like
                            }
                        } else if (lastseen == '2') {
                            $('#ls_' + vlabel).html(lastSeenArray["time"]);// Show only the time
                        }

                        //switch layout cell
                        //if (vplusmin > 0) { //layout cell, percentage font-size was 80%
                        //    if (vstatus == 'Off') {
                        //        alarmcss = color_off;
                        //        vdata = txt_off; //show text from frontpage_settings
                        //    } else {
                        //        alarmcss = color_on;
                        //        vdata = txt_on; //show text from frontpage_settings
                        //    }
                        //}

                        //alarmcss=';background-image:url(\'../icons/' + vdata + 'dimmer.png\');background-repeat:no-repeat;background-position:50%25%;color:#08c5e3;font-size:0%;vertical-align:top;';

                        //Dimmer
                        if(vtype == 'Level' && item.SwitchType == 'Dimmer') {
                            var min = '';
                            if(vplusmin > 0 && vplusmin !=2 && vplusmin !=4) {
                                if (vdata == txt_off) {
                                    if(vplusmin == 1) { //Normal dimmer
                                        var hlp = '<span onclick="SwitchToggle('+item.idx+',\'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_switch_on+')"; style='+alarmcss+'>'+ vdata+'</span>';
                                    }
                                    if(vplusmin == 5) { //Set ZWave dimmer on certain value from frontpage_settings
                                        z_dimmer = '40';
                                        var hlp = '<span onclick="SwitchDimmer('+item.idx+', '+z_dimmer+');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_switch_on+')"; style='+alarmcss+'>'+ vdata+'</span>';
                                        //var hlp = '<span onclick="SwitchToggle('+item.idx+',\'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_switch_on+')"; style='+alarmcss+'>'+ vdata+'</span>';
                                        //End ZWave dimmer
                                    }
                                    //var plus = "<img src=icons/up_off.png align=right vspace=12 onclick=ChangeStatus('plus',txt_off," + item.idx + ","+ vdimmercurrent+")>"; //align=right replaced by hspace and vspace
                                    //var min = "<img src=icons/down_off.png align=left vspace=12 onclick=ChangeStatus('min',txt_off," + item.idx + ","+ vdimmercurrent+")>" //allign=left
                                    var plus = ""; //no buttons when switch is off
                                    var min = ""; //no buttons when switch is off
                                }
                                else if(vplusmin !=2 && vplusmin !=4) {
                                    if (item.MaxDimLevel == 100) {
                                            //For ZWave dimmer
                                            if(vplusmin == 5 && item.idx == idx_zdimmer) { //compare idx_zdimmer with z_whichdimmer if there are more zdimmers
                                                //vdata = z_dimmer;
                                                vdimmervalue = Math.round(vdimmervalue / 10)*10; //round to ten
                                                if(z_dimmer == '') {                    //when starting the frontpage
                                                    vdata = vdimmervalue;               //show current dim value
                                                } else if (z_dimmer != vdimmervalue) {  //when dimmer is changed
                                                        vdata = z_dimmer;
                                                        z_dimmer = vdimmervalue;
                                                } else {
                                                    vdata = z_dimmer;
                                                }
                                                var hlp = '<span onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_switch_off+')"; style='+alarmcss+'>'+ vdata+'</span>';
                                                var plus = "<img src=icons/up.png align=right vspace=12 onclick=ZWaveDim('plus'," + vdata + "," + item.idx + ")>";
                                                var min = "<img src=icons/down.png align=left vspace=12 onclick=ZWaveDim('min'," + vdata + "," + item.idx + ")>";
                                            }
                                            else {
                                                vdimmervalue = Math.round(vdimmervalue / 10) * 10; //round to ten
                                                vdata = vdimmervalue; //show current dim value
                                                var hlp = '<span onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_switch_off+')"; style='+alarmcss+'>'+ vdata+'</span>';
                                                var plus = "<img src=icons/up.png align=right vspace=12 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
                                                var min = "<img src=icons/down.png align=left vspace=12 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
                                            }
                                    } else {
                                        //vdata2 = vdimmervalue; //used for ChangeStatus
                                        //vdimmervalue = Math.round(vdimmervalue / 5)*5; //round to ten
                                        vdata = vdimmervalue; //show current dim value
                                        var hlp = '<span onclick="SwitchToggle('+item.idx+',\'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_switch_off+')"; style='+alarmcss+'>'+ vdata+'</span>';
                                        var plus = "<img src=icons/up.png align=right vspace=12 onclick=ChangeStatus('plus'," + vdata + "," + item.idx + ","+ vdimmercurrent+")>"; //align=right replaced by hspace and vspace
                                        var min = "<img src=icons/down.png align=left vspace=12 onclick=ChangeStatus('min'," + vdata + "," + item.idx + ","+ vdimmercurrent+")>" //align=left
                                    }
                                }
                            }
                            vdata = min.concat(hlp,plus);
                            //console.log(vdata);
                        }

                        //Volume Sonos
                        if(vplusmin == 2) {
                            if (vdata == txt_off) {
                                //var hlp = '<span onclick="SwitchToggle('+item.idx+',\'On\')"; style='+alarmcss+'>'+ vdata+'</span>';
                                var hlp = '<span onclick="SwitchToggle('+item.idx+',\'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_switch_on+')"; style='+alarmcss+'>'+ vdata+'</span>';
                                var plus = ""; //no volume up when Sonos is off
                                var min = ""; //no volume down when Sonos is off
                            }
                            else { //if(vplusmin == 2) {
                                vdata = txt_on // added to get the right on txt
                                //var hlp = '<span onclick="SwitchToggle('+item.idx+',\'Off\')"; style='+alarmcss+'>'+ vdata+'</span>';
                                var hlp = '<span onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_switch_off+')"; style='+alarmcss+'>'+ vdata+'</span>';
                                var plus = "<img src=icons/up.png align=right vspace=12 onclick=ChangeVolumeUp(" + item.idx + ")>";		//volume up when Sonos is on
                                var min = "<img src=icons/down.png align=left vspace=12 onclick=ChangeVolumeDown(" + item.idx + ")>"	//volume down when Sonos is on
                                if(show_sonos_volume == true) { //get volume of sonos to show in desc text when frontpage_setting is set true
                                    //function to change value, because <PRE></PRE> are added from Sonos index.php page
                                    function myTrim(x) {
                                        //return x.replace(/^\s+|\s+$/gm,'');			//trim spaces
                                        var trimpart = /<PRE>|<\/PRE>/g;
                                        return x.replace(trimpart,'');
                                    }
                                    var vs1 = myTrim(VolumeSonos(item.idx));			//show volume
                                    var vs2 = myTrim(MediaInfoSonos(item.idx));			//show what's playing - radio
                                    var vs3 = myTrim(PositionInfoSonos(item.idx));		//show what's playing - albums
                                    var vs2 = JSON.parse(vs2);							//show what's playing to array
                                    var vs3 = JSON.parse(vs3);							//show what's playing to array
                                    //if music from other source is played
                                    if (vs2.title ==  undefined || vs2.title == "") {
                                        //vs3.album = vs3.album.substring(0, 22);		//show only first characters to fit screen
                                        if (vs3.album == "") {
                                            vs3.album = "Onbekend";
                                        }
                                        if (vs3.title == "") {
                                            vs3.title = "Onbekend";
                                        }
                                        vs2.title = vs3.artist + " |  " + vs3.album;		//show album name and track
                                        vs2.title = vs2.title.substring(0, 26);				//show only first characters to fit screen
                                        vs3.streamContent = "#" + vs3.albumTrackNumber + ": " + vs3.title;	//show number and song
                                        vs3.streamContent = vs3.streamContent.substring(0, 34);				//show only first characters to fit screen
                                        //show left right buttons to zap in songs
                                        var previous = '<span style="font-size: 20px; width: 15px; z-index: 1000; float: left" onclick="ChangePreviousSong('+item.idx+');"><a href="#">&lt;</a></span>';
                                        var next = '<span style="font-size: 20px; width: 15px; z-index: 1000; float: right" onclick="ChangeNextSong('+item.idx+');"><a href="#">&gt;</a></span>';
                                        var info = previous + vs2.title + next;
                                        info = info + "<br/>" + '<span style="font-size: 80%; font-style: italic; display: block; line-height: 90%">' + vs3.streamContent + '</span>'; //margin-top: -3px
                                        $('#ls_'+vlabel).html(info);						//show song in label
                                    //if radio is played
                                    } else {
                                        vs2.title = vs2.title.substring(0, 26);				//show only first characters to fit screen
                                        if( vs3.streamContent.indexOf('ZPSTR') >= 0){		//data is being loaded, show nothing
                                            vs3.streamContent = '';
                                        }
                                        vs3.streamContent = vs3.streamContent.substring(0, 34);	//show only first characters to fit screen
                                        //var info = vs2.title + "<br/>" + vs3.streamContent;
                                        //show left right buttons to zap radio channels
                                        var previous = '<span style="font-size: 20px; width: 15px; z-index: 1000; float: left" onclick="ChangeRadioPrev('+item.idx+');"><a href="#">&lt;</a></span>';
                                        var next = '<span style="font-size: 20px; width: 15px; z-index: 1000; float: right" onclick="ChangeRadio('+item.idx+');"><a href="#">&gt;</a></span>';
                                        var info = previous + vs2.title + next;
                                        info = info + "<br/>" + '<span style="font-size: 80%; font-style: italic; display: block; line-height: 90%">' + vs3.streamContent + '</span>'; //margin-top: -3px
                                        $('#ls_'+vlabel).html(info);						//show radio in label
                                        //$('#ls_'+vlabel).html(vs2.title);					//show radio in label
                                        //$('#ls_'+vlabel).html(vs3.streamContent);			//show what's playing in label
                                    }
                                    vdesc = vdesc + " | " + vs1;						//show volume in desc text when Sonos is on
                                }
                            }
                            vdata = min.concat(hlp, plus);
                            //console.log(vdata);
                        }

                        switch (item.SwitchType) {
                            //Push On gives wrong(undesired) status
                            case "Push On Button":
                                vdata = 'Off'
                            case "Motion Sensor":
                            case "Contact":
                            case "Door Lock":
                                switchclick = '';
                                if (vplusmin == vplusmin_type_presence) {
                                    if (vdata == txt_on) {
                                        vdata = txt_presence_home;
                                    } else {
                                        vdata = txt_presence_away;
                                    }
                                }
                                if (vplusmin == vplusmin_type_contact) {
                                    if (vdata == txt_on) {
                                        vdata = txt_contact_open;
                                    } else {
                                        vdata = txt_contact_closed;
                                    }
                                }
                                break;
                            case "Doorbell":
                                if (item.Data.substr(0, 2) == doorbell_status) {
                                    //lightbox_open('camera1', 15400);
                                    vdata = "Tringgg";
                                    //vdesc=new String(vdesc).replace( "Deurbel", "Deurbel");
                                } else {
                                    vdata = item.Data;
                                }
                                break;
                            case "On/Off":
                                switchclick='';
                                if (vplusmin == 0) {
                                    if (vstatus == 'Off') {
                                        alarmcss = color_off;
                                        vdata = txt_off; //show text from frontpage_settings
                                    } else {
                                        alarmcss = color_on;
                                        vdata = txt_on; //show text from frontpage_settings
                                    }
                                }
                                if (vdata == 'Off') {
                                    switchclick = 'onclick="SwitchToggle('+ item.idx +', \'On\');lightbox_open(\'switch\', ' + switch_on_timeout + ', ' + txt_switch_on + ')"';
                                    alarmcss = color_off;
                                    vdata = icon_off;
                                } else if (vdata == 'On') {
                                    switchclick = 'onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', ' + switch_off_timeout + ', ' + txt_switch_off + ')"';
                                    alarmcss = color_on;
                                    vdata = icon_on;
                                }
                                if (item.Protected == true || vplusmin == 4) {
                                    vdesc = vdesc + desc_protected;
                                    switchclick = 'onClick="lightbox_open(\'protected\', ' + switch_protected_timeout + ', ' + txt_switch_protected + ');"';
                                }
                                break;

                            case "Blinds":
                                var hlp = '<img src=icons/sun_stop_d.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
                                if(IsNight) {
                                    var hlp = '<img src=icons/sun_stop_n.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
                                }

                                if(vdata == 'Closed') {
                                    var up = '<img src=icons/sun_up_off.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
                                    var down = '<img src=icons/sun_down_on.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
                                    vdesc = vdesc + " | " + txt_zonon; //Change description text
                                }
                                if (vdata == 'Open') {
                                    var up = '<img src=icons/sun_up_on.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
                                    var down = '<img src=icons/sun_down_off.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
                                    vdesc = vdesc + " | " + txt_zonoff; //Change description text
                                }
                                if (vdata == 'Stopped') {
                                    var up = '<img src=icons/sun_up_off.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
                                    var down = '<img src=icons/sun_down_on.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
                                    vdesc = vdesc + " | " + txt_zonstopped; //Change description text
                                }
                                vdata = down.concat(hlp, up);
                                break;

                            case "Blinds Inverted":
                                if(vdata == 'Closed') {
                                    var down = '<img src='+$.domoticzurl+'/images/blinds48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_down+')">';
                                    var up = '<img src='+$.domoticzurl+'/images/blindsopen48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_up+')">';
                                }
                                if (vdata == 'Open') {
                                    var down = '<img src='+$.domoticzurl+'/images/blinds48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_down+')">';
                                    var up = '<img src='+$.domoticzurl+'/images/blindsopen48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_up+')">';
                                }
                                vdata = down.concat(up);
                                break;

                            case "Blinds Percentage":
                            case "Blinds Percentage Inverted":
                                var plus = "<img src=icons/up.png  vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('plus'," + item.LevelInt + "," + item.idx + ")>";
                                var min = "<img src=icons/down.png  vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('min'," + item.LevelInt + "," + item.idx + ")>";

                                var iconClosed = '/images/blinds48.png';
                                var iconOpen = '/images/blindsopen48sel.png';
                                if (item.Status == 'Closed') {
                                    iconClosed = '/images/blinds48sel.png';
                                    iconOpen = '/images/blindsopen48.png';
                                }

                                var downAction = 'On';
                                var upAction = 'Off';
                                if (item.SwitchType == "Blinds Percentage Inverted") {
                                    downAction = 'Off';
                                    upAction = 'On';
                                }

                                var down = '<img src=' + $.domoticzurl + iconClosed + ' hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'' + downAction + '\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
                                var up = '<img src=' + $.domoticzurl + iconOpen + ' hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'' + upAction + '\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';

                                vdesc = new String(vdesc).replace(vdesc, vdesc + "<span style='color:#1B9772;font-size:20px;'> " + item.Level + "&#37;</span>");
                                vdata = min.concat(down, up, plus);
                                break;
                        }

                        switch (item.idx) {
                            case idx_BewegingF:
                                if(vdata == 'On,'){
                                    vdata = new String(vdata).replace(",", "");
                                    vdata = new String(vdata).replace("On", "Aan");
                                }
                                break;
                            case idx_FibaroWP:
                                vdata = Math.round(vdata * 100) / 100;
                                if (vdata > 40) {
                                    vdata = '<img src=icons/pump_on.png>';
                                    alarmcss = color_on;
                                } else if (vdata < 40 && vdata > 0.9) {
                                    vdata = '<img src=icons/pump_off.png>';
                                    alarmcss = color_off;
                                }
                                break;

                            case idx_ZonV:
                            case idx_ZonA:
                                //change text of blinds, placed after switch code above, otherwise is is not clickable
                                if (vdata == txt_on){ //txt_on from frontpage settings
                                    vdata = txt_zonon;
                                    alarmcss = color_on;
                                } else if (vdata == txt_off){ //txt_off from frontpage settings
                                    vdata = txt_zonoff;
                                    alarmcss=color_off;
                                }
                                break;
                        }

                        switch (item.SubType) {
                            case "Percentage":
                                vdata = new String(vdata).split("%",1)[0];
                                vdata = Math.round(vdata);
                                vdataSuffix = "<sup class='subscript'> %</sup>";

                                break;
                            case "Lux":
                                vdata = new String(vdata).replace("Lux", "");
                                vdataSuffix = "<sup class='subscript'>Lux</sup>";
                                break;
                        }

                        // set alarm icons
                        if (item.idx == idx_Alarm) {
                            switch (vdata) {
                                case "Arm Away":
                                    vdesc = desc_alarm_away;
                                    icon = "alarm_away.png";
                                    break;

                                case "Arm Home":
                                    vdesc = desc_alarm_home;
                                    icon = "alarm_away.png";
                                    break;

                                case "Normal":
                                    vdesc = desc_alarm_off;
                                    icon = "alarm_away.png";
                                    break;
                            }
                            if (!IsNight) {
                                icon = icon.replace(".png", "_w.png");
                            }
                            vdata = "<a class='iframe' href='secpanel/index.html'><img src='icons/" + icon + "' vspace='6'></a>";
                        }

                        // set alarm icons when using on off
                        //if(item.idx == idx_Alarm && vdata == 'Off'){
                        //	vdata=new String(vdata).replace( "Off","<a class=iframe href=secpanel/index.html><img src=icons/alarm_off.png vspace=6></a>");
                        //	vdesc=desc_alarm_off; // Replace text from bottom with text from settings file
                        //}
                        //if(item.idx == idx_Alarm && vdata == 'On'){
                        //	vdata=new String(vdata).replace( "On","<a class=iframe href=secpanel/index.html><img src=icons/alarm_on.png vspace=6></a>");
                        //	vdesc=desc_alarm_on; // Replace text at bottom with text from settings file
                        //}

                        // set celsius, %, mm, W, kWh
                        switch (vtype) {
                            case "SetPoint":
                                //Thermostat
                                if (vplusmin > 0) {
                                    var hlp = '<span style=' + vattr + '>' + vdata + '</span>';
                                    var plus = "<img src=icons/up.png align=right vspace=12 width=30 onclick=ChangeTherm('plus'," +vplusmin+ "," + item.idx + ","+ vdata+","+ valarm+")>";
                                    var min = "<img src=icons/down.png align=left vspace=12 width=30 onclick=ChangeTherm('min'," +vplusmin+ "," + item.idx + ","+ vdata+","+ valarm+")>";
                                    vdata = min.concat(hlp,plus);
                                }
                                break;
                            case "ForecastStr":
                                // replace forecast (text) with an image
                                descArray = getWeatherData(vdata);
                                vdata = descArray[0];
                                vdesc = descArray[1];
                                break;
                            case "Barometer":
                                vdataSuffix = "<sup class='subscript'> hPa</sup>";
                                break;
                            case "Speed":
                                vdataSuffix = "<sup class='subscript'> m/s</sup>";
                                break;
                            case "Visibility":
                                vdataSuffix = "<sup class='subscript'> KM</sup>";
                                break;
                            case "Temp":
                                if (vdata < 0) {
                                    alarmcss = temp_freeze_color;
                                }
                                vdataSuffix = "<sup class='superscript'> &#176;C</sup>";
                                break;
                            case "Humidity":
                                if(vdata > humidity_max){ // It's humid, font color will change
                                    alarmcss = humidity_max_color;
                                }
                                vdataSuffix = "<sup class='subscript'> %</sup>";
                                break;
                            case "Rain":
                                vdataSuffix = "<sup class='subscript'> mm</sup>";
                                break;
                            case "DirectionStr":
                                // Replace S from South to Z from Zuiden, E to O using regex
                                direction = new String(vdata).replace(/E/gi, "O").replace( /S/gi, "Z");
                                vdata = "<img src='icons/arrow-gray.png' width='20px' style='-webkit-transform: rotate(" + (item.Direction + 90) + "deg);'>&nbsp;";
                                vdata += direction;
                                vdata += " " + item.Speed +  "<sup class='subscript'> m/s</sup>";
                                break;
                            case "Usage":
                                vdata = new String(vdata).replace( " Watt","");
                                vdataSuffix = "<sup class='subscript'> W</sup>";
                                break;
                            case "CounterToday":
                                vdata = new String(vdata).replace( " kWh","");
                                vdataSuffix = "<sup class='subscript'> kWh</sup>";
                                break;
                        }

                        // if alarm threshold is defined, make value red
                        if (typeof valarm != 'undefined') {
                            alarmcss = '';
                            if (vdata > valarm) {
                                alarmcss = ';color:red;';
                            }
                        }

                        var switchclick = '';
                        if (vdata == txt_off && vplusmin == 6) { //protect switch when on for vplusmin is 6
                            switchclick = 'onclick="SwitchToggle(' + item.idx + ', \'On\');lightbox_open(\'switch\', ' + switch_on_timeout + ', ' + txt_switch_on + ')"';
                            alarmcss = color_off;
                            //vdata = txt_off;
                        }
                        if (vdata == txt_on && vplusmin == 6) { //protect switch when on for vplusmin is 6
                            switchclick = 'onclick="lightbox_open(\'protected\', ' + switch_protected_timeout + ', ' + txt_switch_protected + ')"';
                            vdesc = vdesc + desc_protected;
                            //alarmcss= color_on;
                            //vdata = txt_on;
                        }

                        $('#' + vlabel).html( '<div ' + switchclick + ' style="' + vattr + ';' + alarmcss + '">' + vdata + vdataSuffix + '</div>');
                        $('#desc_' + vlabel).html(vdesc);
                    }

                    switch ($.PageArray[ii][1]) {
                        case "Link":
                            //var vtype =    $.PageArray[ii][1];     // Domoticz type (like Temp, Humidity)
                            var vlabel =     $.PageArray[ii][2];     // cell number from HTML layout
                            var vdata =      $.PageArray[ii][3];     // description (link in this case
                            var vdesc =      '';
                            //var vattr =    $.PageArray[ii][6];     // extra css attributes
                            var valarm =     $.PageArray[ii][7];     // alarm value to turn text to red
                            //var vdata =    item[vtype];            // current value
                            $('#' + vlabel).html('<div>' + vdata + '</div>');
                            $('#desc_' + vlabel).html(vdesc);
                            break;
                        case "Tijd": //Special nummer, tijd in cell (test)
                            //var vtype =   $.PageArray[ii][1];     // Domoticz type (like Temp, Humidity)
                            var vlabel =    $.PageArray[ii][2];     // cell number from HTML layout
                            var vdata =     currentTime();          // Get present time
                            var vdesc =     '';
                            var vattr =     $.PageArray[ii][5];     // extra css attributes
                            var valarm =    $.PageArray[ii][6];     // alarm value to turn text to red
                            //var vdata =   item[vtype];            // current value
                            $('#' + vlabel).html('<div style=' + vattr + '>' + vdata + '</div>');
                            $('#desc_' + vlabel).html(vdesc);
                            break;

                        case "Desc":
                            var vlabel =    $.PageArray[ii][2];     // cell number from HTML layout
                            var vdesc =     $.PageArray[ii][3];     // show text in bottom
                            var lastseen =  $.PageArray[ii][4];     // show last seen
                            var vls =       item["LastUpdate"];     // Last Seen
                            //$('#'+vlabel).html( '<div style='+vattr+'>'+vdata+'</div>');
                            $('#desc_' + vlabel).html(vdesc);
                            break;

                        case "SunRise":
                            var vlabel =    $.PageArray[ii][2];         // cell number from HTML layout
                            var vdesc =     '';
                            var vattr =     $.PageArray[ii][6];         // extra css attributes
                            var valarm =    $.PageArray[ii][7];         // alarm value to turn text to red
                            $('#' + vlabel).html('<div style=' + vattr + '>' + var_sunrise + '</div>');
                            $('#desc_' + vlabel).html(txt_sunrise);
                            break;

                        case "SunSet":
                            var vlabel =    $.PageArray[ii][2];         // cell number from HTML layout
                            var vdesc =     '';
                            var vattr =     $.PageArray[ii][6];         // extra css attributes
                            var valarm =    $.PageArray[ii][7];         // alarm value to turn text to red
                            $('#' + vlabel).html('<div style=' + vattr + '>' + var_sunset + '</div>');
                            $('#desc_' + vlabel).html(txt_sunset);
                            break;

                        case "SunBoth":
                            // Replace ON and OFF for the virtual switch 'IsDonker' by images
                            if (IsNight) {
                                cellContent = "<img src=icons/sunset.png vspace=8>";
                            } else {
                                cellContent = "<img src=icons/sunrise.png vspace=8>";
                            }
                            var vlabel =    $.PageArray[ii][2];         // cell number from HTML layout
                            var vdesc =     '';
                            var vattr =     $.PageArray[ii][6];         // extra css attributes
                            var valarm =    $.PageArray[ii][7];         // alarm value to turn text to red
                            $('#' + vlabel).html(cellContent);
                            $('#desc_' + vlabel).html('&#9650; ' + var_sunrise + ' | &#9660; ' + var_sunset);
                            break;
                    };
                }
            });
       }
    });
    $.refreshTimer = setInterval(RefreshData, pageRefreshTime);
}

function DomoticzAction(idx, param, switchcmd, level)
{
    var url = $.domoticzurl+"/json.htm?type=command&param=" + param + "&idx=" + idx + "&switchcmd=" + switchcmd;
    if (level != null) {
        url += "&level=" + level;
    }
    $.ajax({
        url: url,
        async: false,
        dataType: 'json',
        success: function() {
            console.log('Domoticz action ' + switchcmd + " on idx " + idx + " successful");
        },
        error: function() {
            console.log('ERROR in: Domoticz action ' + switchcmd + " on idx " + idx + " successful");
        }
    });
    RefreshData();
}

//Switch state off a scene/group
function SceneToggle(idx, switchcmd)
{
    DomoticzAction(idx, "switchscene", switchcmd, null);
}

//switch state of a switch
function SwitchToggle(idx, switchcmd)
{
    DomoticzAction(idx, "switchlight", switchcmd, null);
}

//switch dimmer and set level
function SwitchDimmer(idx, level)
{
    DomoticzAction(idx, "switchlight", "Set%20Level", level);
}

//Dimmer, only works with 1-16 dimmer for now
function ChangeStatus(OpenDicht, level, idx, currentlevel)
{
    //When switched off return to previous level, no matter if plus or min pressed
    if (level == txt_off) {
        if (currentlevel == 1) {
            currentlevel++;
        }
        DomoticzAction(idx, "switchlight", "Set%20Level", currentlevel);
    } else {
        level = level * 1;
        //console.log(OpenDicht,level);
        if (OpenDicht == "plus")
        {
            var d = ((level + 10) / 100 * 16) + 0.5;
            //console.log("in plus",d,level);
            if(d > 16) {
                d = 16;
            }
            DomoticzAction(idx, "switchlight", "Set%20Level", d);
        } else {
            var d = ((level - 0.1) / 100 * 16);
            //console.log("in min",d,level);
            if( d < 0 ) {
                d = 0;
            }
            DomoticzAction(idx, "switchlight", "Set%20Level", d);
        }
    }
}

// zwave dimmer
function ZWaveDim(OpenDicht, level, idx)
{
    if (OpenDicht == "plus") {
        //var d = 0;
        var d = level + 10;
        if(d > 100) {
            d = 100;
        }
        DomoticzAction(idx, "switchlight", "Set%20Level", d);
        z_dimmer = d; //To show new value for ZWave dimmer
        z_whichdimmer = idx; //Only show new value for dimmer which was pressed
    } else {
        var d = level - 10;
        //console.log("in min",d,level);
        if( d < 0 ){
            d = 0;
        }
        DomoticzAction(idx, "switchlight", "Set%20Level", d);
        z_dimmer = d; //To show new value for ZWave dimmer
        z_whichdimmer = idx; //Only show new value for dimmer which was pressed
    }
}

// blinds percentage
function BlindChangeStatus(OpenDicht, levelInt, idx)
{
    var d = 0;
    if (OpenDicht == "plus") {
        var d = levelInt + 2;
        if(d > 16) {
            d = 16;
        }
    } else {
        var d = levelInt - 2;
        if( d < 1 ) {
            d = 1;
        }
    }
    DomoticzAction(idx, "switchlight", "Set%20Level", d);
}

//Thermostat
function ChangeTherm(dimtype, stepsize, idx, currentvalue, thermmax)
{
    newvalue='';
    //console.log(dimtype,stepsize,idx,currentvalue,thermmax)
    if (dimtype == 'plus') {
        if ((currentvalue + stepsize) > thermmax){
            newvalue = thermmax;
        } else {
            newvalue = currentvalue + stepsize;
        }
    }
    else if (dimtype == 'min'){
        if (currentvalue < stepsize){
            newvalue = 1;
        } else {
            newvalue = currentvalue - stepsize;
        }
    }
    $.ajax({
        url: $.domoticzurl + "/json.htm?type=command&param=udevice" + "&idx=" + idx + "&nvalue=0&svalue=" + newvalue,
        async: false,
        dataType: 'json',
        success: function(){
            console.log('SUCCES');
        },
        error: function(){
            console.log('ERROR');
        }
    });
    RefreshData();
}

function getSonosInfo(action, idx)
{
    return $.ajax({
        url: "sonos/index.php?zone=" + idx + "&action=" + action,
        type: 'get',
        dataType: 'html',
        async: false
    }).responseText
}

<!-- Check volume of Sonos -->
function VolumeSonos(idx) {
    return getSonosInfo("GetVolume", idx);
}

<!-- Check whats playing on Sonos - Radio -->
function MediaInfoSonos(idx) {
    return getSonosInfo("GetMediaInfo", idx);
}

<!-- Check whats playing on Sonos - Albums -->
function PositionInfoSonos(idx) {
    return getSonosInfo("GetPositionInfo", idx);
}

function SetSonos(action, idx)
{
    $.ajax({
        url: "sonos/index.php?zone=" + idx + "&action=" + action,
        async: true,
        dataType: 'html', //was json but that always gave an error although it's working
        success: function(){
            console.log(action + " on idx " + idx + " successful");
        },
        error: function(){
            console.log(action + " on idx " + idx + " ERROR");
        }
    });
    RefreshData();
}

function ChangeVolumeUp(idx)
{
    SetSonos("VolumeUp", idx);
}

function ChangeVolumeDown(idx)
{
    SetSonos("VolumeDown", idx);
}

//Change radio of Sonos
function ChangeRadio(idx)
{
    SetSonos("NextRadio", idx);
}

//Change radio of Sonos
function ChangeRadioPrev(idx)
{
    SetSonos("PrevRadio", idx);
}

//Next song of Sonos
function ChangeNextSong(idx)
{
    SetSonos("Next", idx);
}

//Previous song of Sonos
function ChangePreviousSong(idx)
{
    SetSonos("Previous", idx);
}

//Return current time: dd-mm-yyyy hh:mm
function currentTime()
{
    var today = new Date();
    var h = stringpad(today.getHours().toString().trim(), 2);
    var m = stringpad(today.getMinutes().toString().trim(), 2);
    var s = stringpad(today.getSeconds().toString().trim(), 2);

   //Change the day to reflect your preferred translation
   var day = new Array();
      day[0] = "Zondag";
      day[1] = "Maandag";
      day[2] = "Dinsdag";
      day[3] = "Woensdag";
      day[4] = "Donderdag";
      day[5] = "Vrijdag";
      day[6] = "Zaterdag";
   var day = day[today.getDay()];
   
   //haal datum op
   var datum = today.getDate().toString();
   datum = datum.trim();

   //haal maand op
   var month = new Array();
     month[0] = "januari";
     month[1] = "februari";
     month[2] = "maart";
     month[3] = "april";
     month[4] = "mei";
     month[5] = "juni";
     month[6] = "juli";
     month[7] = "augustus";
     month[8] = "september";
     month[9] = "oktober";
     month[10] = "november";
     month[11] = "december";
   var month = month[today.getMonth()];

   //haal jaar op
   var year = today.getFullYear();
   
   return day + " " + datum + " " + month + " " + year + "<br />" + h + ":" + m + "";
}

function getWeatherData(vdata)
{
    var weatherContent;
    switch (vdata) {
        case "Sunny":
            weatherContent = {day: "icons/day_sun.png", night: "icons/night_clear.png", dayText: "Zonnig", nightText: "Helder"};
            break;
        case "Clear":
            weatherContent = {day: "icons/day_sun.png", night: "icons/night_clear.png", dayText: "Helder", nightText: "Helder"};
            break;
        case "Partly Cloudy":
            weatherContent = {day: "icons/day_partlycloudy.png", night: "icons/night_partlycloudy.png", dayText: "Gedeeltelijk bewolkt", nightText: "Bewolkt"};
            break;
        case "Cloudy":
            weatherContent = {day: "icons/day_cloudy.png", night: "icons/night_cloudy.png", dayText: "Bewolkt", nightText: "Bewolkt"};
            break;
        case "Rain":
            weatherContent = {day: "icons/day_rain.png", night: "icons/night_rain.png", dayText: "Regen", nightText: "Regen"};
            break;
        case "Snow":
            weatherContent = {day: "icons/day_rain.png", night: "icons/night_snow.png", dayText: "Sneeuw", nightText: "Sneeuw"};
            break;
        case "Fog":
            weatherContent = {day: "icons/day_fog.png", night: "icons/night_fog.png", dayText: "Mist", nightText: "Mist"};
            break;
        case "Hail":
            weatherContent = {day: "icons/day_hail.png", night: "icons/night_hail.png", dayText: "Hagel", nightText: "Hagel"};
            break;
        case "Thunderstorm":
            weatherContent = {day: "icons/day_thunderstorm.png", night: "icons/night_thunderstorm.png", dayText: "Onweersbui", nightText: "Onweersbui"};
            break;
        case "Sleet":
            weatherContent = {day: "icons/day_sleet.png", night: "icons/night_sleet.png", dayText: "IJzel", nightText: "IJzel"};
            break;

        default:
            weatherContent = {day: "icons/day_sun.png", night: "icons/day_sun.png", dayText: "Zonnig", nightText: "Helder"};
    }

    vdata = "<img src='" + weatherContent.day + "' width='272' style='margin-top: -30px;'>";
    vdesc = weatherContent.dayText
    if (IsNight) {
        vdata = "<img src='" + weatherContent.night + "' width='272' style='margin-top: -30px;'>";
        vdesc = weatherContent.nightText
    }
    return [vdata, vdesc];
}

function getLastSeen(dateString)
{
    var lastSeenArray = [];
    var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
    var dateArray = reggie.exec(dateString);
    var dateObject = new Date(
        (+dateArray[1]),
        (+dateArray[2])-1, // Careful, month starts at 0!
        (+dateArray[3]),
        (+dateArray[4]),
        (+dateArray[5]),
        (+dateArray[6])
    );
    var convStringDate = dateObject.toString('d MMM');              // the part of the 'Last Seen' that creates the DATE, original dd-MM-yyyy
    var convStringDate = convStringDate.replace('Mar', 'Mrt');      // replace some months to NL abbrev
    var convStringDate = convStringDate.replace('May', 'Mei');      // replace some months to NL abbrev
    lastSeenArray["date"] = convStringDate.replace('Oct', 'Okt');   // replace some months to NL abbrev
    lastSeenArray["time"] = dateObject.toString ('HH:mm');          // the part of the 'Last Seen' that creates the TIME

    return lastSeenArray;
}

