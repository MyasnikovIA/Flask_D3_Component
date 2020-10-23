from Components.BaseCtrl import BaseCtrl


class Mask(BaseCtrl):
    """
          <div  name="IS_MAIN" cmptype="Edit" title=""  class="ctrl_edit editControl box-sizing-force"  style=";width: 100%;">
              <div class = "edit-input">
                 <input cmpparse="Edit" type="text" value="" onchange="D3Api.stopEvent();"/>
              </div>
          </div>
    """

    def __init__(self, PageInfo={}, attrs={}, innerText=""):
        self.style = []
        self.classCSS = []
        if 'style' in attrs:
            self.style = [i for i in attrs['style'].split(";")]
            del attrs['style']
        for name in self.argsToStyleList:
            if name in attrs:
                self.style.append(f"{name}:{attrs[name]}")
                del attrs[name]

        self.PageInfo = PageInfo
        self.CmpType = 'Mask';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'div';
        self.attrs = attrs.copy()
        if 'name' not in self.attrs:
            self.attrs['name'] = self.genName()

    def Show(self):
        res = []
        res.append(
            f"""\n<div  cmptype="{self.CmpType}"   name="{self.attrs['name']}"   controls="{self.attrs['controls']}" style="display:none">""")
        return f"</{self.printTag}>", res, [], ""