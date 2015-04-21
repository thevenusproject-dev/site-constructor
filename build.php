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

set_time_limit (360);

// Assigning links to grab files from. This should not be changed.
$raw_github = 'https://raw.githubusercontent.com';
$api_github = 'https://api.github.com';
$site_constructor_repo = $api_github.'/repos/thevenusproject-dev/site-constructor';
$database_repo = $api_github.'/repos/thevenusproject-dev/database';
$database_repo_raw = $raw_github.'/thevenusproject-dev/database';
$database_branches = $api_github.'/repos/thevenusproject-dev/database/branches';
$tree = $api_github.'/repos/thevenusproject-dev/database/git/trees';
$site_zip = 'https://github.com/thevenusproject-dev/site-constructor/archive/master.zip';

// Minor stuff =) Don't change this, unless you know what you're doing (working with paths)
$style_filename = 'style.min.css';
$index_file = 'index.php';
$content_dir = 'content';
$hashes_dir = 'hashes';
$version = '1.0';

// Necessary function to parse pages
function builder_curl_get($url, $is_json=0, $data='') {

  // Assigning an array of proxies, since GitHub allows only 60 requests per hour (https://developer.github.com/v3/#rate-limiting)
  // I'm really apologizing for messing with proxies, guys, but I just can't see how to do it other way... Hope it won't hurt much :P
  // Use your own list of proxies, whoever will read this file and will want to generate a copy of TVP site from Git.
  // More files Git will have - more proxies we will need. Each file has it's SHA hash, so every build.php reload will only renew the structure with different SHA hashes.
  // 2 lines in this functions are commented, so you need to uncomment them in order to use this list. By default all the queries are limited to 60 using your current IP (that's still enough for now)

  $arrIP = array(
  '108.165.33.8:3128',
  '162.220.52.175:7808',
  '107.182.16.221:3127',
  '213.85.92.10:80',
  '37.239.46.50:80',
  '199.200.120.36:3127',
  '64.31.22.143:7808',
  '69.197.148.18:7808',
  '125.24.79.35:8080',
  '190.36.157.148:8080',
  '125.24.79.35:8080',
  '162.220.52.175:7808',
  '64.31.22.131:3127'
  );

  $uagent = "The Venus Project Crawler/1.0 (http://thevenusproject.com; https://github.com/scsmash3r) using proxy";
  $ch = curl_init( $url );
  $Key = rand(0, count($arrIP) - 1);
  $RandIP = $arrIP[$Key];

  if (!empty($data)) {
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
  }
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
  curl_setopt($ch, CURLOPT_ENCODING, "");     
  curl_setopt($ch, CURLOPT_USERAGENT, $uagent);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 60);
  curl_setopt($ch, CURLOPT_TIMEOUT, 360);
  curl_setopt($ch, CURLOPT_MAXREDIRS, 1);
  curl_setopt($ch, CURLOPT_HEADER, FALSE);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
  //curl_setopt($ch, CURLOPT_PROXY, $RandIP); 
  //echo '<span style="color:#f20">Using '.$RandIP.' to get <u>'.$url.'</u></span><br />';
  
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
  
  if ($errmsg or $err) {
	echo $errmsg.'<br /> <a href="javascript:location.reload();">Click here to continue process or wait 1hr and retry again...</a>';
	die();
  }
  
  
  if ($is_json) {
	$header['content'] = json_decode($content);
	echo '<pre>',print_r($header,1),'</pre>'; // For debugging purposes
  } else {
	$header['content'] = $content;
  }

  if ($header['content'] != '') {
	return $header;
  } else {
	die($errmsg);
  }
}

/* ----------------------------------- BUILD PROCESS [PARSE] ----------------------------------- */

// Starting the timer, setting the date =)
$time_start = microtime(true);
$date = date_create();
$timestamp = date_timestamp_get($date);

// Creating our content dir with index.php file
if (!file_exists($content_dir)) mkdir ($content_dir, 0744);
if (!file_exists($content_dir.'/'.$index_file)) file_put_contents($content_dir.'/'.$index_file, "<?php // Silence is golden. ?>");

// Creating hashes dir with index.php file
if (!file_exists($hashes_dir)) mkdir ($hashes_dir, 0744);
if (!file_exists($hashes_dir.'/'.$index_file)) file_put_contents($hashes_dir.'/'.$index_file, "<?php // Silence is golden. ?>");

// Get our database branches info
$db_structure = builder_curl_get($database_branches, 1); // 1 means format is JSON, 0 is raw text.

// Working with branches to get info + all the files. Alot of queries here
foreach ($db_structure['content'] as $lang_branch) {
	if (strlen($lang_branch->name) == 2) {
	
		$lang_branches[] = $lang_branch->name;
		$cdir = $content_dir.'/'.strtolower($lang_branch->name);
		$hdir = $hashes_dir.'/'.strtolower($lang_branch->name);
		if (!file_exists($cdir)) mkdir ($cdir, 0744); // Creating language dir, i.e. content/en
		if (!file_exists($hdir)) mkdir ($hdir, 0744); // Creating hashes dir, i.e. hashes/en

		// If hash is not changed in whole branch - we won't parse it again
		if (!file_exists($hdir.'/'.$lang_branch->commit->sha)) {
			file_put_contents($hdir.'/'.$lang_branch->commit->sha, '');
			
			// Getting all our branch structure recursively
			$db_lang_branch = builder_curl_get($tree.'/'.$lang_branch->commit->sha.'?recursive=1', 1);

			foreach ($db_lang_branch['content']->tree as $db_lang) {
				
				// Saving all the files on our host, creating folders and writing files
				if (!file_exists($hdir.'/'.$db_lang->sha)) {
					if ($db_lang->type == 'tree') {
						if (!file_exists($cdir.'/'.$db_lang->path)) mkdir ($cdir.'/'.$db_lang->path, 0744);
					}
					if ($db_lang->type == 'blob') {
						$raw_file = builder_curl_get($database_repo_raw.'/'.strtoupper($lang_branch->name).'/'.$db_lang->path);
							file_put_contents($cdir.'/'.strtolower($db_lang->path), convert_specials($raw_file['content']));
							file_put_contents($hdir.'/'.$db_lang->sha, '');
					}
				} else {
					echo '<span style="color:#2B3">'.$lang_branch->name.'/'.$db_lang->path.' hash already exists. Skipping...</span><br />';
				}
				
			}
			
		// If our branch hash is not changed - we're skipping all the process, cause there is no need to parse GitHub without purpose
		} else {
			echo $lang_branch->name.' branch is not changed!<br />';
		}
		
	}
}

$lang_branches_string = implode(",",$lang_branches);

// Grab js files from the list. If we have some script with 'inactive' parameter - we won't add it to main scripts pool
$js_files = builder_curl_get($site_constructor_repo.'/contents/js', 1);

foreach ($js_files['content'] as $js_file) {
	
	if (strpos($js_file->path, '.json') === false) {
		$js_additional_files_array[] = $raw_github.'/thevenusproject-dev/site-constructor/master/'.$js_file->path;
	} else {
		$js_raw = builder_curl_get($raw_github.'/thevenusproject-dev/site-constructor/master/'.$js_file->path, 1);
		foreach ($js_raw['content']->scripts as $js_script_info) {
			if (!isset($js_script_info->inactive)) {
				$js_files_array[] = $js_script_info->link;
			}
		}
	}
	
}

// Grab, save and include all the necessary PHP files
$php_files = builder_curl_get($site_constructor_repo.'/contents/php', 1);

foreach ($php_files['content'] as $php_file) {
	$php_raw = builder_curl_get($raw_github.'/thevenusproject-dev/site-constructor/master/'.$php_file->path);
	
	$dir = 'php';
	if (!file_exists($dir)) mkdir ($dir, 0744);
	if ($php_file->name != 'index.php') {
		file_put_contents($php_file->path, $php_raw['content']);
	} else {
		file_put_contents($php_file->path, "<?php // Silence is golden. ?>");
		$index_file_contents = $php_raw['content'];
	}
	
	// If our file has an _ at the beginning - we are including it in builder part
	if ($php_file->path[4] == '_') {
		include($php_file->path);
	}
}

// Get our CSS files and minify them using regexp
$css_files = builder_curl_get($raw_github.'/thevenusproject-dev/site-constructor/master/css/css.json', 1);

foreach ($css_files['content']->styles as $css_file) {
	$css_files_array[] = $css_file->link;
}

foreach ($css_files_array as $css_file_link) {
	$css = builder_curl_get($css_file_link);
	$css_buffer .= $css['content'];
}

// Now we have all the needed files included. Let's start to gather GitHub files and after that build our visual part :)
// Let's use our PHP wrapper for the Google Closure JS Compiler web service (https://developers.google.com/closure/compiler/) to compile all the needed JS files into one.
$js_files = array_merge($js_files_array,$js_additional_files_array);

$c = new PhpClosure();
$c->add_array($js_files)
  ->cacheDir("js/")
  ->write();

// CSS prepare: remove comments, space after colons, whitespace & combine everything into one file
$css_buffer = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $css_buffer);
$css_buffer = str_replace(': ', ':', $css_buffer);
$css_buffer = str_replace(array("\r\n", "\r", "\n", "\t", '  ', '    ', '    '), '', $css_buffer);

$dir = 'css';
if (!file_exists($dir)) mkdir ($dir, 0744);
file_put_contents($dir.'/'.$style_filename, $css_buffer);
$style_css_ver = filemtime($dir.'/'.$style_filename);
$style_filename = $style_filename.'?v='.$style_css_ver;

// Favicon?
$favicon_url = builder_curl_get($raw_github.'/thevenusproject-dev/site-constructor/master/favicon.png');
$favicon_data = base64_encode($favicon_url['content']);
$favicon_src = 'data:image/png;base64,'.$favicon_data;

// .htaccess
$htaccess_contents = 
'
AddDefaultCharset UTF-8
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d 
RewriteRule . index.php [L]
</IfModule>

# Prevent file browsing
Options -Indexes';

file_put_contents('.htaccess', $htaccess_contents);

/* ------------------------------ BUILD PROCESS [VISUAL PREPARE] ------------------------------- */

// Now to process our main index.php file
// We need to change some parts of index.php file in order to match our current environment
$js_cache_filename = str_replace('.js','_'.$timestamp.'.js',$c->_getCacheFileName());
rename($c->_getCacheFileName(),$js_cache_filename);

// Combine all the JSON files into one, assigning their filename+locale as an array name (very dirty solution)
scanDir::scan('content', 'json', true);

$varholders = array(
	'##JSLOCATION##',
	'##FAVICONSRC##',
	'##STYLECSSNAME##',
	'##AVAILABLE_BRANCHES##',
	'##VERSION##'
);

$actual_vars = array(
	$js_cache_filename,
	$favicon_src,
	$style_filename,
	$lang_branches_string,
	$version.'.'.$timestamp
);

$index_file_contents = str_replace($varholders,$actual_vars,$index_file_contents);
file_put_contents('index.php', $index_file_contents);

/* ------------------------------------ BUILD PROCESS [END] ------------------------------------ */
// Display Script End time
$time_end = microtime(true);
$execution_time = $time_end - $time_start;
echo '<b>Done.</b> Total execution time: '.$execution_time.' sec.<br />';

// Display links on backup files to download on user's local machine. User can choose all of them or select particular language branch to save.
echo 'Also you can <a href="'.$site_zip.'">download zipped site archive</a> as a backup to your local computer.<br />';

foreach ($db_structure['content'] as $lang_branch) {
	echo '+ <a href="https://github.com/thevenusproject-dev/database/archive/'.$lang_branch->name.'.zip">Download <b>'.$lang_branch->name.'</b> database branch</a><br />';
}

// Finally, rewrite build.php filename to prevent other users from manual execution. This is not so necessary to do, cause I think there will be only one main site - but who knows how the things can be turned?
//rename('build.php', 'build_'.$timestamp.'.php');