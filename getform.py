from flask import request
import importlib
import codecs
import ast
import subprocess

from Components.Action.ActionCtrl import Action
from Components.DataSet.DataSetCtrl import DataSet

try:
    import xml.etree.cElementTree as ET
except ImportError:
    import xml.etree.ElementTree as ET
from Etc.conf import *

global SESSION
global COMPONENT_PATH

COMPONENT_PATH = os.path.join(os.path.dirname(__file__), 'Components')
FORM_PATH = os.path.join(os.path.dirname(__file__), 'Forms')
TEMP_DIR_PATH = os.path.join(os.path.dirname(__file__), get_option('cache_dir'))

global SESSION
SESSION = {}


def exec_then_eval(vars, code):
    block = ast.parse(code, mode='exec')
    # assumes last node is an expression
    last = ast.Expression(block.body.pop().value)
    _globals, _locals = vars, {}
    exec(compile(block, '<string>', mode='exec'), _globals, _locals)
    return eval(compile(last, '<string>', mode='eval'), _globals, _locals)


def factory(module_class_string, super_cls: type = None, **kwargs):
    """
    :param module_class_string: full name of the class to create an object of
    :param super_cls: expected super class for validity, None if bypass
    :param kwargs: parameters to pass
    :return:
    """
    module_name, class_name = module_class_string.rsplit(".", 1)
    module = importlib.import_module(module_name)
    assert hasattr(module, class_name), "class {} is not in {}".format(class_name, module_name)
    # logger.debug('reading class {} from module {}'.format(class_name, module_name))
    cls = getattr(module, class_name)
    if super_cls is not None:
        assert issubclass(cls, super_cls), "class {} should inherit from {}".format(class_name, super_cls.__name__)
    # logger.debug('initialising {} with params {}'.format(class_name, kwargs))
    obj = cls(**kwargs)
    return obj


def runPyFun(defName):
    packName = defName[:defName.rfind('.')]
    defName = defName[defName.rfind('.') + 1:]


def getParam(name, defoultValue=''):
    return request.args.get(name, defoultValue)


def getObjctClass(module_class_string, **kwargs):
    """
    :param module_class_string: full name of the class to create an object of
    :param kwargs: parameters to pass
    :return:
    """
    module_name, class_name = module_class_string.rsplit(".", 1)
    module = importlib.import_module(module_name)
    assert hasattr(module, class_name), "class {} is not in {}".format(class_name, module_name)
    # logger.debug('reading class {} from module {}'.format(class_name, module_name))
    cls = getattr(module, class_name)
    # logger.debug('initialising {} with params {}'.format(class_name, kwargs))
    obj = cls(**kwargs)
    return obj


def drawComponent(PageInfo={}, tagName="", attributes={}, innerText=""):
    res = []
    if 'cmptype' in attributes:
        compName = attributes['cmptype']
    else:
        compName = tagName
        if compName[:3] == 'cmp':
            compName = compName[3:]
    # paageTempName = os.path.join(TEMP_DIR_PATH, cache, f'{FormName}Page.py')
    compFileName = os.path.join(COMPONENT_PATH, compName, f'{compName}Ctrl.py')
    if os.path.isfile(compFileName):
        defName = os.path.join('Components', compName, f'{compName}Ctrl.{compName}').replace(os.sep, ".")
        obj = getObjctClass(defName, attrs=attributes, innerText=innerText, PageInfo=PageInfo)
        content, buf, sysinfoBlock , sysinfoClose = obj.Show()
        if sysinfoBlock == None:
            sysinfoBlock=[]
        return content, buf, sysinfoBlock , sysinfoClose
    res.append(f"\n<{compName}")
    res.append("  ".join(f'{k}="{v}"' for k, v in attributes.items()))
    res.append(">")
    if innerText != None:
        res.append(f"{innerText}")
    return f"</{compName}>", res, [], ""


# https://stackoverflow.com/questions/28194703/recursive-xml-parsing-python-using-elementtree

def printVisualTag(PageInfo, root):
    """Парсим визуальные элементы"""
    res = []
    sysinfo = []
    if 'cmptype' in root.keys():
        compName = root.attrib['cmptype']
    else:
        compName = root.tag
        if compName[:3] == 'cmp':
            compName = compName[3:]
    attrib = root.attrib.copy()
    clsTag, bufArr, sysinfoBlock , sysinfoBlockCloce = drawComponent(PageInfo, compName, attrib, root.text)
    res.extend(bufArr)
    if sysinfoBlock != None:
        sysinfo.extend(sysinfoBlock)
    del sysinfoBlock
    if len(root):
        for elem in root.getchildren():
            resBuf, sysinfoBlock = printVisualTag(PageInfo, elem)
            if resBuf != None:
                res.extend(resBuf)
            del resBuf
            if sysinfoBlock != None:
                sysinfo.extend(sysinfoBlock)
            del sysinfoBlock
    if len(sysinfoBlockCloce)>0:
        sysinfo.append(sysinfoBlockCloce)
        del sysinfoBlockCloce
    res.append(f"{clsTag}")
    return res, sysinfo



def getParsedForm(FormName, cache, dataSetName=""):
    # Добавить проверку наличия файла с формой
    pathTempPage = os.path.join(FORM_PATH, f"{FormName}.frm").replace("/", os.sep).replace("\\", os.sep)
    if not os.path.isfile(pathTempPage):
        return f"<center>Форма '{FormName}'не найдена</center>"
    pathTempPage = os.path.join(TEMP_DIR_PATH, f"{FormName}.py")
    PageInfo = {'FormName': FormName, 'cache': cache, 'TempPage': pathTempPage}
    global SESSION
    if cache not in SESSION:
        SESSION[cache] = {}

    SESSION[cache] = FormName
    ignoreElems = ['Action', 'DataSet']
    rootDir = os.path.dirname(__file__)
    pathForm = os.path.join(rootDir, get_option('Forms')[1:],
                            f"{FormName.replace('.', os.sep)}.frm").replace("/",
                                                                            os.sep)
    with codecs.open(pathForm, 'r', encoding='utf8') as f:
        xmlContent = f.read()
    xmlContent = f'<?xml version="1.0" encoding="{get_option("FormEncoding", "UTF-8")}" ?>\n{xmlContent}'
    rootForm = ET.fromstring(xmlContent)
    contentHtml = []
    if dataSetName == "":
        sysinfoBlock=[]
        resHtml, sysinfoBlock = printVisualTag(PageInfo, rootForm)
        contentHtml.extend(resHtml)
        contentHtml.append("""\n<div cmptype="sysinfo" style="display:none;">\n""")
        contentHtml.append(" \n".join(sysinfoBlock))
        contentHtml.append("""\n</div>""")
        return " ".join(contentHtml)
    else:
        contentHtml.append(dataSetName)
        SubForm = rootForm.findall(f"[@name='{dataSetName}']")
        contentHtml.append(SubForm)
    return xmlContent


def stripCode(srcCode=""):
    codeLines = srcCode.split("\n")
    countlines = 0
    startPosition = 0
    codeRes = []
    for line in codeLines:
        oneText = line.lstrip()
        if countlines == 0 and len(oneText) == 0:
            continue
        if countlines == 0 and len(oneText) != 0:
            startPosition = line.find(oneText),
        countlines += 1
        codeRes.append(line[startPosition[0]:])
    codeRes.append("locals()")
    code = '\n'.join(codeRes)
    return code


def run_command(command):
    p = subprocess.Popen(command,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.STDOUT)
    return iter(p.stdout.readline, b'')


def getRunAction(FormName, cache, elementName, queryActionObject):
    PageInfo = {'FormName': FormName, 'cache': cache}
    global SESSION
    if cache not in SESSION:
        SESSION[cache] = {}
    typScript = queryActionObject['type']
    params = queryActionObject['params']
    rootDir = os.path.dirname(__file__)
    pathForm = os.path.join(rootDir, get_option('Forms')[1:],
                            f"{FormName.replace('.', os.sep)}.frm").replace("/", os.sep)
    with codecs.open(pathForm, 'r', encoding='utf8') as f:
        xmlContentSrc = f.read()
    xmlContent = xmlContentSrc
    xmlContent = f'<?xml version="1.0" encoding="{get_option("FormEncoding", "UTF-8")}" ?>\n{xmlContent}'
    rootForm = ET.fromstring(xmlContent)
    for el in [typScript, f"cmp{typScript}"]:
        for item in rootForm.findall(el):
            if item.attrib['name'] != elementName:
                continue
            vars = {}
            if cache in SESSION:
                vars["session"] = SESSION[cache]
            else:
                SESSION[cache] = {}
                vars["session"] = SESSION[cache]
            retVar = []
            # Дописать отбработку srctype = session
            for elem in item.getchildren():
                if "put" not in elem.attrib:
                    if elem.attrib['name'] in params:
                        vars[elem.attrib['name']] = params[elem.attrib['name']]
                else:
                    retVar.append(elem.attrib['name'])
            if typScript == 'Action':
                # Запускаем классметод обработки запроса Action из вэб формы
                return Action.OnRequest(item, typScript, elementName, vars)

            if typScript == 'DataSet':
                return DataSet.OnRequest(item, typScript, elementName, vars)
                #  request: {"DS_ORG_TYPES_HEADER": {"type": "DataSet","params": {"_ext_": {}, "_uid_": "DS2521601521903435"}}}
                """ 
                {"DS_ORG_TYPES_HEADER": {"type": "DataSet", "uid": "DS2521601521903435",
                                         "sql": "\nselect t.id\n          from D_LPU t\n          --left join core.v_users t1 on t1.id = :sysuser\n",
                                         "vars": {"sysuser": ""},
                                         "data": [{"ID": "10903"}, {"ID": "6792418"}, {"ID": "6808629"},
                                                  {"ID": "8615623"}, {"ID": "9169835"}, {"ID": "9953855"},
                                                  {"ID": "356793300"}]
                                         , "position": 0
                                         , "rowcount": 7
                                         , "page": 0,
                                         "warning": "oci_bind_by_name(): ORA-01036: \u043d\u0435\u0432\u0435\u0440\u043d\u043e\u0435 \u0438\u043c\u044f\/\u043d\u043e\u043c\u0435\u0440 \u043f\u0435\u0440\u0435\u043c\u0435\u043d\u043d\u043e\u0439; ",
                                         "execute_time": "0.0334", "time": "0.268/0.2694"},
                 "_time_dbconnect_": 1.7473948001862, "_time_cache_": 0, "_time_parse_": 0.14361977577209,
                 "_time_": 2.1682558059692}
                """
    return ""
