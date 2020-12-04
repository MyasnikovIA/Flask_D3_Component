from Components.BaseCtrl import *


class TextArea(BaseCtrl):

    def __init__(self, PageInfo={}, attrs={}, innerText="", parent=None):
        self.events = {}
        self.style = []
        self.classCSS = []
        if 'style' in attrs:
            self.style = [i for i in RemoveArrKeyRtrn(attrs, 'style').split(";")]
        self.PageInfo = PageInfo
        self.CmpType = 'TextArea';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'div';
        self.attrs = attrs.copy()
        self.innerHtml = innerText
        # ============== INIT Html Class =========================
        if 'class' not in self.attrs:
            self.classCSS = ['textArea', 'box-sizing-force', 'editControl']
        else:
            self.classCSS = [i for i in attrs['class'].split(" ")]
            del self.attrs['class']
        if ('textArea' not in self.classCSS):
            self.classCSS.append('textArea')
        if ('box-sizing-force' not in self.classCSS):
            self.classCSS.append('box-sizing-force')
        if ('editControl' not in self.classCSS):
            self.classCSS.append('editControl')
        # ========================================================
        self.readonly = getDomAttrRemove('readonly', None, self.attrs);
        self.placeholder = getDomAttrRemove('placeholder', None, self.attrs);
        self.maxlength = getDomAttrRemove('maxlength', None, self.attrs);
        self.name = RemoveArrKeyRtrn(self.attrs, 'name', self.genName())
        self.value = RemoveArrKeyRtrn(self.attrs, 'value').replace('"', '\\"')
        self.format = getDomAttrRemove('format', None, self.attrs);
        self.data = getDomAttrRemove('data', None, self.attrs);
        if len(self.format) and ('onformat' not in self.attrs):
            self.attrs['onformat'] = f'D3Api.EditCtrl.format(this, {self.format}, arguments[0]);';

    def Show(self):
        eventsStr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if k[:2] == "on")
        atr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if not k[:2] == "on")
        if len(self.classCSS) > 0:
            classCSSStr = f""" class='{' '.join(self.classCSS)}'"""
        else:
            classCSSStr = ""
        """
        $showtext='<div '.$this->GetAttrString().' '.$this->GetContAttrString().' '.$this->ctrlstyle.' '.getDomAttr('class',implode(' ',$this->class)).'>'
                            .'<textarea cmpparse="TextArea" '.getDomAttr('maxlength', $this->maxlength).(($this->placeholder) ? getDomAttr('placeholder', $this->placeholder) : '').implode(' ',$this->events).$this->disabled.''.(($this->readonly)?' readonly="readonly"':'').'>'.(($this->value)?$this->value:$this->text).'</textarea>'
        """
        showtext = f"""
                <div  cmptype="{self.CmpType}" name={self.name}  {classCSSStr}    style="{" ".join(self.style)}   {self.data} {atr}>
                        <textarea cmpparse="TextArea" {self.maxlength} {self.placeholder} {eventsStr} {self.readonly}>{self.value}{self.innerHtml}</textarea>"""
        self.sysinfo = []
        self.sysinfo.append("<scriptfile>Components/TextArea/js/TextArea.js</scriptfile>")
        self.sysinfo.append("<cssfile>Components/TextArea/css/TextArea.css</cssfile>")
        return f"</{self.printTag}>", [showtext], self.sysinfo, ""
