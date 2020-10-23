<div cmptype="Form" class="Main ActiveDashBoard box-sizing-force"  oncreate="Form.onCreate()" name="MAINFORM" title="Тестовое окно" >
    <!--
        openD3Form('Tutorial/Dependences/Dependences')
        D3Api.showForm('Tutorial/Dependences/Dependences', $(".D3MainContainer").get(0), {history: false});
    -->
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onCreate = function() {
               setVar("form_params","dddddddd");
               refreshDataSet('DB_MyDataSet');
            }
            Form.MySendPHP = function() {
                openD3Form('main',true)
            }
        ]]>
    </cmpScript>

    <cmpEdit name="RANGE_BEGIN" mask_template="9999999999" mask_original="0000000000" emptyMask="true" width="100%"/>
    <cmpEdit name="RANGE_END" mask_template="9999999999" mask_original="0000000000" emptyMask="true" width="100%"/>
    <cmpButton name="ButtonOk" onclick="Form.MySendPHP();" caption="Сохранить"/>
    <cmpMask controls="RANGE_BEGIN;RANGE_END"/>
    <cmpDependences required="RANGE_BEGIN;RANGE_END" depend="ButtonOk"/>

</div>

