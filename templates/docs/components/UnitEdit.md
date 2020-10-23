# UnitEdit

Компонент UnitEdit представляет собой элемент формы для создания поля, выбор значения которого осуществляется из выпадающего списка элементов (ComboItem).Компонент UnitEdit представляет собой элемент формы - текстовое поле для ввода данных, с возможностью выбора значений из справочника. В отличие от компонента ButtonEdit, ссылаться можно только на справочники, сгенерированные по умолчанию самой системой(кроме типа переход в справочник).

Для данного компонента также можно задать тип отображения (атрибут type). По умолчанию тип отображения равен - переход в справочник. Если указать type="ComboBox", данные из композиции будут представлены в виде выпадающего списка. (Не рекомендуется использовать при больших разделах, так как пользователю будет неудобно искать нужные данные).

## Примеры синтаксиса

```xml
<component cmptype="UnitEdit" name="BANK_NAME" unit="ag_banks" composition="default" readonly="true" data="value:bank;caption:bank_caption"/>
```

## Cвойства компонента UnitEdit

|Название|Значение|Тип|Возможнные значения|get|set|
|---|---|---|---|---|---|
|readonly|разрешить/запретить ручной ввод в  UnitEdit. По умолчанию false|boolean||||
|placeholder|Выводит текст-подсказку внутри UnitEdit, который исчезает при получении фокуса|string||||
|caption|Отображаемое значение|string||\+|\+|
|clearbutton|Добавляет к компоненту дополнительную кнопку – “Очистить данные”. При нажатии на кнопку происходит обнуление значений атрибутов “caption” и “value”.|string||\+|\+|
|composition|Наименование композиции|string||\+|\+|
|data|Данные для компонента из “dataset”. В данном случае данные представляются в виде пары: ключ – значение.|string||\+|\+|
|enabled|Доступность компонента|boolean||\-|\+|
|focus|Фокус|boolean||\-|\+|
|multisel|Определяет возможность выбора из справочника несколько значений. По умолчанию “false”.|boolean||\+|\+|
|multiline|Используется для применения стиля к компоненту - многострочное отображение выбранных данных. По умолчанию “false”.|boolean||\+|\+|
|readonly|разрешить/запретить ручной ввод в  UnitEdit|boolean||\+|\+|
|type|Тип отображения. По умолчанию - переход в справочник|string||\+|\+|
|unit|Раздел, в который будет выполнен переход, по нажатию на кнопку - “Выбор из справочника”|string||\+|\+|
|value|Значение|string||\+|\+|
|wrap|Используется для применения стиля к компоненту -  разделение выбранных записей по строкам. По умолчанию “false”.|boolean||\+|\+|
|beforeopen|Используется для передачи параметров в форму composition раздела, по-умолчанию не указывается.|function|||\+|
|append_filter|Передача профилей фильтрации|string|-|-|

### Пример использования beforeopen.

Свойство beforeopen используется для того, чтобы передать параметры с формы, на которой располагается компонент UnitEdit.
Работает совместо со свойством composition и чаще всего используется тогда, когда на composition настроена форма подмены.

 ```xml
    <cmpUnitEdit name="learning_offer_caption_Ctrl" unit="ca_comm_offerreqs" composition="default"
                 beforeopen="function (a) {return {fltr_active: a}} (getVar('pid'));"/>
 ```
 
Из формы расположения компонента learning_offer_caption_Ctrl передаем значение параметра pid в объекте со свойством fltr_active.
При нажатии на кнопку “Выбор из справочника” будет выполняться функция:

 ```xml
    var fdata_5ce7e24d42045 = function (a){return {fltr_active: a}}(getVar('pid'));
    D3Api.UnitEditCtrl.callComposition(this,'System/composition',
                                            {
                                             request: {unit:'ca_comm_offerreqs', composition:'default', show_buttons: true},
                                             vars: !!fdata_5ce7e24d42045 && typeof(fdata_5ce7e24d42045) === "object" ? Object.assign({LOCATE: getValue('learning_offer_caption_Ctrl'), fdata : fdata_5ce7e24d42045}, fdata_5ce7e24d42045) : {LOCATE: getValue('learning_offer_caption_Ctrl\'), fdata: fdata_5ce7e24d42045}
                                            },null,null
                                             );
 ```
 ### Пример использования append_filter
 В атрибуте указываются коды профилей фильтрации, которые необходимо применить на вызываемой форме.

 Синтаксис: append_filter="тип_значения:значение"
 
 тип_значения - может быть const (константа), var (значение берется из переменной), ctrl (значение берется из value компонента)
 
 Если тип не указан, что считаем константой, т.е. допустИма следующая запись: append_filter="cmn_products"
 
 Возможна передача нескольких профилей фильтрации через разделитель ";"
 ```xml
 <cmpUnitEdit name="test_Ctrl" unit="unitcode" composition="default" append_filter="const:default_profile;var:data.id"/>
```
[Подробная документация инструмента "Профили фильтрации"](https://conf.bars.group/pages/viewpage.action?pageId=69246255)
