# https://stackoverflow.com/questions/28194703/recursive-xml-parsing-python-using-elementtree

from flask import request
import importlib
import codecs
import ast
import subprocess
from Components.Action.ActionCtrl import Action
from Components.DataSet.DataSetCtrl import DataSet
from Components.Module.ModuleCtrl import Module

try:
    import xml.etree.cElementTree as ET
except ImportError:
    import xml.etree.ElementTree as ET
from Etc.conf import *

global COMPONENT_PATH
global FORM_PATH
global TEMP_DIR_PATH

COMPONENT_PATH = os.path.join(os.path.dirname(__file__), 'Components')
FORM_PATH = os.path.join(os.path.dirname(__file__),  get_option('Forms','/Forms/')[1:])
USER_FORM_PATH = os.path.join(os.path.dirname(__file__),  get_option('UserForms','/UserForms/')[1:])
TEMP_DIR_PATH = os.path.join(os.path.dirname(__file__), get_option('cache_dir'))

global SESSION
SESSION = {}


def exec_then_eval(vars, code):
    block = ast.parse(code, mode='exec')
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
    cls = getattr(module, class_name)
    if super_cls is not None:
        assert issubclass(cls, super_cls), "class {} should inherit from {}".format(class_name, super_cls.__name__)
    obj = cls(**kwargs)
    return obj

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
    cls = getattr(module, class_name)
    obj = cls(**kwargs)
    return obj


def drawComponent(PageInfo={}, tagName="", attributes={}, innerText="", parentRoot=None):
    res = []
    if 'cmptype' in attributes:
        compName = attributes['cmptype']
    else:
        compName = tagName
        if compName[:3] == 'cmp':
            compName = compName[3:]
    compFileName = os.path.join(COMPONENT_PATH, compName, f'{compName}Ctrl.py')
    if os.path.isfile(compFileName):
        defName = os.path.join('Components', compName, f'{compName}Ctrl.{compName}').replace(os.sep, ".")
        obj = getObjctClass(defName, attrs=attributes, innerText=innerText, PageInfo=PageInfo, parent=parentRoot)
        content, buf, sysinfoBlock, sysinfoClose = obj.Show()
        if sysinfoBlock == None:
            sysinfoBlock = []
        return content, buf, sysinfoBlock, sysinfoClose
    res.append(f"\n<{compName}")
    res.append("  ".join(f'{k}="{v}"' for k, v in attributes.items()))
    if parentRoot == None:
        if 'FormName' in PageInfo:
            res.append(f' path="{PageInfo["FormName"]}" ')
        if 'subForm' in PageInfo:
            res.append(f' subForm="{PageInfo["subForm"]}" ')
    res.append(">")
    if innerText != None:
        res.append(f"{innerText}")
    return f"</{compName}>", res, [], ""


def getParent(et):
    if '__my_parent__' in et.attrib:
        return et.attrib['__my_parent__']
    else:
        return None


def printVisualTag(PageInfo, root, parentRoot=None, drawSubForm=False):
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
    if parentRoot == None and drawSubForm == True:
        print('parentRoot', parentRoot)
        clsTag = ""
        bufArr = []
        sysinfoBlock = None
        sysinfoBlockCloce = ''
    else:
        clsTag, bufArr, sysinfoBlock, sysinfoBlockCloce = drawComponent(PageInfo, compName, attrib, root.text,
                                                                        parentRoot)
    res.extend(bufArr)
    if sysinfoBlock != None:
        sysinfo.extend(sysinfoBlock)
    del sysinfoBlock
    if len(root):
        for elem in root.getchildren():
            resBuf, sysinfoBlock = printVisualTag(PageInfo, elem, root, drawSubForm)
            if resBuf != None:
                res.extend(resBuf)
            del resBuf
            if sysinfoBlock != None:
                sysinfo.extend(sysinfoBlock)
            del sysinfoBlock
    if len(sysinfoBlockCloce) > 0:
        sysinfo.append(sysinfoBlockCloce)
        del sysinfoBlockCloce
    res.append(f"{clsTag}")
    return res, sysinfo


def FormParserText(xmlContent="", PageInfo={}):
    """
    Парсим текст XML в HTML верстку D3
    """
    xmlContent = f'<?xml version="1.0" encoding="{get_option("FormEncoding", "UTF-8")}" ?>\n{xmlContent}'
    rootForm = ET.fromstring(xmlContent)
    resHtml, sysinfoBlock = printVisualTag(PageInfo, rootForm, None, True)
    return resHtml, sysinfoBlock


def FormParserSub(FormName="", PageInfo={}):
    """
    Парсим Файл формы в HTML верстку D3
    """
    rootDir = os.path.dirname(__file__)
    pathForm = os.path.join(rootDir, get_option('Forms')[1:],
                            f"{FormName.replace('.', os.sep)}.frm").replace("/", os.sep)
    PageInfo['subForm'] = FormName
    if not os.path.isfile(pathForm):
        return f"<center>Форма '{FormName}'не найдена</center>"
    with codecs.open(pathForm, 'r', encoding='utf8') as f:
        xmlContent = f.read()
    xmlContent = f'<?xml version="1.0" encoding="{get_option("FormEncoding", "UTF-8")}" ?>\n{xmlContent}'
    rootForm = ET.fromstring(xmlContent)
    resHtml, sysinfoBlock = printVisualTag(PageInfo, rootForm, None, True)
    return resHtml, sysinfoBlock

def getFileText(pathTempPage):
    """
     Вычитать содержимое файла
    """
    if not os.path.isfile(pathTempPage):
        return ''
    with codecs.open(pathTempPage, 'r', encoding='utf8') as f:
        return f.read()

def getFileListText(array=[]):
    res = []
    for one in array:
        res.append(f'<div userform="{one}">')
        res.append(getFileText(one))
        res.append('</div>')
    return '\n'.join(res)

def replaceFrmFromDfrm(rootForms,rootDFRMForm):
    """ Преобразование формы фрагментаи DFRM

       Необходимо дописать  механизм
       Сейчас он не работает

    for item in rootDFRMForm.findall('node'):
        print('items',item)
    # sectionList = rootDFRMForm.findall('node')

    for child in rootDFRMForm:
        print('child',child.getroottree())
    sectionList = rootDFRMForm.findtext('node')
    print('sectionList',sectionList)
    """
    return rootForms


def existFormFile(FormName):
     """
     Дописать механизм поиска *.frm в папке ЮзерФорм
     """
     pathUserTempPageDFRM = os.path.join(USER_FORM_PATH, f"{FormName}.d").replace("/", os.sep).replace("\\", os.sep)
     pathTempPageDFRM = os.path.join(FORM_PATH, f"{FormName}.d").replace("/", os.sep).replace("\\", os.sep)
     pathUserTempPage = os.path.join(USER_FORM_PATH, f"{FormName}.frm").replace("/", os.sep).replace("\\", os.sep)
     pathTempPage = os.path.join(FORM_PATH, f"{FormName}.frm").replace("/", os.sep).replace("\\", os.sep)
     arr = []
     if os.path.isfile(pathUserTempPage):
         textFrm = getFileText(pathUserTempPage)
         if os.path.isdir(pathUserTempPageDFRM):
            for one in os.listdir(pathUserTempPageDFRM):
                arr.append(os.path.join(pathUserTempPageDFRM,one))
         textDFRM = getFileListText(arr)
         return f'<?xml version="1.0" encoding="{get_option("FormEncoding", "UTF-8")}" ?>\n{textFrm}',\
                f'<?xml version="1.0" encoding="{get_option("FormEncoding", "UTF-8")}" ?>\n<div>{textDFRM}</div> ',\
                True
     if os.path.isfile(pathTempPage):
         textFrm = getFileText(pathTempPage)
         if os.path.isdir(pathTempPageDFRM):
            for one in os.listdir(pathTempPageDFRM):
                arr.append(os.path.join(pathTempPageDFRM,one))
         if os.path.isdir(pathUserTempPageDFRM):
            for one in os.listdir(pathUserTempPageDFRM):
                arr.append(os.path.join(pathUserTempPageDFRM,one))
         textDFRM = getFileListText(arr)
         return f'<?xml version="1.0" encoding="{get_option("FormEncoding", "UTF-8")}" ?>\n{textFrm}',\
                f'<?xml version="1.0" encoding="{get_option("FormEncoding", "UTF-8")}" ?>\n<div>{textDFRM}</div> ',\
                True
     return '', '', False


def getParsedForm(FormName, cache, dataSetName=""):
    """
    Парсим Файл формы в HTML верстку D3
    """
    textFrm,textDFRM, existFrm = existFormFile(FormName)
    if not existFrm:
        return f"<center>Форма '{FormName}'не найдена</center>"
    PageInfo = {'FormName': FormName, 'cache': cache, 'TempPage': FormName}
    global SESSION
    if cache not in SESSION:
        SESSION[cache] = {}
    SESSION[cache] = FormName
    rootForms = ET.fromstring(textFrm)
    rootDFRMForm = ET.fromstring(textDFRM)
    rootForm = replaceFrmFromDfrm(rootForms,rootDFRMForm)
    contentHtml = []
    if dataSetName == "":
        resHtml, sysinfoBlock = printVisualTag(PageInfo, rootForm, None)
        resSysinfoBlock = []
        if len(sysinfoBlock) > 0:
            for elemOne in sysinfoBlock:
                if "<cssfile>" in elemOne  or "<scriptfile>" in elemOne :
                    if elemOne not in resSysinfoBlock:
                        resSysinfoBlock.append(elemOne)
                else:
                    resSysinfoBlock.append(elemOne)
        contentHtml.extend(resHtml)
        contentHtml.append("""\n<div cmptype="sysinfo" style="display:none;">\n""")
        contentHtml.append("\n".join(resSysinfoBlock))
        contentHtml.append("""\n</div>""")
        return " ".join(contentHtml)
    else:
        contentHtml.append(dataSetName)
        SubForm = rootForm.findall(f"[@name='{dataSetName}']")
        contentHtml.append(SubForm)
    return xmlContent



def getParsedForm_OLD(FormName, cache, dataSetName=""):
    """
    Парсим Файл формы в HTML верстку D3
    """
    # Добавить проверку наличия файла с формой
    pathTempPage,textDFRM = existFormFile(FormName)
    if len(pathTempPage) == 0:
        return f"<center>Форма '{FormName}'не найдена</center>"
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
    if not os.path.isfile(pathForm):
        return f"<center>Форма '{FormName}'не найдена</center>"
    with codecs.open(pathForm, 'r', encoding='utf8') as f:
        xmlContent = f.read()
    xmlContent = f'<?xml version="1.0" encoding="{get_option("FormEncoding", "UTF-8")}" ?>\n{xmlContent}'
    rootForm = ET.fromstring(xmlContent)
    contentHtml = []
    if dataSetName == "":
        sysinfoBlock = []
        resHtml, sysinfoBlock = printVisualTag(PageInfo, rootForm, None)
        resSysinfoBlock = []
        if len(sysinfoBlock) > 0:
            for elemOne in sysinfoBlock:
                if "<cssfile>" in elemOne  or "<scriptfile>" in elemOne :
                    if elemOne not in resSysinfoBlock:
                        resSysinfoBlock.append(elemOne)
                else:
                    resSysinfoBlock.append(elemOne)
        contentHtml.extend(resHtml)
        contentHtml.append("""\n<div cmptype="sysinfo" style="display:none;">\n""")
        contentHtml.append("\n".join(resSysinfoBlock))
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

            if typScript == 'Module':
                return Module.OnRequest(item, typScript, elementName, vars)

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

def getAbsalutFormDir():
    return FORM_PATH