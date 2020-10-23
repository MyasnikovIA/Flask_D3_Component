import importlib
from inspect import getfullargspec
import ast
import sys
import json
from Components.BaseCtrl import BaseCtrl


class DataSet(BaseCtrl):
    def __init__(self, PageInfo={}, attrs={}, innerText=""):
        self.PageInfo = PageInfo
        self.CmpType = 'DataSet'
        self.printTag = 'DataSet'
        self.innerHtml = innerText
        self.attrs = attrs.copy()
        if 'name' not in self.attrs:
            self.attrs['name'] = self.genName()

    def Show(self):
        self.sysinfo = []
        scriptTxt = f"<script>refreshDataSet('{self.attrs['name']}');<script>"
        self.sysinfo.append(f"""\n<{self.printTag}  name='{str(self.attrs["name"])}' >""" )
        return f" ", [], self.sysinfo,f"</{self.printTag}>"

    def OnRequest(XMLElement, typScript, elementName, vars):
        """
        Обработка вызова компонента с Вэб формы
        :param typScript:
        :param elementName:
        :param vars:
        :return:
        """
        #  <cmpAction name="runPythonFunction" action="testScript.test.runScriptFromWeb">
        #  Запуск метода из Python скрипта  в  templates/Forms/*/*.py
        resObject = {elementName: {"type": typScript, "data": [], "locals": {}, "position": 0, "rowcount": 0}}
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
                    res,loclsVar = function_name(**rgsVar)
                    if res != None:
                        resObject[elementName]["data"] = res
                        resObject[elementName]["rowcount"] = len(res)
                    if loclsVar != None:
                        if "position" in loclsVar:
                            resObject[elementName]["rowcount"] =loclsVar['position']
                            del loclsVar['position']
                        if "rowcount" in loclsVar:
                            resObject[elementName]["rowcount"] =loclsVar['rowcount']
                            del loclsVar['rowcount']
                        resObject[elementName]["locals"] = loclsVar
                except:
                    resObject[elementName]["error"] = f"no execute {packName}  def {defName}"
            else:
                resObject[elementName]['error'] = f"function {defName} not found in {packName}"
            return json.dumps(resObject)
        #  <cmpAction name="checkHelpRight" query_type="server_python">
        #  запуск  меленький скриптов, прописанный в теле тэга
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

            s = {elementName: {"type": typScript,"data":[],"locals":{}}}
            if "data" in dataVarReturn:
                resObject[elementName]["data"] = dataVarReturn["data"]
                del dataVarReturn["data"]
            resObject[elementName]["rowcount"] = len(resObject[elementName]["data"])
            if "position" in dataVarReturn:
                 resObject[elementName]["rowcount"] = dataVarReturn['position']
                 del dataVarReturn['position']
            if "rowcount" in dataVarReturn:
                 resObject[elementName]["rowcount"] = dataVarReturn['rowcount']
                 del dataVarReturn['rowcount']
            resObject[elementName]["locals"] = dataVarReturn
            return json.dumps(resObject)
        else:
            # дописать обработку SQL запроса
            s = {elementName: {"type": typScript, "data": [{'console': "Необходимо допилить метод"}],"locals":{}, "position": 0, "rowcount": 0}}
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
