from Components.BaseCtrl import BaseCtrl


class ComboItem(BaseCtrl):
    """
            <tr  repeat="0" data="value:ID;caption:FULLNAME" cmptype="ComboItem" name="cmp5f7daa36cf25a" repeatername="rep_5f7daa36cf266" comboboxname="IS_MAIN"  dataset="DsCancelReason"  >
                <td>
                    <div class="item_block">
                        <span class="btnOC" comboboxname="IS_MAIN"></span>

                        <span cont="itemcaption"></span>
                    </div>

                </td>
            </tr>

            <tr  cmptype="ComboItem" name="cmp5fc735b455c42" comboboxname="MySel"    value="4" >
                <td>
                    <div class="item_block">
                        <span class="btnOC" comboboxname="MySel"></span>

                        <span cont="itemcaption">4</span>
                    </div>

                </td>
            </tr>

    """

    def __init__(self, PageInfo={}, attrs={}, innerText="",parent = None):
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
        self.CmpType = 'ComboItem';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'tr';
        self.attrs = attrs.copy()
        if innerText == None:
            innerText = ""
        self.innerHtml = innerText
        self.caption = innerText
        if 'caption' in self.attrs:
            self.caption = self.attrs['caption']
            del self.attrs['caption']

        if 'title' not in self.attrs:
            self.attrs['title'] = ""
        if 'caption' in self.attrs:
            self.innerHtml = self.attrs['caption']
            del self.attrs['caption']
        if 'class' not in self.attrs:
            self.classCSS = []
        else:
            self.classCSS = [i for i in attrs['class'].split(" ")]
            del self.attrs['class']
        if ('value' not in attrs) and (len(self.innerHtml) > 0):
            self.attrs['value'] = self.innerHtml
        if ("repeat" in self.attrs) and ("repeatername" not in self.attrs):
            self.attrs["repeatername"] = self.genName()
        if 'name' not in self.attrs:
            self.attrs['name'] = self.genName()

    def Show(self):
        res = []
        atr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items())
        res.append(f"""
               
            <tr  cmptype="ComboItem" {atr} >
                <td>
                    <div class="item_block">
                        <span class="btnOC" comboboxname="MySel"></span>
                        <span cont="itemcaption">{self.caption}{self.innerHtml}</span>
                    </div>

                </td>
        """)
        return f"</{self.printTag}>", res, [],""
