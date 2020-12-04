from Components.BaseCtrl import *


class Edit(BaseCtrl):
    """
            <table  cmptype="Edit" name='testEd'  title='' class="editControl" cellspacing="0" cellpadding="0" style="vertical-align:bottom; width:114px;  display:inline-table;" >
                <tr>
                    <td class="td_edit_control">
                        <input type="text" cmpparse="Edit" value=""   class="input-ctrl"/>
                    </td>
                </tr>
         </table>

    """
    def __init__(self, PageInfo={}, attrs={}, innerText="", parent=None):
        self.events = {}
        self.classCSS = []
        self.style = getDomAttrRemove('style', None, self.attrs);
        self.PageInfo = PageInfo
        self.CmpType = 'Edit';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'div';
        self.attrs = attrs.copy()
        self.innerHtml = innerText
        self.readonly = getBooleanAttr('readonly', self.attrs, 'false');
        # ============== INIT Html Class =========================
        if 'class' not in self.attrs:
            self.classCSS = ['ctrl_edit', 'editControl', 'box-sizing-force']
        else:
            self.classCSS = [i for i in attrs['class'].split(" ")]
            del self.attrs['class']
        if ('ctrl_edit' not in self.classCSS):
            self.classCSS.append('ctrl_edit')
        if ('editControl' not in self.classCSS):
            self.classCSS.append('editControl')
        if ('box-sizing-force' not in self.classCSS):
            self.classCSS.append('box-sizing-force')
        # ========================================================
        self.placeholder = getDomAttrRemove('placeholder', None, self.attrs);
        self.maxlength = getDomAttrRemove('maxlength', None, self.attrs);
        self.value = getDomAttrRemove('value', None, self.attrs);
        self.type = getDomAttrRemove('type', 'text', self.attrs);
        self.format = getDomAttrRemove('format', None, self.attrs);
        self.readonly = getDomAttrRemove('readonly', None, self.attrs);
        self.disabled = getDomAttrRemove('disabled', None, self.attrs);
        self.format = RemoveArrKeyRtrn(self.attrs,'format', '');

        if 'name' not in self.attrs:
            self.attrs['name'] = self.genName()

        if len(self.format) and ('onformat' not in self.attrs):
            self.attrs['onformat'] = f'D3Api.EditCtrl.format(this, {self.format}, arguments[0]);';

    def Show(self):
        eventsStr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if k[:2] == "on")
        atr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if not k[:2] == "on")

        if len(self.classCSS) > 0:
            classCSSStr = f""" class='{' '.join(self.classCSS)}'"""
        else:
            classCSSStr = ""
        showtext = f"""
                <div  cmptype="{self.CmpType}"   {classCSSStr} {self.style} {self.placeholder}"  {atr} >  
                    <input cmpparse="Edit"  {self.type} {self.value} {self.maxlength} {self.readonly} {eventsStr}  onchange="D3Api.stopEvent(); " {self.placeholder} {self.disabled} />
                """
        self.sysinfo = []
        self.sysinfo.append("<scriptfile>Components/Edit/js/Edit.js</scriptfile>")
        self.sysinfo.append("<cssfile>Components/Edit/css/Edit.css</cssfile>")
        return f"</{self.printTag}>", [showtext], self.sysinfo, ""
