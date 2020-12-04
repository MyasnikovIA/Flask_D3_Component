import importlib
from inspect import getfullargspec
import ast
import sys,os
import json
import subprocess
from Components.BaseCtrl import *


class Action(BaseCtrl):
    def __init__(self, PageInfo={}, attrs={}, innerText="",parent = None):
        self.PageInfo = PageInfo
        self.CmpType = 'Action'
        self.printTag = 'Action'
        self.innerHtml = innerText
        self.attrs = attrs.copy()
        self.name = RemoveArrKeyRtrn(self.attrs, 'name', self.genName())

    def Show(self):
        self.sysinfo=[]
        self.sysinfo.append(f""" <{self.printTag} name='{self.name}' >""")
        return "", [], self.sysinfo,f"</{self.printTag}>"

    def OnRequest(XMLElement, typScript, elementName, vars):
        """
        Обработка вызова компонента с Вэб формы
        :param typScript:
        :param elementName:
        :param vars:
        :return:
        """
        #
        #
        #     <cmpAction name="runPythonFunction" action="testScript.test.runScriptFromWeb">
        #        <cmpActionVar name="arg1"      src="arg1"      srctype="var"/>
        #        <cmpActionVar name="retarg2"   src="retarg2"   srctype="var" put=""/>
        #        <cmpActionVar name="console"   src="console"   srctype="var" put=""/>
        #     </cmpAction>
        #
        #     testScript.test.runScriptFromWeb
        #
        #   Запуск метода из Python скрипта  в  templates/Forms/*/*.py
        if 'action' in XMLElement.attrib:
            dataVarReturn = {}
            defName = XMLElement.attrib['action']
            packName = f"Forms.{defName[:defName.rfind('.')]}"
            defName = defName[defName.rfind('.') + 1:]
            meth = importlib.import_module(packName)
            if hasattr(meth, defName):
                function_name = getattr(meth, defName)
                try:
                    infoMeth = getfullargspec(function_name)
                    funArgsNameList = infoMeth.args
                    funArgsDefaultsList = infoMeth.defaults
                    del infoMeth
                    rgsVar = {}
                    indDef = -1
                    for nam in funArgsNameList:
                        indDef += 1
                        if nam in vars:
                            rgsVar[nam] = vars[nam]
                        elif funArgsDefaultsList[indDef]:
                            rgsVar[nam] = funArgsDefaultsList[indDef]
                        else:
                            rgsVar[nam] = None
                    del indDef, funArgsNameList, funArgsDefaultsList
                    res = function_name(**rgsVar)
                    if res != None:
                        dataVarReturn['return'] = res
                except:
                    dataVarReturn['error'] = f"no execute {packName}  def {defName}"
            else:
                dataVarReturn['error'] = f"function {defName} not found in {packName}"
            # dataVarReturn['console'] = buf2.getvalue()
            s = {elementName: {"type": typScript, "data": dataVarReturn}}
            return json.dumps(s)

        # -------------------------------------------------------------------------------
        #  Запуск скриптов по адресу Forms/MyModul/modul функцию с именем Test
        #    JS.
        #       setVar('myVar', '1234567890');
        #       executeAction('CacheSessDelete', function() {  console.log('myVar', getVar('myVar')); });
        #
        #    HTML.
        #     <cmpAction name="CacheSessDelete" module="MyModul/modul/Test">
        #          <cmpActionVar name="myVar"    src="myVar"       srctype="var" />
        #          <cmpActionVar name="return"   src="myreturn"    srctype="var" />
        #     </cmpAction>
        #
        #    Python.
        #     Forms/MyModul/modul/modul.py
        #            def Test(myVar = {}):
        #                 myVar['test']="ddddddddd"
        #                 return "000000000000000000"
        #
        #    {"CacheSessDelete": {"type": "Action", "data": {"return": "000000000000000000", "vars": null, "myVar": "ddddddddd"}}}
        # -------------------------------------------------------------------------------
        elif 'module' in XMLElement.attrib:
            dataVarReturn = {}
            packName = XMLElement.attrib['module']
            packName = f"{packName}"
            defName = packName[packName.rfind('/') + 1:]
            packNameOne = packName[:packName.rfind('/')]
            moduleFile = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", get_option('Forms')[1:-1], f"{packName}.py"))
            moduleFile2 = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", get_option('Forms')[1:-1], f"{packNameOne}.py"))
            if os.path.isfile(moduleFile):
                packName = packName.replace("/",".")
                dataVarReturn['console'] = f" moduleFile:{moduleFile}  packName:{packName} "
                s = {elementName: {"type": typScript, "data": dataVarReturn}}
                return json.dumps(s)
            elif os.path.isfile(moduleFile2):
                packNameOne = packNameOne.replace("/", ".")
                packNameOne = f"Forms.{packNameOne}"
                meth = importlib.import_module(packNameOne)
                if hasattr(meth, defName):
                    function_name = getattr(meth, defName)
                    try:
                        infoMeth = getfullargspec(function_name)
                        funArgsNameList = infoMeth.args
                        funArgsDefaultsList = infoMeth.defaults
                        del infoMeth
                        rgsVar = {}
                        indDef = -1
                        for nam in funArgsNameList:
                            indDef += 1
                            if nam in vars:
                                rgsVar[nam] = vars[nam]
                            elif funArgsDefaultsList[indDef]:
                                rgsVar[nam] = funArgsDefaultsList[indDef]
                            else:
                                rgsVar[nam] = None
                        del indDef, funArgsNameList, funArgsDefaultsList
                        dataVarReturn['return'] = function_name(rgsVar)
                        for ind in rgsVar:
                            dataVarReturn[ind] = rgsVar[ind]
                    except:
                        dataVarReturn['error'] = f"no execute {packName}  def {defName}"
                else:
                    dataVarReturn['error'] = f"function {defName} not found in {packName}"
                s = {elementName: {"type": typScript, "data": dataVarReturn}}
                return json.dumps(s)


        #  <cmpAction name="checkHelpRight" query_type="server_python">
        #  запуск  меленький скриптов, прописанный в теле тэга
        #
        #      setVar("form_params","fffffffff")
        #      executeAction('checkHelpRight', function(){ alert(getVar('can_edit'));  });
        #
        #      <cmpAction name="checkHelpRight" query_type="server_python">
        #          can_edit = [1,2,3,4,5,form_params]
        #          varNoVisible=[1,2,3,4,5]
        #         <cmpActionVar name="form_params"    src="form_params"   srctype="var"/>
        #         <cmpActionVar name="can_edit"       src="can_edit"      srctype="var" put=""/>
        #     </cmpAction>
        #
        #     {"checkHelpRight": {"type": "Action", "data": {"can_edit": [1, 2, 3, 4, 5, "fffffffff"], "varNoVisible": [1, 2, 3, 4, 5]}}}
        elif XMLElement.attrib['query_type'] == 'server_python':
            code = stripCode(XMLElement.text)
            dataVarReturn = {}
            try:
                localVariableTemp = exec_then_eval(vars, code)
                for elementDict in localVariableTemp:
                    if elementDict[:2] == '__':
                        continue
                    if elementDict == 'elementDict':
                        continue
                    if elementDict == 'localVariableTemp':
                        continue
                    if elementDict == 'sys':
                        continue
                    dataVarReturn[elementDict] = localVariableTemp[elementDict]
                del localVariableTemp, elementDict
            except:
                dataVarReturn["error"] = f"Unexpected error:{sys.exc_info()[0]}"
            s = {elementName: {"type": typScript, "data": dataVarReturn}}
            return json.dumps(s)
        #
        #  обработка соманд Shell
        #
        #     executeAction('runShellScript2', function(){  alert(getVar('console'));   });
        #
        #     <cmpAction name="runShellScript" query_type="server_shell">
        #         ping www.yandex.ru
        #         <cmpActionVar name="url_ping"  src="url_ping"   srctype="var"/>
        #         <cmpActionVar name="console"   src="console"    srctype="var" put=""/>
        #     </cmpAction>
        #
        elif XMLElement.attrib['query_type'] == 'server_shell':
            lines = (XMLElement.text).split("\n")
            res = []
            for lin in lines:
                lineDst = lin.lstrip()
                if len(lineDst) == 0:
                    continue
                res.append(
                    subprocess.Popen(lineDst.split(), stdout=subprocess.PIPE).stdout.read().decode(encoding="cp866"))
            dataVarReturn = {}
            dataVarReturn["console"] = "\n".join(res)
            s = {elementName: {"type": typScript, "data": dataVarReturn}}
            return json.dumps(s)
        elif 'modul' in XMLElement.attrib:
            dataVarReturn = {}
            defName = XMLElement.attrib['action']
            packName = f"Forms.{defName[:defName.rfind('.')]}"
            defName = defName[defName.rfind('.') + 1:]
            meth = importlib.import_module(packName)
            if hasattr(meth, defName):
                function_name = getattr(meth, defName)
                try:
                    infoMeth = getfullargspec(function_name)
                    funArgsNameList = infoMeth.args
                    funArgsDefaultsList = infoMeth.defaults
                    del infoMeth
                    rgsVar = {}
                    indDef = -1
                    for nam in funArgsNameList:
                        indDef += 1
                        if nam in vars:
                            rgsVar[nam] = vars[nam]
                        elif funArgsDefaultsList[indDef]:
                            rgsVar[nam] = funArgsDefaultsList[indDef]
                        else:
                            rgsVar[nam] = None
                    del indDef, funArgsNameList, funArgsDefaultsList
                    res = function_name(**rgsVar)
                    if res != None:
                        dataVarReturn['return'] = res
                except:
                    dataVarReturn['error'] = f"no execute {packName}  def {defName}"
            else:
                dataVarReturn['error'] = f"function {defName} not found in {packName}"
            s = {elementName: {"type": typScript, "data": dataVarReturn}}
            return json.dumps(s)
        else:
            s = {elementName: {"type": typScript, "data": {'console': f"Необходимо допилить метод {XMLElement.attrib}"}}}
            return json.dumps(s)


def stripCode(srcCode=""):
    """
    Функция очистки пробелов до первого символа (на  пробела), и выравневания остальных строк по этот символ
    :param srcCode:
    :return:
    """
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


def exec_then_eval(vars, code):
    """
    Запуск многострочного текста кода  с кэшированием
    :param vars:  переменные для входных рагументов скрипта (инициализация) {"var1":111,"var2":333}
    :param code: текст программы Python для выполнения
    :return:
    """
    block = ast.parse(code, mode='exec')
    # assumes last node is an expression
    last = ast.Expression(block.body.pop().value)
    _globals, _locals = vars, {}
    exec(compile(block, '<string>', mode='exec'), _globals, _locals)
    return eval(compile(last, '<string>', mode='eval'), _globals, _locals)
