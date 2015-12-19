<!-- Javascript for Domoticz frontpage -->
<!-- Create popup -->
function lightbox_open(id, timeout, txt)
{
	window.scrollTo(0, 0);
	if (typeof txt != 'undefined') {
		$('#popup_' + id).html('<div>'+txt+'</div>');
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
	
<!-- Check volume of Sonos -->
function VolumeSonos(idx) {
	return $.ajax({
        url: "sonos/index.php?zone=" + idx + "&action=GetVolume",
	    type: 'get',
        dataType: 'html',
        async: false
    }).responseText
}

<!-- Check whats playing on Sonos - Radio -->
function MediaInfoSonos(idx) {
	return $.ajax({
        url: "sonos/index.php?zone=" + idx + "&action=GetMediaInfo",
	    type: 'get',
        dataType: 'html',
        async: false
    }).responseText
}

<!-- Check whats playing on Sonos - Albums -->
function PositionInfoSonos(idx) {
	return $.ajax({
        url: "sonos/index.php?zone=" + idx + "&action=GetPositionInfo",
	    type: 'get',
        dataType: 'html',
        async: false
    }).responseText
}

function stringpad (string, maxlength) {
    string = string.toString();
    return string.length < maxlength ? stringpad("0" + string, maxlength) : string;
}

<!-- Main Frontpage fuction -->
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
            document.getElementById('dark-styles').disabled  = true;				// day
            IsNight = false;
        } else {
            document.getElementById('dark-styles').disabled  = false;				// night
            IsNight = true;
        }
	    if (typeof data.result != 'undefined') {

            $.each(data.result, function(i,item){
                for( var ii = 0, len = $.PageArray.length; ii < len; ii++ ) {
                    if( $.PageArray[ii][0] === item.idx ) {	// Domoticz idx number
                        var vtype = $.PageArray[ii][1];		// Domoticz type (like Temp, Humidity)
                        var vlabel = $.PageArray[ii][2];		// cell number from HTML layout
                        var vdesc = $.PageArray[ii][3];		// description
                        var lastseen = $.PageArray[ii][4];	// Display lastseen or not
                        var vplusmin = $.PageArray[ii][5];	// minplus buttons
                        var vattr = $.PageArray[ii][6];		// extra css attributes
                        var valarm = $.PageArray[ii][7];		// alarm value to turn text to red
                        var vdata = item[vtype];				// current value
                        var vstatus = item["Status"];		// current status
                        var vls = item["LastUpdate"];		// Last Seen

                        var dateString = item["LastUpdate"];	// 'Last Seen' string used to convert into a nicer date/time
                        var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
                        var dateArray = reggie.exec(dateString);
                        var dateObject = new Date(
                            (+dateArray[1]),
                            (+dateArray[2])-1, 				// Careful, month starts at 0!
                            (+dateArray[3]),
                            (+dateArray[4]),
                            (+dateArray[5]),
                            (+dateArray[6])
                        );
                        var convStringDate = dateObject.toString ( 'd MMM' );		// the part of the 'Last Seen' that creates the DATE, original dd-MM-yyyy
                        var convStringDate = convStringDate.replace('Mar', 'Mrt'); 	// replace some months to NL abbrev
                        var convStringDate = convStringDate.replace('May', 'Mei'); 	// replace some months to NL abbrev
                        var convStringDate = convStringDate.replace('Oct', 'Okt'); 	// replace some months to NL abbrev
                        var convStringTime = dateObject.toString ( 'HH:mm' );		// the part of the 'Last Seen' that creates the TIME

                        //Added by GZ used for last seen to only show day if <> today
                        var thisday = (new Date()).toISOString().slice(0,10);

                        var vdimmercurrent = item["LevelInt"];	// What is the dim level int
                        var vdimmervalue = item["Level"];		// What is the dim level
                        if (typeof vdata == 'undefined') {
                            vdata = "?!";
                            vdata = item.idx;
                        } else {
                            // remove too much text
                            //vdata=new String(vdata).split("Watt",1)[0];
                            vdata = new String(vdata).split("kWh",1)[0];
                            vdata = new String(vdata).split(" Level:",1)[0];
                            vdata = new String(vdata).replace("Set","On");
                            vdata = new String(vdata).split("m3",1)[0];
                            //vdata=new String(vdata).split("C",1)[0];
                            vdata = new String(vdata).replace("true","protected");
                            //Added by GZ to only show date if <> today, see below
                            vdate = new String(vls).split(" ",2)[0];
                        }

                        alarmcss='';
                        //Push On gives wrong(undesired) status
                        if (item.SwitchType == 'Push On Button') {
                            vdata = 'Off'
                        }

                        //Check whether we want to add the last seen to the block
                        if (lastseen == '1') {
                            if (thisday == vdate) {
                                $('#ls_'+vlabel).html(convStringTime) 						// Show only the time if last change date = today
                            }
                            else {
                                $('#ls_'+vlabel).html(convStringTime+' | '+convStringDate)	// Change this 'Last Seen' into something you like
                            }
                        } else if (lastseen == '2') {
                            $('#ls_'+vlabel).html(convStringTime)							// Show only the time
                        }

                        //switch layout cell
                        if (vplusmin > 0) {	//layout cell, percentage font-size was 80%
                            if (vstatus == 'Off') {
                                //alarmcss=';color:#E24E2A;font-size:100%;vertical-align:top;';	// text color dimmer percentage when OFF
                                alarmcss = color_off;
                                vdata = txt_off; //show text from frontpage_settings
                            }
                            else {
                                //alarmcss=';color:#1B9772;font-size:100%;vertical-align:top;';	// text color dimmer percentage when ON
                                alarmcss = color_on;
                                vdata = txt_on;	//show text from frontpage_settings
                            }
                        }

                        //alarmcss=';background-image:url(\'../icons/' + vdata + 'dimmer.png\');background-repeat:no-repeat;background-position:50%25%;color:#08c5e3;font-size:0%;vertical-align:top;';

                        //Dimmer
                        if(vtype == 'Level' && item.SwitchType == 'Dimmer') {
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
                                                if(z_dimmer == '') {		//when starting the frontpage
                                                    vdata = vdimmervalue;	//show current dim value
                                                } else if (z_dimmer != vdimmervalue) {						//when dimmer is changed
                                                        vdata = z_dimmer;
                                                        z_dimmer = vdimmervalue;
                                                } else {
                                                    vdata = z_dimmer;
                                                }
                                                var hlp = '<span onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_switch_off+')"; style='+alarmcss+'>'+ vdata+'</span>';
                                                var plus = "<img src=icons/up.png align=right vspace=12 onclick=ZWaveDim('plus'," + vdata + "," + item.idx + ")>";
                                                var min = "<img src=icons/down.png align=left vspace=12 onclick=ZWaveDim('min'," + vdata + "," + item.idx + ")>";
                                                //console.log(vdata + " | " + item.idx);
                                            }
                                            else {
                                                //vdata = o_dimmer;
                                                vdimmervalue = Math.round(vdimmervalue / 10)*10; //round to ten
                                                vdata = vdimmervalue; //show current dim value
                                                var hlp = '<span onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_switch_off+')"; style='+alarmcss+'>'+ vdata+'</span>';
                                                var plus = "<img src=icons/up.png align=right vspace=12 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
                                                var min = "<img src=icons/down.png align=left vspace=12 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
                                                //console.log(vdata + " | " + item.idx);
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
                        vdata = min.concat(hlp,plus);
                        //console.log(vdata);
                        }

                        //Thermostat
                        if(vtype == 'SetPoint' && vplusmin > 0) {
                            var hlp = '<span style='+vattr+'>'+ vdata+'</span>';
                            var plus = "<img src=icons/up.png align=right vspace=12 width=30 onclick=ChangeTherm('plus'," +vplusmin+ "," + item.idx + ","+ vdata+","+ valarm+")>";
                            var min = "<img src=icons/down.png align=left vspace=12 width=30 onclick=ChangeTherm('min'," +vplusmin+ "," + item.idx + ","+ vdata+","+ valarm+")>";
                            vdata = min.concat(hlp,plus);
                            //console.log(vdata);
                        }

                        //Blinds
                        if (item.SwitchType == 'Blinds') {
                            if(vdata == 'Closed') {
                                if(IsNight) {
                                    var hlp = '<img src=icons/sun_stop_n.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
                                }
                                else {
                                    var hlp = '<img src=icons/sun_stop_d.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
                                }
                                var up = '<img src=icons/sun_up_off.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
                                var down = '<img src=icons/sun_down_on.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
                                vdesc = vdesc + " | " + txt_zonon; //Change description text
                            }
                            if (vdata == 'Open') {
                                if(IsNight) {
                                    var hlp = '<img src=icons/sun_stop_n.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
                                }
                                else {
                                    var hlp = '<img src=icons/sun_stop_d.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
                                }
                                //var hlp = '<span onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">'+ "||" +'</span>';
                                var up = '<img src=icons/sun_up_on.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
                                var down = '<img src=icons/sun_down_off.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
                                vdesc = vdesc + " | " + txt_zonoff; //Change description text
                            }
                            if (vdata == 'Stopped') {
                                if(IsNight) {
                                    var hlp = '<img src=icons/sun_stop_n.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
                                }
                                else {
                                    var hlp = '<img src=icons/sun_stop_d.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
                                }
                                var up = '<img src=icons/sun_up_off.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
                                var down = '<img src=icons/sun_down_on.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
                                vdesc = vdesc + " | " + txt_zonstopped; //Change description text
                            }
                            vdata = down.concat(hlp,up);
                            //console.log(vdata);
                        }
                        if (item.SwitchType == 'Blinds Inverted') {
                            if(vdata == 'Closed') {
                                var down = '<img src='+$.domoticzurl+'/images/blinds48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_down+')">';
                                var up = '<img src='+$.domoticzurl+'/images/blindsopen48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_up+')">';
                            }
                            if (vdata == 'Open') {
                                var down = '<img src='+$.domoticzurl+'/images/blinds48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_down+')">';
                                var up = '<img src='+$.domoticzurl+'/images/blindsopen48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_up+')">';
                            }
                            vdata = down.concat(up);
                            //console.log(vdata);
                        }
                        if (item.SwitchType == 'Blinds Percentage') {
                            if(item.Status == 'Closed') {
                                vdata = 100;
                                var down = '<img src='+$.domoticzurl+'/images/blinds48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
                                var up = '<img src='+$.domoticzurl+'/images/blindsopen48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
                                //var plus = "<img src=icons/up.png  vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
                                //var min = "<img src=icons/down.png  vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
                            }
                            else if (item.Status == 'Open') {
                                var down = '<img src='+$.domoticzurl+'/images/blinds48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
                                var up = '<img src='+$.domoticzurl+'/images/blindsopen48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
                                //var plus = "<img src=icons/up.png  vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
                                //var min = "<img src=icons/down.png  vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
                            }
                            else {
                                var down = '<img src='+$.domoticzurl+'/images/blinds48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
                                var up = '<img src='+$.domoticzurl+'/images/blindsopen48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
                                //var plus = "<img src=icons/up.png  vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
                                //var min = "<img src=icons/down.png  vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
                            }
                            vdesc=new String(vdesc).replace( vdesc,vdesc + "<span style='color:#1B9772;font-size:20px;'> "+(100-vdata)+"&#37;</span>");
                            vdata = min.concat(down,up,plus);
                            //console.log(vdata);
                        }
                        if (item.SwitchType == 'Blinds Percentage Inverted') {
                            if(item.Status == 'Closed') {
                                var down = '<img src='+$.domoticzurl+'/images/blinds48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_down+')">';
                                var up = '<img src='+$.domoticzurl+'/images/blindsopen48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_up+')">';
                                //var plus = "<img src=icons/up.png vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
                                //var min = "<img src=icons/down.png vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
                            }
                            else if (item.Status == 'Open') {
                                vdata = 100;
                                var down = '<img src='+$.domoticzurl+'/images/blinds48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_down+')">';
                                var up = '<img src='+$.domoticzurl+'/images/blindsopen48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_up+')">';
                                //var plus = "<img src=icons/up.png vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
                                //var min = "<img src=icons/down.png vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
                            }
                            else {
                                var down = '<img src='+$.domoticzurl+'/images/blinds48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_down+')">';
                                var up = '<img src='+$.domoticzurl+'/images/blindsopen48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_up+')">';
                                //var plus = "<img src=icons/up.png vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
                                //var min = "<img src=icons/down.png vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
                            }
                            vdesc=new String(vdesc).replace( vdesc,vdesc + "<span style='color:#1B9772;font-size:20px;'> "+vdata+"&#37;</span>");
                            vdata = min.concat(down,up,plus);
                            //console.log(vdata);
                        }

                        // replace forecast (text) with an image
                        if (vtype == "ForecastStr") {
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

                            vdata = "<img src='" + weatherContent.day + "' width='272' height='255' style='margin-top: -30px;'>";
                            vdesc = weatherContent.dayText
                            if (IsNight) {
                                vdata = "<img src='" + weatherContent.night + "' width='272' height='255' style='margin-top: -30px;'>";
                                vdesc = weatherContent.nightText
                            }

                        }

                        //doorbell
                        if (item.idx == idx_doorbell && vdata == doorbell_status) {
                            lightbox_open('camera1', 15400);
                            vdata=new String(vdata).replace( "On", "Tringgg");
                            //vdesc=new String(vdesc).replace( "Deurbel", "Deurbel");
                        }

                        // replace text when phone is at home
                        if (item.idx == idx_Iphone5s && vdata == txt_on){
                            vdata=new String(vdata).replace( txt_on, "Thuis");
                        }
                        if (item.idx == idx_Iphone5s && vdata == txt_off){
                            vdata=new String(vdata).replace( txt_off, "Weg");
                        }
                        if (item.idx == idx_Telefoon_m && vdata == txt_on){
                            vdata=new String(vdata).replace( txt_on, "Thuis");
                        }
                        if (item.idx == idx_Telefoon_m && vdata == txt_off){
                            vdata=new String(vdata).replace( txt_off, "Weg");
                        }

                        // replace closed / open to dutch
                        if (item.idx == idx_Voordeur && vstatus == "Closed"){
                            vdata = "Dicht";
                        }
                        if (item.idx == idx_Voordeur && vstatus == "Open"){
                            vdata = "Open";
                            alarmcss=color_off;
                        }

                        // replace closed / open to dutch
                        if (item.idx == idx_Garagedeur && vstatus == "Closed"){
                            vdata = "Dicht";
                        }
                        if (item.idx == idx_Garagedeur && vstatus == "Open"){
                            vdata = "Open";
                            alarmcss=color_off;
                        }

                        if (item.SubType == "Percentage") {
                            vdata=new String(vdata).split("%",1)[0];
                            vdata=Math.round(vdata);

                            if(item.idx == idx_CPUmem && vdata > CPUmem_max){
                                alarmcss=mem_max_color;							// Memory usage of the RPi is a bit high, font color will change
                            }
                            if(item.idx == idx_CPUusage && vdata > 50){			// CPU usage of the NAS is a bit high, font color will change, is not working with variable from frontpage_settings so hardcoded
                                alarmcss=cpu_max_color;
                            }

                            vdata += "<sup style=\'font-size:40%;vertical-align:top;position:relative;bottom:-0.5em;\'> %</sup>";
                        }

                        // set alarm icons night
                        if(item.idx == idx_Alarm && vdata == 'Arm Away' && IsNight){
                            vdata=new String(vdata).replace( "Arm Away","<a class=iframe href=secpanel/index.html><img src=icons/alarm_away.png vspace=6></a>");
                            vdesc=desc_alarm_away;
                        }
                        if(item.idx == idx_Alarm && vdata == 'Arm Home' && IsNight){
                            vdata=new String(vdata).replace( "Arm Home","<a class=iframe href=secpanel/index.html><img src=icons/alarm_home.png vspace=6></a>");
                            vdesc=desc_alarm_home;
                        }
                        if(item.idx == idx_Alarm && vdata == 'Normal' && IsNight){
                            vdata=new String(vdata).replace( "Normal","<a class=iframe href=secpanel/index.html><img src=icons/alarm_off.png vspace=6></a>");		// night
                            vdesc=desc_alarm_off;
                        }

                        // set alarm icons day
                        if(item.idx == idx_Alarm && vdata == 'Arm Away' && !IsNight){
                            vdata=new String(vdata).replace( "Arm Away","<a class=iframe href=secpanel/index.html><img src=icons/alarm_away_w.png vspace=6></a>");
                            vdesc=desc_alarm_away;
                        }
                        if(item.idx == idx_Alarm && vdata == 'Arm Home' && !IsNight){
                            vdata=new String(vdata).replace( "Arm Home","<a class=iframe href=secpanel/index.html><img src=icons/alarm_home_w.png vspace=6></a>");
                            vdesc=desc_alarm_home;
                        }
                        if(item.idx == idx_Alarm && vdata == 'Normal' && !IsNight){
                            vdata=new String(vdata).replace( "Normal","<a class=iframe href=secpanel/index.html><img src=icons/alarm_off_w.png vspace=6></a>");		// day
                            vdesc=desc_alarm_off;
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
                            case "Temp":
                                if (vdata < 0) {
                                    alarmcss = temp_freeze_color;
                                }
                                vdata += "<sup style=\'font-size:40%;vertical-align:top;position:relative;bottom:0.5em;\'> &#176;C</sup>";
                                break;
                            case "Humidity":
                                if(vdata > humidity_max){	// It's humid, font color will change
                                    alarmcss = humidity_max_color;
                                }
                                vdata += "<sup style=\'font-size:40%;vertical-align:top;position:relative;bottom:-0.5em;\'> %</sup>";
                                break;
                            case "Rain":
                                vdata += "<sup style=\'font-size:40%;vertical-align:top;position:relative;bottom:-0.6em;\'> mm</sup>";
                                break;
                            case "DirectionStr":
                                // Replace S from South to Z from Zuiden, E to O using regex
                                vdata = new String(vdata).replace(/E/gi, "O").replace( /S/gi, "Z");
                                break;
                            case "Usage":
                                vdata = new String(vdata).replace( " Watt","<sup style=\'font-size:40%;vertical-align:top;position:relative;bottom:-0.6em;\'> W</sup>");
                                break;
                            case "CounterToday":
                                vdata = new String(vdata).replace( " ","<sup style=\'font-size:40%;vertical-align:top;position:relative;bottom:-0.6em;\'> kWh</sup>");
                                break;
                        }

                        // Change font for lux
                        if(item.idx == idx_LuxF){
                            vdata=new String(vdata).replace( "Lux","<sup style=\'font-size:40%;vertical-align:top;position:relative;bottom:-0.6em;\'>Lux</sup>");
                        }
                        // Replace m/s in smaller font
                        if(item.idx == idx_WindSnelheid){
                            vdata=new String(vdata).replace( " m/s","<sup style=\'font-size:40%;vertical-align:top;position:relative;bottom:-0.6em;\'> m/s</sup>");
                        }
                        // Remove , from On for motionsensor Fibaro
                        if(item.idx == idx_BewegingF && vdata == 'On,'){
                            vdata=new String(vdata).replace( ",","");
                            vdata=new String(vdata).replace( "On","Aan");
                        }
                        // Add hPA and KM to barometer and visibility
                        if(item.idx == idx_Barometer && vdata > 100){ // Added > 100 because idx_Barometer is also used for weather prediction, idx=49
                            vdata=vdata+"<sup style=\'font-size:40%;vertical-align:top;position:relative;bottom:-0.5em;\'> hPa</sup>";
                        }
                        if(item.idx == idx_Visibility){
                            vdata=vdata+"<sup style=\'font-size:40%;vertical-align:top;position:relative;bottom:-0.5em;\'> KM</sup>";
                        }

                        // Replace ON and OFF for the virtual switch 'IsDonker' by images
                        if(item.idx == idx_SunState && vdata == 'Off'){
                            vdata=new String(vdata).replace( "Off","<img src=icons/sunrise.png vspace=8>");		// day
                            //vdesc=new String(vdesc).replace( "Zon onder","Zon op");					// replace text in desc
                            //vdesc=desc_sunrise; //show text
                            vdesc=desc_showsunboth; //show time sunrise and sunset
                        }
                        if(item.idx == idx_SunState && vdata == 'On'){
                            vdata=new String(vdata).replace( "On","<img src=icons/sunset.png vspace=8>");		// night
                            //vdesc=new String(vdesc).replace( "Zon op","Zon onder");					// replace text in desc
                            //vdesc=desc_sunset; //show text
                            vdesc=desc_showsunboth; //show time sunrise and sunset
                        }

                        // Rounding code for Fibaro Wall Plug
                        // set the text to ON instead of displaying the value for idx 107: the Fibaro Wall Plug
                        if (item.idx == idx_FibaroWP) {
                            vdata = Math.round(vdata * 100) / 100;
                            if (vdata > 40) {
                                vdata = '<img src=icons/pump_on.png>';
                                alarmcss = color_on;
                            } else if (vdata < 40 && vdata > 0.9) {
                                vdata = '<img src=icons/pump_off.png>';
                                alarmcss = color_off;
                            }
                        }

                        // create switchable value when item is switch
                        switchclick='';
                        if (vdata == 'Off' && vplusmin != 4) {
                            switchclick = 'onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_switch_on+')"';
                            alarmcss = color_off;
                            vdata = txt_off;
                        }
                        if (vdata == 'On' && vplusmin != 4) {
                            switchclick = 'onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_switch_off+')"';
                            alarmcss = color_on;
                            vdata = txt_on;
                        }

                        //change text of blinds, placed after switch code above, otherwise is is not clickable
                        if (item.idx == idx_ZonV && vdata == txt_on){ //txt_on from frontpage settings
                        //	vdata=new String(vdata).replace( "On", "Dicht");
                            vdata=txt_zonon;
                            alarmcss=color_on;
                        }
                        if (item.idx == idx_ZonV && vdata == txt_off){ //txt_off from frontpage settings
                        //	vdata=new String(vdata).replace( "Off", "Open");
                            vdata=txt_zonoff;
                            alarmcss=color_off;
                        }
                        //if (item.idx == idx_ZonV && vdata == 'Stopped'){
                        //	vdata=new String(vdata).replace( "Stopped", "Gestopt");
                        //	alarmcss=color_off;
                        //}

                        //change text of blinds
                        if (item.idx == idx_ZonA && vdata == txt_on){
                        //	vdata=new String(vdata).replace( "On", "Dicht");
                            vdata=txt_zonon;
                            alarmcss=color_on;
                        }
                        if (item.idx == idx_ZonA && vdata == txt_off){
                        //	vdata=new String(vdata).replace( "Off", "Open");
                            vdata=txt_zonoff;
                            alarmcss=color_off;
                        }
                        //if (item.idx == idx_ZonA && vdata == 'Stopped'){
                        //	vdata=new String(vdata).replace( "Stopped", "Gestopt");
                        //	alarmcss=color_off;
                        //}

                        // if alarm threshold is defined, make value red
                        if (typeof valarm != 'undefined') {
                            alarmcss='';
                            if ( eval(vdata + valarm)) {  // note orig:  vdata > alarm
                                alarmcss=';color:red;';
                            }
                        }

                        if (vdata == txt_off && vplusmin == 6) { //protect switch when on for vplusmin is 6
                            switchclick = 'onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_switch_on+')"';
                            alarmcss= color_off;
                            //vdata = txt_off;
                        }
                        if (vdata == txt_on && vplusmin == 6) { //protect switch when on for vplusmin is 6
                            switchclick = 'onclick="lightbox_open(\'protected\', '+switch_protected_timeout+', '+txt_switch_protected+')"';
                            vdesc = vdesc + desc_protected;
                            //alarmcss= color_on;
                            //vdata = txt_on;
                        }

                        // if extra css attributes. Make switch not switchable when it is protected, just give message
                        if (typeof vattr == 'undefined') {
                            vattr = '';
                        }
                        if (item.Protected == true || vplusmin == 4) {
                            //vdesc = "<img scr=icons/lock-closed_w.png align='left'>" + vdesc;
                            vdesc = vdesc + desc_protected;
                            $('#'+vlabel).html( '<div onClick="lightbox_open(\'protected\', '+switch_protected_timeout+ ', '+txt_switch_protected+');" style='+vattr+alarmcss+'>'+vdata+'</div>');
                        } else {
                            $('#'+vlabel).html( '<div '+switchclick+' style='+vattr+alarmcss+'>'+vdata+'</div>');
                        }
                        $('#desc_'+vlabel).html(vdesc);
                    }

                    switch ($.PageArray[ii][1]) {
                        case "Link":
                            //var vtype=    $.PageArray[ii][1];		// Domoticz type (like Temp, Humidity)
                            var vlabel=     $.PageArray[ii][2];		// cell number from HTML layout
                            var vdata=      $.PageArray[ii][3];		// description (link in this case
                            var vdesc = 	'';
                            //var vattr=    $.PageArray[ii][6];		// extra css attributes
                            var valarm=     $.PageArray[ii][7];		// alarm value to turn text to red
                            //var vdata=    item[vtype];			// current value
                            $('#'+vlabel).html( '<div>'+vdata+'</div>');
                            $('#desc_'+vlabel).html(vdesc);
                            break;
                        case "Tijd": //Special nummer, tijd in cell (test)
                            //var vtype=    $.PageArray[ii][1];		// Domoticz type (like Temp, Humidity)
                            var vlabel=     $.PageArray[ii][2];		// cell number from HTML layout
                            var vdata=      currentTime();			// Get present time
                            var vdesc = 	'';
                            var vattr=    	$.PageArray[ii][5];		// extra css attributes
                            var valarm=     $.PageArray[ii][6];		// alarm value to turn text to red
                            //var vdata=    item[vtype];			// current value
                            $('#'+vlabel).html( '<div style='+vattr+'>'+vdata+'</div>');
                            $('#desc_'+vlabel).html(vdesc);
                            break;

                        case "Desc":
                            var vlabel=     $.PageArray[ii][2];     // cell number from HTML layout
                            var vdesc=      $.PageArray[ii][3];		// show text in bottom
                            var lastseen=	$.PageArray[ii][4];		// show last seen
                            var vls= 	item["LastUpdate"];			// Last Seen
                            //$('#'+vlabel).html( '<div style='+vattr+'>'+vdata+'</div>');
                            $('#desc_'+vlabel).html(vdesc);
                            break;

                        case "SunRise":
                            var vlabel=     $.PageArray[ii][2];         // cell number from HTML layout
                            var vdesc=      '';
                            var vattr=      $.PageArray[ii][6];        	// extra css attributes
                            var valarm=     $.PageArray[ii][7];        	// alarm value to turn text to red
                            $('#'+vlabel).html( '<div style='+vattr+'>'+var_sunrise+'</div>');
                            $('#desc_'+vlabel).html(txt_sunrise);
                            break;

                        case "SunSet":
                            var vlabel=     $.PageArray[ii][2];         // cell number from HTML layout
                            var vdesc=      '';
                            var vattr=      $.PageArray[ii][6];         // extra css attributes
                            var valarm=     $.PageArray[ii][7];         // alarm value to turn text to red
                            $('#'+vlabel).html( '<div style='+vattr+'>'+var_sunset+'</div>');
                            $('#desc_'+vlabel).html(txt_sunset);
                            break;

                        case "SunBoth":
                            var vlabel=     $.PageArray[ii][2];         // cell number from HTML layout
                            var vdesc=      '';
                            var vattr=      $.PageArray[ii][6];         // extra css attributes
                            var valarm=     $.PageArray[ii][7];         // alarm value to turn text to red
                            $('#'+vlabel).html( '<div style='+vattr+'>&#9650 ' +var_sunrise+' | &#9660 '+var_sunset+'</div>');
                            $('#desc_'+vlabel).html(txt_sunboth);
                            desc_showsunboth = '&#9650; ' +var_sunrise+' | &#9660; '+var_sunset; // used for cell with time sunrise and sunset including arrow up and arrow down
                            break;
                    };
                }
            });
		}
	});
    $.refreshTimer = setInterval(RefreshData, 8000); //was 8000
}

//Switch state off a scene/group
function SceneToggle(idx, switchcmd)
{
    $.ajax({
    	url: $.domoticzurl+"/json.htm?type=command&param=switchscene" + "&idx=" + idx + "&switchcmd=" + switchcmd,
	    async: false,
    	dataType: 'json',
	    success: function() {
	        console.log('SUCCES');
    	},
	    error: function() {
	        console.log('ERROR');
    	}
	});
	RefreshData();
}

//switch state of a switch
function SwitchToggle(idx, switchcmd)
{
	$.ajax({
        url: $.domoticzurl+"/json.htm?type=command&param=switchlight" + "&idx=" + idx + "&switchcmd=" + switchcmd,
        async: false,
        dataType: 'json',
        success: function() {
            console.log('SUCCES');
        },
        error: function() {
            console.log('ERROR');
        }
	});
	RefreshData();
}
	
//switch dimmer and set level
function SwitchDimmer(idx, level)
{
	$.ajax({
        url: $.domoticzurl+"/json.htm?type=command&param=switchlight" + "&idx=" + idx + "&switchcmd=Set%20Level" + "&level=" + level,
        async: false,
        dataType: 'json',
        success: function() {
            console.log('SUCCES');
        },
        error: function() {
            console.log('ERROR');
        }
	});
	RefreshData();
}

//Dimmer, only works with 1-16 dimmer for now
function ChangeStatus(OpenDicht,level,idx,currentlevel)
{
	//When switched off return to previous level, no matter if plus or min pressed
	if (level == txt_off) {
		if (currentlevel == 1) {
			currentlevel++;
		}
		//console.log("In uit",currentlevel);
		$.ajax({
		url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + currentlevel,
		async: false,
		dataType: 'json',
		success: function(){
		console.log('SUCCES');
		},
		error: function(){
		console.log('ERROR');
		}
		});
	} else {
		level = level * 1;
		//console.log(OpenDicht,level);
		if (OpenDicht == "plus")
			{
			var d = ((level + 10)/100 * 16) +  0.5;
			//console.log("in plus",d,level);
			if(d > 16) {
				d = 16;
			}
			$.ajax({
                url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d,
                async: false,
                dataType: 'json',
                success: function(){
                    console.log('SUCCES');
                },
                error: function(){
			        console.log('ERROR');
			    }
			});
		} else {
			var d = ((level-0.1 )/100*16)  ;
			//console.log("in min",d,level);
			if( d < 0 ) {
				d = 0;
			}
			$.ajax({
                url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d,
                async: false,
                dataType: 'json',
                success: function(){
                    console.log('SUCCES');
                },
                error: function(){
                    console.log('ERROR');
                }
			});
		}
	}
	RefreshData();
}

// zwave dimmer
function ZWaveDim(OpenDicht,level,idx)
{
    if (OpenDicht == "plus") {
        //var d = 0;
        var d = level + 10;
        if(d > 100) {
            d = 100;
        }
        $.ajax({
            url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d,
            async: false,
            dataType: 'json',
            success: function(){
                console.log('SUCCES');
                //console.log('level oud: ' + level);
                //console.log('level nieuw: ' + d);
                //console.log('idx: ' + idx);
                z_dimmer = d; //To show new value for ZWave dimmer
                z_whichdimmer = idx; //Only show new value for dimmer which was pressed
                //console.log('waarde: ' + z_dimmer);
                //console.log('idx: ' + z_whichdimmer);
            },
            error: function(){
                console.log('ERROR');
            }
        });
    } else {
        //var d = 0;
        var d = level - 10;
        //console.log("in min",d,level);
        if( d < 0 ){
            d = 0;
        }
        $.ajax({
            url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d,
            async: false,
            dataType: 'json',
            success: function(){
                console.log('SUCCES');
                //console.log('level oud: ' + level);
                //console.log('level nieuw: ' + d);
                //console.log('idx: ' + idx);
                z_dimmer = d; //To show new value for ZWave dimmer
                z_whichdimmer = idx; //Only show new value for dimmer which was pressed
                //console.log('waarde: ' + z_dimmer);
                //console.log('idx: ' + z_whichdimmer);
            },
            error: function(){
                console.log('ERROR');
            }
        });
    }
//sleep(3000);        
RefreshData();
}
	
// blinds percentage
function BlindChangeStatus(OpenDicht,level,idx)
{
    if (OpenDicht == "plus") {
        //var d = 0;
        var d = level + 10;
        if(d > 100) {
            d = 100;
        }
        $.ajax({
            url: $.domoticzurl + "/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d,
            async: false,
            dataType: 'json',
            success: function(){
                console.log('SUCCES');
                //console.log('level oud: ' + level);
                //console.log('level nieuw: ' + d);
                //console.log('idx: ' + idx);
                //o_dimmer = d; //To show new value for dimmer
                //o_whichdimmer = idx; //Only show new value for dimmer which was pressed
                //console.log('waarde: ' + o_dimmer);
                //console.log('idx: ' + o_whichdimmer);
            },
            error: function(){
                console.log('ERROR');
            }
        });
    } else {
        var d = level - 10;
        //console.log("in min",d,level);
        if( d < 0 ) {
            d = 0;
        }
        $.ajax({
            url: $.domoticzurl + "/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d,
            async: false,
            dataType: 'json',
            success: function(){
                console.log('SUCCES');
                //console.log('level oud: ' + level);
                //console.log('level nieuw: ' + d);
                //console.log('idx: ' + idx);
                //o_dimmer = d; //To show new value for ZWave dimmer
                //o_whichdimmer = idx; //Only show new value for dimmer which was pressed
                //console.log('waarde: ' + o_dimmer);
                //console.log('idx: ' + o_whichdimmer);
            },
            error: function(){
                console.log('ERROR');
            }
        });
    }
    //sleep(3000);
    RefreshData();
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
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
        url: $.domoticzurl+"/json.htm?type=command&param=udevice" + "&idx=" + idx + "&nvalue=0&svalue=" + newvalue,
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
	
	
//Volume up of Sonos
function ChangeVolumeUp(idx)
{
	$.ajax({
	    url: "sonos/index.php?zone=" + idx + "&action=VolumeUp",
        async: true,
        dataType: 'html', //was json but that always gave an error although it's working
        success: function(){
            console.log('Volume up');
        },
        error: function(){
            console.log('ERROR');
        }
	});
	RefreshData();
}

//Volume down of Sonos
function ChangeVolumeDown(idx)
{
	$.ajax({
        url: "sonos/index.php?zone=" + idx + "&action=VolumeDown",
        async: true,
        dataType: 'html',
        success: function(){
            console.log('Volume down');
        },
        error: function(){
            console.log('ERROR');
        }
	});
	RefreshData();
}
	
//Change radio of Sonos
function ChangeRadio(idx)
{
	$.ajax({
        url: "sonos/index.php?zone=" + idx + "&action=NextRadio",
        async: true,
        dataType: 'html',
        success: function(){
            console.log('Next radio station');
        },
        error: function(){
            console.log('ERROR');
        }
	});
	RefreshData();
	}
	
//Change radio of Sonos
function ChangeRadioPrev(idx)
{
	$.ajax({
        url: "sonos/index.php?zone=" + idx + "&action=PrevRadio",
        async: true,
        dataType: 'html',
        success: function(){
            console.log('Previous radio station');
        },
        error: function(){
            console.log('ERROR');
        }
	});
	RefreshData();
	}
	
//Next song of Sonos
function ChangeNextSong(idx)
{
	$.ajax({
        url: "sonos/index.php?zone=" + idx + "&action=Next",
        async: true,
        dataType: 'html',
        success: function(){
            console.log('Next radio station');
        },
        error: function(){
            console.log('ERROR');
        //console.log('idx: ' + idx);
        }
	});
	RefreshData();
}
	
//Previous song of Sonos
function ChangePreviousSong(idx)
{
	$.ajax({
        url: "sonos/index.php?zone=" + idx + "&action=Previous",
        async: true,
        dataType: 'html',
        success: function(){
            console.log('Next radio station');
        },
        error: function(){
            console.log('ERROR');
        }
	});
	RefreshData();
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
   
   var ret_str = day + " " + datum + " " + month + " " + year + "<br />" + h + ":" + m + "";
   return ret_str;
}

