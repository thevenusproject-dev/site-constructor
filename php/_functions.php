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
?>
