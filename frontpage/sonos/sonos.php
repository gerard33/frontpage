<?php


class Sonos
{
	protected $_config;
	protected $_PHPSonos;
        protected $_zone_ip;

	function __construct()
	{
		$this->_getConfig();
		$this->_main();
	}
	
	protected function _getConfig()
	{
		if (file_exists('config.php')) 
		{
			include 'config.php';
			$this->_config = $config;
		}
		else
		{
			throw new Exception('Config File [config.php] does not exists.');
		}		
	}
	
	protected function _getPHPSonos()
	{
		if (file_exists($this->_config['filePhpSonos'])) 
		{
			include $this->_config['filePhpSonos'];
		}
		else
		{
			throw new Exception('File [PHPSonos.inc.php] does not exists.');
		}		
	}
	
	protected function _main()
	{
                if($this->_config['logging'])
                {
                        $this->_log();
                }
                
                //for compability with old script
                if(!empty($_GET['do']))
                {
                        $action = $_GET['do'];
                }
                else
                {
                        $action = !empty($_GET['action']) ? $_GET['action'] : '';
                }
                
		// handle zonenames in UTF-8
        	$zone = !empty($_GET['zone']) ? utf8_encode($_GET['zone']) : '';
		
		$this->_zone_ip = $this->_assertZone($zone);
		
		$this->_getPHPSonos();
		$this->_PHPSonos = new PHPSonos($this->_zone_ip);		
		
		$this->_assertAction($action);
        }
        
        protected function _assertZone($zone)
	{
		if(empty($zone))
		{
			throw new Exception('Missing zone');
		}
		
		if(!array_key_exists($zone, $this->_config['zones']))
		{
			throw new Exception('Zone [' . $zone . '] does not exist');
		}
                
		return $this->_config['zones'][$zone];
	}
	
	protected function _assertAction($action)
	{
		if(empty($action))
		{
			throw new Exception('Missing action');
		}
		
		$funcName = "_action" . ucfirst($action);
		if (method_exists($this, $funcName)) 
		{
			$this->$funcName();
		}
                else
                {
                        throw new Exception('Action [' . $action . '] does not exist');
                }
	}
        
        protected function _assertPlayMode($playMode)
        {
                $playModes =  array(
                        'REPEAT_ALL', 
                        'SHUFFLE', 
                        'NORMAL',
                );
                
		if(empty($playMode))
		{
			throw new Exception('Missing PlayMode');
		}
		
		if(!in_array($playMode, $playModes))
		{
			throw new Exception('PlayMode [' . $playMode . '] does not exist');
		}
		return $playMode;          
        }
        
        protected function _assertNumeric($number)
        {
                if(!is_numeric($number))
                {
                        throw new Exception($number . ' is NOT numeric');
                }
                
                return $number;
        }
	
	protected function _actionGetMediaInfo()
	{
		$this->_out($this->_PHPSonos->GetMediaInfo());
	}

        protected function _actionGetPositionInfo()
	{
                $this->_out($this->_PHPSonos->GetPositionInfo());
        }
    
        protected function _actionGetTransportSettings()
	{
                $this->_out($this->_PHPSonos->GetTransportSettings());
        }
        
        protected function _actionGetTransportInfo()
	{
                $this->_out($this->_PHPSonos->GetTransportInfo()); //1: PLAYING, 2: PAUSED, 3: STOPPED
        }
        
        protected function _actionGetVolume()
	{
                $this->_out($this->_PHPSonos->GetVolume());
        }
        
        protected function _actionMute()
	{
                if($_GET['mute'] == 'false')
                {
                        $this->_PHPSonos->SetMute(false);
                }
                else if($_GET['mute'] == 'true')
                {
                        $this->_PHPSonos->SetMute(true);
                }
                else
                {
                        throw new Exception('wrong Mute');
                }                       
        }       
        
        protected function _actionNext()
	{
                $this->_PHPSonos->Next();
        }
        
        protected function _actionPause()
	{
                $this->_PHPSonos->Pause();
        }  
        
        protected function _actionPlay()
	{
                $this->_PHPSonos->Play();
        }  
        
        protected function _actionStop()
	{
                $this->_PHPSonos->Stop();
        }         
        
        protected function _actionTogglePlayStop()
	{
                if($this->_PHPSonos->GetTransportInfo() == 1)
                {
                        $this->_PHPSonos->Stop();
                }
                else
                {
                        $this->_PHPSonos->Play();
                }                
        }  
        
        protected function _actionPlayMode()
	{
                $playMode = $this->_assertPlayMode($_GET['playMode']);
                $this->_PHPSonos->SetPlayMode($playMode);
        }
        
        protected function _actionPrevious()
	{
                $this->_PHPSonos->Previous();
        }  
        
        protected function _actionRewind()
	{
                $this->_PHPSonos->Rewind();
        }  
        
        protected function _actionRemove()
	{
                $track = $this->_assertNumeric($_GET['track']);
                $this->_PHPSonos->RemoveFromQueue($track);
        }          
        
        protected function _actionVolume()
	{
                $volume = $this->_assertNumeric($_GET['volume']);
                
                if($volume < 0 | $volume > 100)
                {        
                        throw new Exception('Volume out of range');
                }       
                
                $this->_PHPSonos->SetVolume($volume);
        }  
        
        protected function _actionVolumeUp()
	{
                $volume = $this->_PHPSonos->GetVolume();
                
                if($volume < 100)
                {
                        if ($volume == 0 or $volume == 1) {
							$volume += 1;
							$this->_PHPSonos->SetVolume($volume);
						} elseif ($volume % 2 == 0) { // volume is even
							$volume += 2;
							$this->_PHPSonos->SetVolume($volume);
						} else { //volume is odd
							$volume += 1;
							$this->_PHPSonos->SetVolume($volume);
						}
                }     
        } 
        
        protected function _actionVolumeDown()
	{
                $volume = $this->_PHPSonos->GetVolume();
                
                if($volume > 0)
                {
                        if ($volume == 2) {
							$volume -= 1;
							$this->_PHPSonos->SetVolume($volume);
						} elseif ($volume % 2 == 0) { // volume is even
							$volume -= 2;
							$this->_PHPSonos->SetVolume($volume);
						} else { //volume is odd
							$volume -= 1;
							$this->_PHPSonos->SetVolume($volume);
						}
                }     
        } 
        
        protected function _actionNextRadio()
        {
                $radioStations = $this->_config['radiostations'];
				$currentRadio = $this->_currentRadio();

                foreach ($radioStations as $key => $value) 
                {
                        if($key == $currentRadio)
                        {
                                $nextRadioUrl = next($radioStations);
                                $nextRadio    = key($radioStations);
                                
                                //if last element catched, move to first element
                                if(!$nextRadioUrl)
                                {
                                        $nextRadioUrl = reset($radioStations);
                                        $nextRadio    = key($radioStations);
                                }
                                break;
                        }
                        else
                        {
                                next($radioStations);
                        }
                }
                
                $this->_saveCurrentRadio($nextRadio);
                $this->_PHPSonos->SetRadio("x-rincon-mp3radio://$nextRadioUrl", $nextRadio);
                $this->_PHPSonos->Play();
				print_r($nextRadio);
        }

		protected function _actionPrevRadio()
        {
                $radioStationsP = array_reverse($this->_config['radiostations']);
				$currentRadioP = $this->_currentRadio();
                
				foreach ($radioStationsP as $key => $value) 
                {
						if($key == $currentRadioP)
                        {
                                $nextRadioUrlP = current($radioStationsP);
                                $nextRadioP    = key($radioStationsP);
								
                                //if last element catched, move to first element
                                if(!$nextRadioUrlP)
                                {
                                        $nextRadioUrlP = reset($radioStationsP);
                                        $nextRadioP    = key($radioStationsP);
                                }
                                break;
                        }
                        else
                        {
								next($radioStationsP);
                        }
                }
                
                $this->_saveCurrentRadio($nextRadioP);
                $this->_PHPSonos->SetRadio("x-rincon-mp3radio://$nextRadioUrlP", $nextRadioP);
                $this->_PHPSonos->Play();
				print_r($nextRadioP);
        }
				
		/*Added, to be updated */
		protected function _action538()
        {
                $this->_PHPSonos->SetRadio("x-rincon-mp3radio://vip-icecast.538.lw.triple-it.nl/RADIO538_MP3", "538");
                $this->_PHPSonos->Play();
        }
		protected function _actionQmusicns()
        {
                $this->_PHPSonos->SetRadio("x-rincon-mp3radio://icecast-qmusic.cdp.triple-it.nl/Qmusic_nl_nonstop_96", "QMusic Nonstop");
                $this->_PHPSonos->Play();
        }
        /*Added, to be updated */
				
        /**
         * save current music status, play predefined message, restore previous status
         * messages have to be stored in filesystem at $config['messagePath]
         * filename has to be the messageId, extension: mp3
         * 
         * url parameters:
         * int $messageId: number for the message to play
         *      1 = washer is ready, currently only in german: die Waschmaschine ist fertig         
         *      2 = dryer is ready, currently only in german: der Trockner ist fertig    
         *
         * int $volume volume for the message to play
         *
         * to build voice messages, visit: http://www2.research.att.com/~ttsweb/tts/demo.php     
		 * OR
		 * Play a TTS message through Google API in several languages.
		 * @param string message words to be played separated by spaces
		 * @param string lang language to be used to override default setting in config file
         */        
        protected function _actionSendMessage()
	{
		// allow calls without messageId
		$messageId = !empty($_GET['messageId']) ? $_GET['messageId'] : '0';
		$messageId = $this->_assertNumeric($messageId);

                $volume   = $this->_assertNumeric($_GET['volume']);

		// handle TTS message
		$message  = !empty($_GET['message']) ? $_GET['message'] : '';        
		if (($messageId == '0') && ($message != ''))
		{
			// allow use of specified language instead of configured one
			$lang     = !empty($_GET['lang']) ? $_GET['lang'] : $this->_config['messageLang'];
		 
			$message  = urlencode($message); //TODO limit to match API < 100 characters and clean out non alphabetical charachters
			$filename     = $message;
			$file = $this->_config['messageStorePath'] . $filename;
			$file_to_search = $this->_config['messageRelativePath'] . $filename. '.mp3'; //added this because otherwise the file isn't searched in the right way
			//echo "$file_to_search";
			//echo "<br>";
			
			// if message already exists, don't make a call too Google
			//if (!file_exists($file . '.mp3')) //commented out, this is not the right way to search
			if (!file_exists($file_to_search))
			{
				echo "<br>";
				echo "<div style ='font:14px Arial,tahoma,sans-serif;color:black'>File doesn't exist, make a new file</div>";
				ini_set('user_agent', 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36');
				/* Changed */
				//$audio = file_get_contents('http://translate.google.com/translate_tts?ie=UTF-8&q=' . $message . '&tl=' . $lang);
				//$audio = file_get_contents('http://translate.google.com/translate_tts?tl=' . $lang . '&q=' . $message . '&ie=UTF-8&total=1&idx=0&client=Mozilla');
				//$audio = file_get_contents('http://translate.google.com/translate_tts?ie=UTF-8&q=' . $message . '&tl=' . $lang . '&client=t');
				//curl 'http://translate.google.com/translate_tts?ie=UTF-8&q=Hello&tl=en&client=t' -H 'Referer: http://translate.google.com/' -H 'User-Agent: stagefright/1.2 (Linux;Android 5.0)' > google_tts.mp3
				//Google TTS not working from PHP
				//www.voicerss.org
				$api_key = $this->_config['tssapikey'];
				$audio = file_get_contents('https://api.voicerss.org/?key=' . $api_key . '&c=mp3&f=16khz_8bit_mono&hl=nl-nl&r=0&src=' .$message);
				//echo "$audio";
				/* End changed */
				//file_put_contents($file . '.mp3', $audio);
				file_put_contents($file_to_search, $audio);
			}
			// rewrite the TTS filename into messageId for play
			$messageId = $filename;
		}
                
                // save informations 
                $saveVolume       = $this->_PHPSonos->GetVolume();
				$savePositionInfo = $this->_PHPSonos->GetPositionInfo();
                $saveMediaInfo    = $this->_PHPSonos->GetMediaInfo();
				/* Changed */
				//$savePositionInfo_print = $this->_outflat($this->_PHPSonos->GetPositionInfo()); //to show information in normal layout not in array
                //$saveMediaInfo_print    = $this->_outflat($this->_PHPSonos->GetMediaInfo()); //to show information in normal layout not in array
				/* End changed */
				//echo "Volume: $saveVolume";
				//echo "Postion info: $savePositionInfo";
				//echo "Media info: $saveMediaInfo";
				
                //$radio            = (strpos($saveMediaInfo['CurrentURI'], "x-sonosapi-stream:")) !== false; //works only for Sonos app radio stations
				$radio            = (strpos($saveMediaInfo['CurrentURI'], "x-")) !== false; //playlist in php starts with x-rincon-mp3radio
												
                $oldti = $this->_PHPSonos->GetTransportInfo();

                // set AVT to message
                $this->_PHPSonos->SetVolume($volume);
                $this->_PHPSonos->SetAVTransportURI('x-file-cifs:' . $this->_config['messagePath'] . $messageId . '.mp3');
                $this->_PHPSonos->Play();
				echo "<br>";
				echo "<div style ='font:14px Arial,tahoma,sans-serif;color:black'>Played: $message</div>";
				
                // wait until message is done
                while ($this->_PHPSonos->GetTransportInfo() == '' || $this->_PHPSonos->GetTransportInfo() == 1) 
                {
                        sleep(1);
                }

                // set old queue 
                if ($radio) 
                {
                        $this->_PHPSonos->SetRadio($saveMediaInfo['CurrentURI'], $saveMediaInfo['title']);
                } 
                else 
                {
                        $this->_PHPSonos->SetAVTransportURI($saveMediaInfo['CurrentURI'], $saveMediaInfo['CurrentURIMetaData']);
                }
                
                try 
                {
                        // seek TRACK_NR 
                        $this->_PHPSonos->Seek("TRACK_NR", $savePositionInfo['Track']);
                        // seek REL_TIME 
                        $this->_PHPSonos->Seek("REL_TIME", $savePositionInfo['RelTime']);
                } 
                catch (Exception $e) 
                {
                        
                }
                
                // play if previous list was playing 
                if ($oldti == 1)
                {
                        $this->_PHPSonos->Play();
                }
                
                $this->_PHPSonos->SetVolume($saveVolume);
        } 
        
        protected function _log()
        {
                $content = date("d.m.Y - H:i:s") . ' ' . $_SERVER['REQUEST_URI'] . "\r\n";
                $handle = fopen ($this->_config['logfile'], 'a');
                fwrite ($handle, $content);
                fclose ($handle);                
        }
        
        protected function _saveCurrentRadio($radio)
        {
                if(!touch($this->_config['currentRadio']))
                {
                        throw new Exception('No permission to write to ' . $this->_config['currentRadio']);
                }
                
                $handle = fopen ($this->_config['currentRadio'], 'w');
                fwrite ($handle, $radio);
                fclose ($handle);                
        }    
        
        protected function _currentRadio()
        {
                if(!touch($this->_config['currentRadio']))
                {
                        throw new Exception('Could not open ' . $this->_config['currentRadio']);
                }
                
                $currentRadio = file($this->_config['currentRadio']);
                
                if(empty($currentRadio))
                {
                        $radiostations = $this->_config['radiostations'];
                        reset($radiostations);
                        $currentRadio[0] = key($radiostations);
                        $this->_saveCurrentRadio($currentRadio[0]);
                }
                
                return $currentRadio[0];
        }

        protected function _getStatus($zoneplayerIp)
        {
                $url = "http://" . $zoneplayerIp . ":1400/status/zp";
                $xml = simpleXML_load_file($url);  
                return $xml->ZPInfo->LocalUID;  
        }

	
	protected function _out($data)
	{
		//commented out
		//echo '<PRE>';
		//print_r($data);
		//echo '</PRE>';
		//done this to give an array output which can be read in JSON
		//commented out
		$js_array = json_encode($data);
		print_r($js_array);
	}

	protected function _outflat($data)
	{
		//give data in standard output so TTS will recognize the current playing
		echo '<PRE>';
		print_r($data);
		echo '</PRE>';
	}	
}
?>
