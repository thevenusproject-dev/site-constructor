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
$raw_github = 'https://raw.githubusercontent.com';
$api_github = 'https://api.github.com';
$site_constructor_repo = $api_github.'/repos/thevenusproject-dev/site-constructor';
$database_repo = $api_github.'/repos/thevenusproject-dev/database';
$database_branches = $api_github.'/repos/thevenusproject-dev/database/branches';
$site_zip = 'https://github.com/thevenusproject-dev/site-constructor/archive/master.zip';
$style_filename = 'style.min.css';

// Necessary function to parse pages
function builder_curl_get($url, $is_json=0, $data='') {
  $uagent = "The Venus Project Crawler/1.0 (http://thevenusproject.com)";
  $ch = curl_init( $url );

  if (!empty($data)) {
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
  }
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
  
  if ($errmsg or $err) {
	die('[GitHub] '.$errmsg.' ('.$err.'). Please recompile or try later.');
  }
	if ($is_json) {
		$header['content'] = json_decode($content);
		echo '<pre>',print_r($header,1),'</pre>'; // For debugging purposes
	} else {
		$header['content'] = $content;
	}
  return $header;
}

/* ----------------------------------- BUILD PROCESS [PARSE] ----------------------------------- */

// Starting the timer, setting the date =)
$time_start = microtime(true);
$date = date_create();
$timestamp = date_timestamp_get($date);

// Grab js files from the list
$js_files = builder_curl_get($site_constructor_repo.'/contents/js', 1);

foreach ($js_files['content'] as $js_file) {
	
	if (strpos($js_file->path, '.json') === false) {
		$js_additional_files_array[] = $raw_github.'/thevenusproject-dev/site-constructor/master/'.$js_file->path;
	} else {
		$js_raw = builder_curl_get($raw_github.'/thevenusproject-dev/site-constructor/master/'.$js_file->path, 1);
		foreach ($js_raw['content']->scripts as $js_script_info) {
			$js_files_array[] = $js_script_info->link;
		}
	}
	
}

// Get our database branches to show after compilation - in case if someone will want a local backup aside from GitHub
$db_backup = builder_curl_get($database_branches, 1);

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

$varholders = array(
	'##JSLOCATION##',
	'##FAVICONSRC##',
	'##STYLECSSNAME##',
);

$actual_vars = array(
	$js_cache_filename,
	$favicon_src,
	$style_filename
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

foreach ($db_backup['content'] as $lang_branch) {
	echo '+ <a href="https://github.com/thevenusproject-dev/database/archive/'.$lang_branch->name.'.zip">Download <b>'.$lang_branch->name.'</b> database branch</a><br />';
}

// Finally, rewrite build.php filename to prevent other users from manual execution. This is not so necessary to do, cause I think there will be only one main site - but who knows how the things can be turned?
//rename('build.php', 'build_'.$timestamp.'.php');