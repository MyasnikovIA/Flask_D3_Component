from Components.BaseCtrl import *
from inspect import getfullargspec
import importlib
import json
"""
Дописать работу компонента 
"""
class Module(BaseCtrl):
    def __init__(self, PageInfo={}, attrs={}, innerText="", parent=None):
        self.PageInfo = PageInfo
        self.CmpType = 'Module'
        self.printTag = 'Module'
        self.innerHtml = innerText
        self.attrs = attrs.copy()
        self.name = RemoveArrKeyRtrn(self.attrs, 'name', self.genName())
        self.mode = getDomAttrRemove('mode', None, self.attrs);
        self.responsetype = getDomAttrRemove('responsetype', None, self.attrs);
        # Путь к модулю
        self.module = RemoveArrKeyRtrn(self.attrs, 'module')
        # Название метода, который будет запускатся
        self.method = getDomAttrRemove('method', 'ExecModule', self.attrs);

    def Show(self):
        self.sysinfo = []
        self.sysinfo.append(f""" <{self.printTag} name='{self.name}' {self.mode} {self.method}>""")
        return "", [], self.sysinfo, f"</{self.printTag}>"


    def OnRequest(XMLElement, typScript, elementName, vars):
        """
        Обработка вызова компонента с Вэб формы
        :param typScript:
        :param elementName:
        :param vars:
        :return:
        """
        RootDir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..",get_option('Forms')[1:-1]))
        resObject = {elementName: {"type": typScript, "data": [], "locals": {}, "position": 0, "rowcount": 0}}
        if 'module' in XMLElement.attrib:
            dataVarReturn = {}
            packName = XMLElement.attrib['module']
            packName = f"{packName}"
            defName = packName[packName.rfind('/') + 1:]
            packNameOne = packName[:packName.rfind('/')]
            moduleFile  = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", get_option('Forms')[1:-1],f"{packName}.py"))
            moduleFile2  = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", get_option('Forms')[1:-1],f"{packNameOne}.py"))
            if os.path.isfile(moduleFile):
                packName = packName.replace("/",".")
                print('moduleFile',moduleFile)
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
                        print('funArgsNameList',funArgsNameList)
                        print('funArgsDefaultsList',funArgsDefaultsList)
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
                        ret = function_name(vars)
                        #dataVarReturn['vars'] = vars
                        #dataVarReturn['data'] ={}
                        dataVarReturn['RETURN'] = ret
                        #sessionTmp = dataVarReturn['vars']['session']
                        #del dataVarReturn['vars']['session']
                    except:
                        dataVarReturn['error'] = f"no execute {packName}  def {defName}"

                else:
                    dataVarReturn['error'] = f"function {defName} not found in {packName}"
                s = {elementName: {"type": typScript, "data": dataVarReturn}}
                return json.dumps(s)
                """
                packNameOne = packNameOne.replace("/",".")
                meth = importlib.import_module(packNameOne)
                if hasattr(meth, defName):
                    function_name = getattr(meth, defName)
                    print('function_name',function_name)
                    dataVarReturn['console'] = f" moduleFile:{moduleFile2}  packNameOne:{packNameOne}  function_name:{function_name}"
                    s = {elementName: {"type": typScript, "data": dataVarReturn}}
                    return json.dumps(s)
                """
            else:
                dataVarReturn['error'] = f"module not found ({ get_option('Forms')[1:-1]}{packName}) "
                s = {elementName: {"type": typScript, "data": dataVarReturn}}
                return json.dumps(s)


