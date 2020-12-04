<div cmptype="Form" oncreate="Form.onCreate()"   >
    <!--
       D3Api.showForm('Tutorial/DateEdit/DateEdit');
       openD3Form('Tutorial/DateEdit/DateEdit');
    -->
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onCreate = function() {
            }
            Form.onRunDataSet = function() {
            }
        ]]>
    </cmpScript>


    <br/><cmpDateEdit name="MySel"/>
    <br/><cmpDateEdit name="MySel1"  />

    <br/><cmpDateEdit name="MySel2"  width="120px"/>
    <br/><cmpDateEdit name="MySel3" style="width: 100%;"/>
    <br/><cmpDateEdit name="F_BIRTHDATE" typeMask="date" emptyMask="false" onkeypress="onEnter(Form.refreshData)"/>

    <br/><cmpDateEdit name="MySel1"  mask_type="time" shows_time="true"/>

    <br/><cmpButton name='test' caption="onRunDataSet" onclick="Form.onRunDataSet()"/>
</div>


