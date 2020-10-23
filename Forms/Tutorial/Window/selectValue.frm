<div cmptype="Form" style="padding-bottom: 50px;" class="formBackground box-sizing-force" oncreate="Form.onCreateOkato();" caption="Выбор из справочника">
    <cmpEdit  value="Значение которое возвращается из модального окна" name="res_edit"  > </cmpEdit>
     <cmpScript>
        Form.onCreateOkato = function() {
            setCaption('from_parent','Из родительского окна:'+getVar('valueVar')+" " )
        }
        Form.selectOkato = function() {
            close({value: getValue('res_edit')});
        }
    </cmpScript>
    <div style="padding-top: 10px;height: 40px;text-align: right;">
        <cmpLabel  caption="ddddddddddddd" name="from_parent"/>
        <cmpButton  caption="Oк" onclick="Form.selectOkato();"/>
        <cmpButton caption="Отмена" onclick="close()"/>
    </div>
</div>
