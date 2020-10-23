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
