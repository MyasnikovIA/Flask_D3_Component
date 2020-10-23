from Components.BaseCtrl import BaseCtrl

class HyperLink(BaseCtrl):
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
            self.CmpType = 'HyperLink';
            if 'cmptype' in attrs:
                del attrs['cmptype']
            self.printTag = 'a';
            self.attrs = attrs.copy()
            self.innerHtml = ""
            if innerText != None:
                self.innerHtml = innerText
            if 'title' not in self.attrs:
                self.attrs['title'] = ""
            if 'caption' in self.attrs:
                self.innerHtml = self.attrs['caption']
                del self.attrs['caption']
            if 'class' not in self.attrs:
                self.classCSS = ['ctrl_hyper_link']
            else:
                self.classCSS = [i for i in attrs['class'].split(" ")]
                del self.attrs['class']
            if 'ctrl_hyper_link' not in self.classCSS:
                self.classCSS.append('ctrl_hyper_link')
            if 'name' not in self.attrs:
                self.attrs['name'] = self.genName()
            if 'onclick' not in self.attrs:
                self.attrs['onclick'] ="D3Api.HyperLinkCtrl.onClick(this);"

    def Show(self):
        res = []
        atr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items())
        res.append(f""" <a  cmptype="{self.CmpType}"  {atr}  tabindex="0"  class="{" ".join(self.classCSS)}" >{self.innerHtml} """)
        return f"</{self.printTag}>", res, [],""
