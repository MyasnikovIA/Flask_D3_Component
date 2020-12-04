# Flask_D3_Component
Трансляция фреймворка D3 от компании Bars-груп  с PHP на Python

Проект находится в стадии активной разработки...

Пример открытия  окна формы  из JS кода
```
     D3Api.showForm('main', undefined, {history: false , 'modal_form':true});
     D3Api.showForm('main', $(".D3MainContainer").get(0), {history: false});
     openD3Form('main')      // запуск формы на весь экран
     openD3Form('main',true) // Запуск формы в модальном окне
```
Необходимо реализовать компоненты для форм
<br/> Формы  расоложены в папке **Forms**      
<br/>Конфигурацию проекта можно изменить в **Etc/conf.py**

Пример создания окна  
```xml
<div cmptype="Form" class="Main ActiveDashBoard box-sizing-force" name="MAINFORM" title="Тестовое окно" >
    <!--
    Запуск формы в JS консоли
        openD3Form('Tutorial/Edit/Edit')
        D3Api.showForm('Tutorial/Edit/Edit', $(".D3MainContainer").get(0), {history: false});
    -->
        <cmpEdit name="FILTER_CONTACT" datafield="PHONE" width="100%"
                    regularMask="^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$"
                    originalMask="+7(999)999-99-99"
                    templateMask="+7(999)999-99-99"
        />
    <cmpMask controls="FILTER_CONTACT" />
</div>
```

```xml
<div cmptype="Form" >
     <!--
     Запуск формы в JS консоли
        D3Api.showForm('Tutorial/Action/ActionPythonScript');
        openD3Form('Tutorial/Action/ActionPythonScript')
     -->
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onRunModule = function() {
               setVar("form_params","fffffffff")
               // запустить Python скрипт
               executeAction('checkHelpRight', function(){
                    alert(getVar('can_edit'));
               });
            }
        ]]>
    </cmpScript>
    
    <!-- Python скрипт -->
    <cmpAction name="checkHelpRight" query_type="server_python">
         can_edit = [1,2,3,4,5,form_params]
         varNoVisible=[1,2,3,4,5]
        <cmpActionVar name="form_params"    src="form_params"   srctype="var"/>
        <cmpActionVar name="can_edit"       src="can_edit"      srctype="var" put=""/>
    </cmpAction>
    <cmpButton name='test' caption="Form.onRunModule" onclick="Form.onRunModule()" />

</div>

```
Примера реализации форм в папке  Forms/Tutorial


