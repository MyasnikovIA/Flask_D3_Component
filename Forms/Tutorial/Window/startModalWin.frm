<div cmptype="Form" class="Main ActiveDashBoard box-sizing-force"  oncreate="Form.onCreate()" name="MAINFORM" >
    <!--
        openD3Form('Tutorial/Window/startModalWin')
        D3Api.showForm('Tutorial/Window/startModalWin', $(".D3MainContainer").get(0), {history: false});
    -->
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onCreate = function() {
            }
            Form.selectOkato = function() {
                win = openD3Form('selectValue',true,{left:10,vars:{valueVar: 'ddddddddddddd' },onclose:[closure(Form.setResult)]});
            }
            Form.setResult = function(res) {
                if(res) {
                    alert( res.value );
                }
            }

        ]]>
    </cmpScript>


<!--  =========================   -->
    <component cmptype="Script">
        Form.selectOkato = function() {
            win = openD3Form('Tutorial/Window/selectValue',true,{left:100,vars:{valueVar: getValue('can_edit') },onclose:[closure(Form.setResult)]});
        }
        Form.setResult = function(res) {
            if(res) {
                setValue('consoleWeb' ,  res.value );
            }
        }
    </component>
    <br/>

    <cmpEdit  value="Значение , которое парадается в модальное окно" name="can_edit" caption="Переменная" height="40px" width="850" ></cmpEdit>
    <cmpButton caption="Модальное окно" onclick="Form.selectOkato()"></cmpButton>
    <cmpTextArea value="Результат" name="consoleWeb" height="320px" width="840px" left="10px"></cmpTextArea>

    <div  name="can_edit" class="ctrl_edit editControl box-sizing-force" style=" width:220; height:25px" id="d3ctrl651601829680105">
        <div class="edit-input">
            <input text="" value="Значение , которое парадается в модальное окно" onchange="D3Api.stopEvent();" style="width:200;height:75%;"/>
        </div>
    </div>

<!--  =========================   -->

</div>

