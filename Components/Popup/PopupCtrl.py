from Components.BaseCtrl import BaseCtrl



class Popup(BaseCtrl):
    """

<!--
<style>
  .ui-menu { width: 150px; }
</style>
<ul id="menu" style="position: fixed;top:0;left:500px;">
  <li class="ui-state-disabled"><div>Toys (n/a)</div></li>
  <li><div>Books</div></li>
  <li><div>Clothing</div></li>
  <li><div>Electronics</div>
    <ul>
      <li class="ui-state-disabled"><div>Home Entertainment</div></li>
      <li><div>Car Hifi</div></li>
      <li><div>Utilities</div></li>
    </ul>
  </li>
  <li><div>Movies</div></li>
  <li><div>Music</div>
    <ul>
      <li><div>Rock</div>
        <ul>
          <li><div>Alternative</div></li>
          <li><div>Classic</div></li>
        </ul>
      </li>
      <li><div>Jazz</div>
        <ul>
          <li><div>Freejazz</div></li>
          <li><div>Big Band</div></li>
          <li><div>Modern</div></li>
        </ul>
      </li>
      <li><div>Pop</div></li>
    </ul>
  </li>
  <li class="ui-state-disabled"><div>Specials (n/a)</div></li>
</ul><script>$( "#menu" ).menu();</script>
-->
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
        self.CmpType = 'Popup';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'label';
        self.attrs = attrs.copy()
        self.innerHtml = innerText
        if 'caption' in self.attrs:
            self.innerHtml = self.attrs['caption']
            del self.attrs['caption']
        if 'name' not in self.attrs:
            self.attrs['name'] = self.genName()
        if 'class' not in self.attrs:
            self.classCSS = []
        else:
            self.classCSS = [i for i in attrs['class'].split(" ")]
            del self.attrs['class']

    def Show(self):
         res = []
         res.append('<ul id="menu" style="position: fixed;top:10;left:10px;">')


         self.sysinfo = []
         self.sysinfo.append("<scriptfile>Components/Popup/js/Popup.js</scriptfile>")
         self.sysinfo.append("<cssfile>Components/Popup/css/Popup</cssfile>")
         clstag = """</ul><script> $( "#menu" ).menu();</script>"""
         return clstag, res, self.sysinfo,""
