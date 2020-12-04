from Components.BaseCtrl import *
from getform import *


class SubForm(BaseCtrl):

    def __init__(self, PageInfo={}, attrs={}, innerText="", parent=None):
        self.events = {}
        self.classCSS = []
        self.style = []
        self.PageInfo = PageInfo
        self.CmpType = 'SubForm';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'div';
        self.attrs = attrs.copy()
        self.name = RemoveArrKeyRtrn(self.attrs, 'name', self.genName())
        self.pathSubForm = RemoveArrKeyRtrn(self.attrs, 'path', '')
        self.PageParent = ""
        if 'FormName' in self.PageInfo:
            self.PageParent = self.PageInfo['FormName']

    def Show(self):
        resHtml, sysinfoBlock = FormParserSub(self.pathSubForm, self.PageInfo)
        resTxt = f"""
                        <!-- BEGIN SubForm:{self.pathSubForm}  parentForm:{self.PageParent} -->{" ".join(resHtml)}
                        <!-- END SubForm:{self.pathSubForm} -->
                  """
        return "", [resTxt], sysinfoBlock, ""
