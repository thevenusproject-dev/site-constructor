<?php
/*
The Venus Project Site Structure Builder
Authored by [SC]Smash3r for Venus Project activism needs
Content generated from: https://github.com/thevenusproject-dev
Tip: If you want to use it on your own host, start by launching this file with read/write permissions. It will compile and prepare all the stuff, including latest backup.
If you have any questions, feel free to read project's WIKI.
For other questions use official TVP TeamSpeak server.
*/

/* ----------------------------------- OPTIONS & FUNCTIONS -----------------------------------*/

// Assigning links to grab files from
$site_constructor_repo = 'https://api.github.com/repos/thevenusproject-dev/site-constructor';
$database_repo = 'https://api.github.com/repos/thevenusproject-dev/database';
$site_zip = 'https://github.com/thevenusproject-dev/site-constructor/archive/master.zip';
$database_branches = 'https://api.github.com/repos/thevenusproject-dev/database/branches';

// Necessary function to parse pages
function builder_curl_get($url, $is_json=0) {
  $uagent = "The Venus Project Crawler/1.0 (http://thevenusproject.com)";
  $ch = curl_init( $url );

  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
  curl_setopt($ch, CURLOPT_ENCODING, "");     
  curl_setopt($ch, CURLOPT_USERAGENT, $uagent);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);
  curl_setopt($ch, CURLOPT_TIMEOUT, 15);
  curl_setopt($ch, CURLOPT_MAXREDIRS, 1);
  curl_setopt($ch, CURLOPT_HEADER, FALSE);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

  $content = curl_exec( $ch );
  $err     = curl_errno( $ch );
  $errmsg  = curl_error( $ch );
  $header  = curl_getinfo( $ch );
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $totaltime = curl_getinfo($ch, CURLINFO_TOTAL_TIME);
  curl_close( $ch );

  $header['errno']   = $err;
  $header['errmsg']  = $errmsg;
  $header['http_code'] = $httpCode;
  
	if ($is_json) {
		$header['content'] = json_decode($content);
	} else {
		$header['content'] = $content;
	}
  echo '<pre>',print_r($header,1),'</pre>'; // For debugging purposes
  return $header;
}

// Gets the contents of a file if it exists, otherwise grabs and caches
function builder_check_file_hash($file, $hash) {
	$current_time = time();
	$expire_time = 24 * 60 * 60;
	$file_time = filemtime($file);

	if(file_exists($file) && ($current_time - $expire_time < $file_time)) {
		return json_decode(file_get_contents($file));
	} else {
		$json = array();
		file_put_contents($file,json_encode($json));
		return $content;
	}
}

/* ----------------------------------- BUILD PROCESS -----------------------------------*/

// Starting the timer =)
$time_start = microtime(true);

// Get our database branches to show, if someone will want a local backup aside from GitHub
$db_backup = builder_curl_get($database_branches, 1);

// Grab, save and include all the necessary PHP files
$php_files = builder_curl_get($site_constructor_repo.'/contents/php', 1);

foreach ($php_files['content'] as $php_file) {
	$php_raw = builder_curl_get('https://raw.githubusercontent.com/thevenusproject-dev/site-constructor/master/'.$php_file->path);
	
	$dir = 'php';
	if (!file_exists($dir)) mkdir ($dir, 0744);
	file_put_contents($php_file->path, $php_raw['content']);
	if ($php_file->path[5] == '_') {
		include($php_file->path);
	}
}

// Now we have all the needed files included. Let's start to gather GitHub files and build our visual part :)


// Display Script End time
$time_end = microtime(true);
$execution_time = $time_end - $time_start;
echo '<b>Done.</b> Total execution time: '.$execution_time.' sec.<br />';

// Display links on backup files to download on user's local machine. User can choose all of them or select particular language branch to save.
echo 'Also you can <a href="'.$site_zip.'">download zipped site archive</a> as a backup to your local computer.<br />';

foreach ($db_backup['content'] as $lang_branch) {
	echo '+ <a href="https://github.com/thevenusproject-dev/database/archive/'.$lang_branch->name.'.zip">Download <b>'.$lang_branch->name.'</b> database branch</a><br />';
}


// Finally, rewrite build.php filename to prevent other users from manual execution. This is not so necessary to do, cause I think there will be only one main site - but who knows how the things can be turned?
$date = date_create();
$timestamp = date_timestamp_get($date);
rename('build.php', 'build_'.$timestamp.'.php');