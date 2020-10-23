from peewee import *
from Etc.conf import *

user = 'root'
password = 'root'
db_name = 'peewee_demo'



dbvid=get_option("Database")
if dbvid=="MySQLDatabase":
    DB_HANDLE = MySQLDatabase( db_name, user=user, password=password,host='localhost')