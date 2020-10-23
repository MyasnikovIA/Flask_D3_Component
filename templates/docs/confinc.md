# Файл настроек системы D3

Файл настроек хранится в папке /Etc/conf.inc

## Основные настройки

* DatabaseName - строка соединения к серверу базы данных вида ```pgsql:host=localhost;port=5432;dbname=d3;user=user;password=password```
* debug - режим отладки. 0 - отладка отключена, 1 - вывод минимума сообщений отладки, 2 - вывод всех сообщения отладки
* Theme - тема сайта
* CheckUpdDBLocal - проверка подключения к localhost при запуске d3dev updatedb
