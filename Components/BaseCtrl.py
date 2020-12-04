import uuid
from Etc.conf import *



class BaseCtrl:
    printTag = ""
    CmpType = ""
    attrs = {}
    PageInfo = {}
    innerObject = []
    parent = None
    webElement = True
    innerHtml = []
    argsToStyleList = ["width", "height", "top", "left"]

    def __init__(self, PageInfo={}, attrs={}, innerText="", parent=None):
        pass

    def test(self):
        pass

    def genName(self):
        return str(uuid.uuid1()).replace("-", "")


def getDomAttr(name, value='', attrs=None):
    if attrs != None:
        v = ArrKeyRtrn(attrs, name);
        if len(v) > 0:
            value = v
        if len(v) == 0 and value == None:
            return ''
    if value == 'true':
        value = name
    value = value.replace("'", "\'")
    return f""" {name} = '{value}' """

def getDomAttrRemove(name, value='', attrs=None):
    if attrs != None:
        v = RemoveArrKeyRtrn(attrs, name);
        if len(v) > 0:
            value = v
        if len(v) == 0 and value == None:
            return ''
    if value == 'true':
        value = name
    value = value.replace("'", "\'")
    return f""" {name} = '{value}' """


def RemoveArrKeyRtrn(arr, key, default=''):
    if key in arr:
        value = arr[key]
        del arr[key]
        return value
    else:
        return default


def ArrKeyRtrn(arr, key, default=''):
    if key in arr:
        value = arr[key]
        return value
    else:
        return default


def getBooleanAttr(name, attrs, default, remove=True):
    if name not in attrs:
        return default;

    res = attrs[name] == 'true' or attrs[name] == name;
    if (remove):
        del attrs[name]
    if res:
        return 'true'
    else:
        return ''


def RemoveArrKeyCondition(arr, condition='on'):
    return {k[v] for k, v in arr.items() if k[:2] == condition}
