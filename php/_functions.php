<?php
/*
  Function: createKey
  Generates a random sequence of characters.

  Parameters:
  $length - Length of key to generate.
  $option - Change the character set.

  Returns:
  The generated key.

  Example Usage:
  > $new_key = createKey(1024);
*/
function createKey($length, $option=0) {
    if ($option == 1)
    {
        $chars = "th3venuspr0ject15now_42";
    }
    else
    {
        $chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
    }
	
    $i = 0;
    $key = '' ;

    while ($i < $length)
    {
        $num = mt_rand() % (strlen($chars) - 1);
        $tmp = substr($chars, $num, 1);
        $key = $key . $tmp;
        $i++;
    }
    return $key;
}
/*
  Function: detect_locale
  Detects user's locale. Defaults to english, if failed to get. Needed for multilanguage site.
*/
function detect_locale() {
    if(isset($_SESSION["lang"])){
        $lang = $_SESSION["lang"];
        return $lang;
    }
    if(isset($_SESSION["id"])){
        $user = new User($_SESSION["id"]);
        $lang = $user->get_locale();
        return $lang;
    }
    if(isset($_SERVER["HTTP_ACCEPT_LANGUAGE"])){
        $lang = substr($_SERVER["HTTP_ACCEPT_LANGUAGE"], 0, 2);
        return $lang;
    }
    $lang = "en";
    return $lang;
}
/*
  Class: scanDir
  http://php.net/manual/ru/function.scandir.php#114184
*/

class scanDir {
    static private $directories, $files, $ext_filter, $recursive;

// ----------------------------------------------------------------------------------------------

    // scan(dirpath::string|array, extensions::string|array, recursive::true|false)
    static public function scan(){
        // Initialize defaults
        self::$recursive = false;
        self::$directories = array();
        self::$files = array();
        self::$ext_filter = false;

        // Check we have minimum parameters
        if(!$args = func_get_args()){
            die("Must provide a path string or array of path strings");
        }
        if(gettype($args[0]) != "string" && gettype($args[0]) != "array"){
            die("Must provide a path string or array of path strings");
        }

        // Check if recursive scan | default action: no sub-directories
        if(isset($args[2]) && $args[2] == true){self::$recursive = true;}

        // Was a filter on file extensions included? | default action: return all file types
        if(isset($args[1])){
            if(gettype($args[1]) == "array"){self::$ext_filter = array_map('strtolower', $args[1]);}
            else
            if(gettype($args[1]) == "string"){self::$ext_filter[] = strtolower($args[1]);}
        }
		
		// Unlink old stuff (this code should not be here :B)
		$mask = 'js/venus_*.*';
		array_map('unlink', glob($mask));
		
        // Grab path(s)
        self::verifyPaths($args[0]);
        return self::$files;
    }

    static private function verifyPaths($paths){
        $path_errors = array();
        if(gettype($paths) == "string"){$paths = array($paths);}

        foreach($paths as $path){
            if(is_dir($path)){
                self::$directories[] = $path;
                $dirContents = self::find_contents($path);
            } else {
                $path_errors[] = $path;
            }
        }

        if($path_errors){echo "The following directories are not existing<br />";die(var_dump($path_errors));}
    }
	
	
    // This is how we scan directories
    static private function find_contents($dir){
        $result = array();
        $root = scandir($dir);
        foreach($root as $value){
            if($value === '.' || $value === '..') {continue;}

            if(is_file($dir.DIRECTORY_SEPARATOR.$value)){
                if(!self::$ext_filter || in_array(strtolower(pathinfo($dir.DIRECTORY_SEPARATOR.$value, PATHINFO_EXTENSION)), self::$ext_filter)){
                    self::$files[] = $result[] = $dir.DIRECTORY_SEPARATOR.$value;
                }
                continue;
            }
            if(self::$recursive){
				$recs = self::find_contents($dir.DIRECTORY_SEPARATOR.$value);
				if ($recs) {
					foreach($recs as $value) {
						self::$files[] = $result[] = $value;
					}
				}
            }
        }
		
		// Here we are working with subdirs (max. depth 4). Code is pretty crappy, but it does the job xD
		foreach ($result as $rpath) {
			$d = explode(DIRECTORY_SEPARATOR,$rpath);
			$contents = file_get_contents($rpath);
			foreach (self::$ext_filter as $ext) {
				if (strpos($rpath,'.'.$ext) !== false) {
					if (count($d) == 1) {
						$arr[$d[0]] = json_decode($contents);
						echo $d[0];
					}
					if (count($d) == 2) {
						$val = str_replace('.'.$ext,'',$d[1]);
						$arr[$val][$d[0]] = json_decode($contents);
					}
					if (count($d) == 3) {
						$val = str_replace('.'.$ext,'',$d[2]);
						$arr[$d[1]][$d[0]][$val] = json_decode($contents);
					}
					if (count($d) == 4) {
						$val = str_replace('.'.$ext,'',$d[3]);
						$arr[$d[1]][$d[0]][$d[2]][$val] = json_decode($contents);
					}
				}
			}
		}
		
		// Write JSON
		if ($arr) {
			// Writing up new
			foreach ($arr as $k => $v) {
				$json = json_encode($v);
				$json = preg_replace_callback(
					'/\\\\u([0-9a-f]{4})/i',
					function ($matches) {
						$sym = mb_convert_encoding(
							pack('H*', $matches[1]),
							'UTF-8',
							'UTF-16'
						);
						return $sym;
					},
					$json
				);
				file_put_contents('js/venus_'.$k.'.js', 'var venus_db = '.$json.';', FILE_APPEND);
			}
		}
    }
}