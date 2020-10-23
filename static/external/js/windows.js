/*
<table id="test33" style="background-color: RGB(255,255,255);border-style: double;  ">
    <th style="background-color: RGB(155,155,155);">ggg</th>
    <tr>
        <td></td>
    </tr>
</table>
 dom = document.getElementById('test33').children[0].children[1].children[0];
 D3Api.showForm('main3',dom , {history: false});
 $( "#test33" ).draggable();

<!--  =========================   -->
    <component cmptype="Script">
        Form.selectOkato = function() {
            win = openD3Form('selectValue',undefined,{vars:{valueVar: 'ddddddddddddd' },onclose:[closure(Form.setResult)]});
        }
        Form.setResult = function(res) {
            if(res) {
                alert( res.value );
            }
        }
    </component>
    <br/>
    <cmpButton caption="Модальное окно" onclick="Form.selectOkato()"></cmpButton>
<!--  =========================   -->
    <div cmptype="Form" style="padding-bottom: 50px;" class="formBackground box-sizing-force" oncreate="Form.onCreateOkato();" caption="Выбор из справочника ОКАТО">

        <cmpEdit  value="111111111" name="can_edit"  ></cmpEdit>
         <cmpScript>
            Form.onCreateOkato = function() {
               alert( getVar('valueVar') )
            }
            Form.selectOkato = function() {
                close({value: getValue('can_edit')});
            }
        </cmpScript>
        <div style="padding-top: 10px;height: 40px;text-align: right;">
            <cmpButton  caption="Oк" onclick="Form.selectOkato();"/>
            <cmpButton caption="Отмена" onclick="close()"/>
        </div>
    </div>
<!--  =========================   -->

*/


window.openD3Form = function(FormName,modal,data){
  //  D3Api.showForm('HelpForms/okato/okato_select',undefined,{vars:{value: getValue('OKATO')},onclose:[closure(Form.setResult)]});
  //  console.log('Откуда зупущена функция',arguments.callee.caller);
  data = data||{};
  name = "openD3Form"+(new Date().getTime())+(FormName.replaceAll(/[/]|[.]|[#]/g, '_'))+Math.floor(Math.random() * 10000);
  (typeof data["title"] !=="undefined")  ? title  = data["title"] :title = "";
  (typeof data["top"] !=="undefined")    ? topwin = data["top"]  :topwin = (document.documentElement.clientHeight/2)-(document.documentElement.clientHeight/4);
  (typeof data["left"] !=="undefined")   ? leftwin   = data["left"] :leftwin = (document.documentElement.clientWidth/2)-(document.documentElement.clientWidth/4);
  (typeof data["width"] !=="undefined")  ? widthwin  = data["width"] :widthwin =  document.documentElement.clientWidth/2;
  (typeof data["height"] !=="undefined") ? heightwin = data["height"] :heightwin =  document.documentElement.clientHeight/2;

  if (typeof modal === "undefined"){
     D3Api.showForm(FormName, $(".D3MainContainer").get(0),data);
     return ;
  }
  if (typeof modal === "boolean"){
      if (modal==true){
         BackGroundDiv = '<div id="backGround'+name+'" style="background-color: RGBA(55,55,55,0.8);position:absolute;left:0;top:0;width:100%;height:100%; margin-left: auto; margin-right: auto;" ></div>';
      }else{
         BackGroundDiv = '';
      }
  }else{
     if (typeof modal ==="object"){
         BackGroundDiv = '';
         D3Api.showForm(FormName, undefined ,modal);
         return ;
     }else{
         D3Api.showForm(FormName, $(".D3MainContainer").get(0),data);
         return ;
     }
  }

  html = ` ${BackGroundDiv}
  <table  FormName = "${FormName}"  class="window-d3"  id="${name}" style="  background-color: RGB(255,255,255);position: absolute;  border-radius: 10px;">
    <tr style="background-color: RGB(155,155,155);height : 30px; ">
        <td style=" text-align: center;border-radius: 5px;" id="title${name}">${title}</td>
        <td style=" text-align: right;  width: 25px;padding:5px ;border-radius: 5px;">
            <button style="display:inline ;right: 0; bottom: 0;border-radius: 5px;"  class="window-d3-btn-close" onclick = 'close();$("table.window-d3#${name}").empty().remove();$("#backGround${name}").empty().remove();'>X</button>
        </td>
    </tr>
    <tr>
        <td colspan="2" class="window-d3-content" style=" vertical-align: top;text-align: left;"></td>
    </tr>
    <script>
        $("#backGround${name}").on( "click", function() {
           close();$("table.window-d3#${name}").empty().remove();$("#backGround${name}").empty().remove();
        });
        $("#title${name}").on( "dblclick", function() {
            $("table.window-d3#${name}").css({"top":'5%'});
            $("table.window-d3#${name}").css({"left":'5%'});
            $("table.window-d3#${name}").css({"width":'90%'});
            $("table.window-d3#${name}").css({"height":'90%'});
        });
        var onLoadFunModalWindow = function(){
            var title = $("table.window-d3#${name} .window-d3-content").get(0).childNodes[0].getAttribute("title");
            if (title){
                $('#title${name}').html(title);
            }
            var caption = $("table.window-d3#${name} .window-d3-content").get(0).childNodes[0].getAttribute("title");
            if(caption){
                $('#title${name}').html(caption);
            }
            $(this).off("DOMSubtreeModified")
        }
        $($("table.window-d3#${name} .window-d3-content").get(0)).on("DOMSubtreeModified",onLoadFunModalWindow);
    </script>
</table>`;
    $(".D3MainContainer").append(html);
    dom = $("table.window-d3#"+name+" .window-d3-content").get(0);
    nam =  D3Api.showForm(FormName, dom, data);
    $("#"+name).resizable().draggable();
    $("#"+name).css({
       "left"  : leftwin,
       "width" : widthwin,
       "height": heightwin,
    })
    $('#'+name).css({"top":topwin});
    return $("table.window-d3#"+name+" ").get(0);
}
