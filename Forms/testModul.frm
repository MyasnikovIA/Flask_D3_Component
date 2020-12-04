<div cmptype="Form" class="d3form formBackground" onshow="Form.onShow();">
   <cmpScript name="ffffff">
        <![CDATA[
            Form.onShow = function() {
                setVar('userName',"Alania");
                setVar('IncUserName',"IncAlania");
            }
        ]]>
   </cmpScript>
    <cmpModule  module="Test/testInclude" name="TEST_MODULE" mode="post">
        <component cmptype="ModuleVar" name="LPU"      src="LPU" srctype="session"   />
        <component cmptype="ModuleVar" name="userName" put="userName" src="userName" srctype="var"/>
        <component cmptype="ModuleVar" name="IncUserName" put="IncUserName" src="IncUserName" srctype="var"/>
    </cmpModule>
    <cmpButton  caption="Test exe Module" onclick="executeModule('TEST_MODULE',function(){alert(getVar('userName')+' | '+getVar('IncUserName'))})"/>
</div>
