<?php
/*
Based on Singularity by Christopher J. Su
Modified by [SC]Smash3r for Venus Project activism needs
Generated from: https://github.com/thevenusproject-dev
*/

define('ROOT_DIR', realpath(dirname(__FILE__)) .'/');
define('CONTENT_DIR', ROOT_DIR .'content/');

// Options
$script_location = "assets/script.js";
$theme = "venus";
$file_format = ".md";

$url = '';
$request_url = (isset($_SERVER['REQUEST_URI'])) ? $_SERVER['REQUEST_URI'] : '';
$script_url  = (isset($_SERVER['PHP_SELF'])) ? $_SERVER['PHP_SELF'] : '';
	
// Get our url path and trim the / of the left and the right
if($request_url != $script_url) $url = trim(preg_replace('/'.str_replace('/', '\/', str_replace('index.php', '', $script_url)) .'/', '', $request_url, 1), '/');

// Get the file path
if($url) $file = strtolower(CONTENT_DIR.$url);
else $file = CONTENT_DIR.'index';

// Load the file
if(is_dir($file)) $file = CONTENT_DIR.$url.'/index'.$file_format;
else $file .= $file_format;

// Show 404 if file cannot be found
if(file_exists($file)) $content = file_get_contents($file);
else $content = file_get_contents(CONTENT_DIR .'404' . $file_format);

// Template
?>
<!DOCTYPE html>
<html>
	<head>
	<link rel="icon" type="image/x-icon" href="favicon.png">
		<title><?php echo ucwords(strtolower($url)); ?></title>
	</head>
		<xmp theme="<?php echo $theme; ?>" style="display:none;">
			<?php echo $content; ?>
		</xmp>
	<script src="<?php echo $script_location; ?>"></script>
</html>