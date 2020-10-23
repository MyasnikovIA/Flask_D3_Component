D3 project environment (PHP, Apache, etc and D3 source) deploy instruction for Windows OS.
------------------------------------------------------------------------------------------
================================
ver. Radis V. for Windows 8.1.

1. Download PHP binary like this - PHP 5.6 (5.6.19) VC11 x86 Thread Safe - 
    [https://windows.php.net/downloads/releases/php-5.6.37-nts-Win32-VC11-x86.zip].
    I'm not used x64 because it experimental.

1. Download Apache binary like this - Apache 2.4.18 Win32 - 
    [https://home.apache.org/~steffenal/VC11/binaries/httpd-2.4.34-win32-VC11.zip].
    This binary recommendation in PHP windows download page - [http://windows.php.net/download/].
    You must use x86 like your PHP version.

1. If need you must install Microsoft Visual c++ 20xx Redistributable with versions like in PHP and Apache binary.
    php-5.6.19-Win32-VC11-x86.zip - VC11 - Microsoft Visual c++ 2012 Redistributable x86.
    httpd-2.4.18-win32-VC14.zip - VC14 - Microsoft Visual c++ 2015 Redistributable x86.

1. Read Install.txt file in PHP binary zip.
    Unzip PHP to c:\php folder how written in the PHP install.txt. I chose another place.

1. Read Install.txt file in Apache binary zip.
    Unzip Apache to c:\apache24 folder how written in the Apache install.txt. I chose another place.

1. Clone git D3 repository. Somebody recommends to put D3 to apache_root_folder/htdocs. I used another place.
    In D3 root folder add Extensions folder (first char must uppercase).
    To Extensions folder clone d3_ext git repository. 
    In this Extensions folder clone d3_agents, d3_editor, d3_nsi git repositories in agents, editor, nsi subfolders
     respectively.

1. Setup php_root_folder/php.ini and apache_root_folder/conf/httpd.conf.
    
    Apache24 httpd.conf diff relate default conf:
    
    Define SRVROOT "C:/DATA/ProgramFiles/apache24_x86"
    ServerRoot "${SRVROOT}"
    PHPIniDir "C:/DATA/ProgramFiles/php5_6_x86"
    LoadModule php5_module "C:/DATA/ProgramFiles/php5_6_x86/php5apache2_4.dll"
    AddHandler application/x-httpd-php .php
    ServerName localhost:80
    DocumentRoot "c:/Apache24/htdocs" to DocumentRoot "C:/DATA/workspace/projects/production/d3"
    \<Directory "c:/Apache24/htdocs"> to \<Directory "C:/DATA/workspace/projects/production/d3">
    AllowOverride None to AllowOverride All
    DirectoryIndex index.html to DirectoryIndex index.html index.php
    ScriptAlias /cgi-bin/ "c:/Apache24/cgi-bin/" to ScriptAlias /cgi-bin/ "${SRVROOT}/cgi-bin/"
    \<Directory "c:/Apache24/cgi-bin"> to \<Directory "${SRVROOT}/cgi-bin">
    Add block
    \<IfModule http2_module>
        ProtocolsHonorOrder On
        Protocols h2 h2c http/1.1
    \</IfModule>
    
   * Need comment:
   1. \#LoadModule access_compat_module modules/mod_access_compat.so
   * Need uncomment:
   1. LoadModule deflate_module modules/mod_deflate.so
   1. LoadModule filter_module modules/mod_filter.so
   1. LoadModule info_module modules/mod_info.so
   1. LoadModule rewrite_module modules/mod_rewrite.so
   1. LoadModule socache_shmcb_module modules/mod_socache_shmcb.so
   1. LoadModule ssl_module modules/mod_ssl.so
   1. LoadModule status_module modules/mod_status.so
   1. Include conf/extra/httpd-autoindex.conf
   1. Include conf/extra/httpd-info.conf
   1. Include conf/extra/proxy-html.conf
    
    If add Include conf/extra/httpd-ssl.conf to \<IfModule ssl_module> block
    need setup conf/extra/httpd-ssl.conf file.
    
    PHP php.ini conf:
    
    error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT add & ~E_NOTICE
    error_log = "C:\DATA\ProgramFiles\php5_6_x86_error_log\php5_6_x86_error_log.log"
    extension_dir = "C:\DATA\ProgramFiles\php5_6_x86\ext"
    date.timezone = Europe/Moscow
    
    Need uncomment:
    extension=php_gd2.dll
    extension=php_mbstring.dll
    extension=php_pdo_pgsql.dll
    extension=php_xsl.dll

1. Windows System Path add PHP folder - "C:\DATA\ProgramFiles\php5_6_x86"

1. Setup D3/Etc/conf.inc.
    
    Copy D3/Etc/conf.inc.default to D3/Etc/conf.inc
    In D3/Etc/conf.inc:
    Set test db:
    'DatabaseName'      => 'pgsql:host=192.168.173.65;port=5432;dbname=d3;user=dev;password=def',
    After 'FilesDir'          => 'Files/', add:
    'Extensions'		=> array(
    	'only'	=> array('agents','nsi','tfoms', 'tf_proc', 'mo','editor')
    ),

1. In Windows cmd run C:/DATA/ProgramFiles/apache24_x86/httpd.exe to run Apache.

1. In browser open localhost:80. You must see D3 login forms.
    Ask login and password from your senior colleague.

1. end.

================================
