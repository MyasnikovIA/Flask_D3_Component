<div cmptype="Form" oncreate="Form.onCreate()"   >
    <!--
       D3Api.showForm('Tutorial/Window/ParentWin');
       openD3Form('Tutorial/Window/ParentWin');
    -->
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onCreate = function() {

            }

            Form.onOpenWin = function() {
                openD3Form('Tutorial/Window/ChildWin', true,
                        {   width: 800,
                            height: 600,
                            vars: {
                                AGENT_ID: getValue("ImputComponrnt")
                            },
                            onclose: function(mod) {
                                console.log('mod',mod);
                                if(mod) {
                                    alert(mod.return_txt);
                                    setValue("ResultComponrnt",mod.return_txt)
                                }
                            }
                        }
                );
            }
        ]]>
    </cmpScript>

    <br/>
    <cmpButton name='test' caption="Open Modal Windows " onclick="Form.onOpenWin()"/>
    <br/> <cmpLabel caption="Значение для модального окна"/> <cmpEdit name="ImputComponrnt" value="111111"/>
    <br/> <cmpLabel caption="Значение из окна"/> <cmpEdit name="ResultComponrnt" value="______"/>


    <br/><cmpButton name='test' caption="setValue" onclick='setValue("ImputComponrnt","555555");'/>
</div>


