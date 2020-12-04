import os
global ConfigOptions
ConfigOptions = {
    'DBType': 'MIS',
    'Database': 'SqliteDatabase',
    'DatabaseName': 'SourceDataBase.sql',
    'OutCodePage': 'UTF-8',
    'FormEncoding': 'UTF8',
    'DatabaseCharset': 'UTF8',
    'debug': 2,
    'Extensions': {'path':'Extensions/', 'only': ['mis']},
    'TempDir': 'temp/',
    'fs_store_dir': f'../file_storage{os.sep}',
    'FilesDir': 'Files/',
    'XlsCharset': 'windows-1251',
    'Forms': '/Forms/',
    'UserForms': '/UserForms/',
    'Exec7z': '/usr/bin/7za',
    'ExecZip': '/usr/bin/zip',
    'zint': '/usr/local/bin/zint',
    'zint_options' 	: '--direct',
    'Theme'             : 'bars',
    'design_mode'       : 0,
    'enabled_modules'   : [],
    'cache_maxage'      : 3600, #client
    'cache_enabled'     : 0,
    'cache_type'        : 'server', # client, server, both
    'cache_dir'         : 'temp/cache/',
    'cache_ttl'         : 60 *60 *3, # server
    'session_cache'     : 1,
    'cookie_lifetime'   : 900,
    'proxy_auth'        : {'hostname' : '',
                               'port' : 8080,
                               'user' : '',
                               'pass' : ''},
    'ldap_auth'         : {  #Информация для авторизации по LDAP
                             #Статус, вкл.(true ) /выкл.(false)
            'enabled' : False,
            #Имя хоста или IP сервера авторизации
            'hostname'          : '127.0.0.1',
            #Порт
            'port'              : None,
            #Домен
            'domain'            : '',
            #Кодировка используемая в LDAP
            'charset'           : 'windows-1251',
            #Пользователи ,для которых не использовать LDAP авторизацию, а авторизовать стандартным механизмом
            'sysusers'          : ['admin'],
            #Атрибут содержащий полное имя пользователя
            'attr_name'         : 'cn',
            #Атрибут содержащий логин пользователя
            'attr_login'        : 'samaccountname',
            #Атрибут содержащий группы, в которых состоит пользователь
            'attr_groups'       : 'memberof',
            #Атрибут содержащий наименование учетной единицы
            'attr_lpu'          : 'lpu',
            #Путь до каталога, для поиска пользователей
            'dn'                : 'CN=Users,DC=domain,DC=host,DC=ru',
            #Список групп в которых должен состоять пользователь, чтобы пройти авторизацию. Если список пустой то проверка не производится.
            'groups'            : [],
            #Пользователь, который имеет права на добавление пользователей и удалени е /добавление ролей
            'sysuser'           : 'admin',
            #Создавать пользователя в системе, true - да, false - нет
            'create_user'       : True,
            #Каталог, в котором будут созданы новые пользователи
            'catalog'           : '',
            #Синхронизировать роли со списком групп, в которых состоит пользователь, true - да, false - нет
            'sync_roles'        : True,
            #Список ролей, которые будут назначены по умолчанию
            'roles_default'     : ['Минимальная'],
            #Синхронизировать роли всегда, true - да, false - использовать кеширование, если набор групп не изменился
            'sync_force'        : True,
            #Использовать только LDA P -авторизацию, true - да, false - использовать дополнительно стандартный механизм
            'only'              : True
    },
'client_config' : {
    'formCache'     : False,
    'showDependence' : False
},
'requests'  : {
    'pdf'     : {
                'binpath'   : '/usr/local/bin/',
                'binfile'   : 'wkhtmltopdf',
                'binprefix' : 'env LANG=ru_RU.UTF-8',
                'render_type'   : 'wkhtmltopdf'
            },
    'pdfreport'     : {
        'user'      : 'admin',
        'binpath'   : '/usr/local/bin/',
        'binfile'   : 'wkhtmltopdf',
        'binprefix' : 'env LANG=ru_RU.UTF-8'
    }
},
'smtp' : {
    'host'          : 'mail-dev.bars-open.ru',
    'port'          : 25,
    'secure'        : '', # tls, ssl
    'autotls'       : False,
    'debug'         : 0,
    'username'      : 'mis_mail',
    'password'      : '',
    'from_email'    : '',
    'from_name'     : 'МИС'
},
'help_url'   : './wiki/',
'help_conf'  : './wiki/help.inc',
'HIVCenter' : '23619228', #ID ЛПУ Центра СПИД
}


def get_option(name,defoultValue="" ):
    if name in ConfigOptions:
        return  ConfigOptions[name]
    return defoultValue

def is_design_mode():
    return get_option('design_mode');



