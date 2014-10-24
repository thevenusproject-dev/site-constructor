The Venus Project Site Assets
===============
[![The Venus Project](http://civilisation2.org/wp-content/uploads/2012/03/topTVPlogo.png)](http://thevenusproject.com)

## EN
>This repo contains all the necessary links to script files and chunks of code, which are then used by a single construct file `build.php` to compile site's frontend, using current server environment.
> #####How this works?
> The `build.php` file makes an API request, collecting all the necessary information from received callback. It then saves all the requested data to the current user's hosting, checking for files `sha` hashes. The `build.php` file then receives new timestamp to rewrite default filename, hiding it from outer eyes. Futher requests to new `build_{timestamp}.php` will do API request again, checking for changed hashes, and if any were found - the script will replace file with its newer version.

## RU
>В данном репозитории хранятся все необходимые ссылки на блоки скриптов и исполняемого кода, которые впоследствии единоразово собираются файлом-конструктором `build.php` и собирают сайт в текущей среде.
> #####Как это работает?
> Файл `build.php` делает запрос к API и собирает всю необходимую информацию из массива данных, скачивая файлы на хостинг и сверяя их с `sha` хэшем. Затем, файл `build.php` получает новую, конечную маркировку таймштампа. Впоследствии, при повторном запросе в файлу `build_{timestamp}.php` происходит проверка хэшей, и если хэш файла отличается от хэша файла в репозитории, то он обновляется. Остальные файлы не затрагиваются, только если не были физически удалены (в этом случае структура восстанавливается снова).
