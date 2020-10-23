# HyperLink

Компонент HyperLink представляет собой элемент формы - ссылка.

## Атрибуты компонента HyperLink

|Название|Значение|Возможнные значения|По умолчанию|
|---|---|---|---|
|caption|Отображаемое значение|caption="Пользователь"||
|keyvalue|Значение value, доступное через getValue()|keyvalue="121"||
|keyvaluecontrol|Имя контрола откуда нужно брать value|keyvaluecontrol="nameCtrl"||
|title|Атрибут title html тега a (всплывающая подсказка)|title="Перейти в карточку пользователя"||
|target|Атрибут target html тега a|target="_blank" (открываем в новом окни)||
|unit|Раздел системы|unit="users"||
|composition|Композиция раздела. Если указана, то открываем композицию. Если нет, то карточку редактирования.|composition="default"||
| |Чтобы открыть композицию без кнопок выбора записи, нужно добавить атрибут comp_request="show_buttons:const:false". Если нужно открыть композицию без передачи ID, нужно добавить атрибут emptyvalue="true"||
|method|Метод показа раздела|method="GRID"|"default"|
|is_view|Режим просмотра|is_view="true"|"false"|
|newthread|Открывать в новой нити|newthread="true"|"false"|
|emptyvalue|Допустимость неуказанного значения value|emptyvalue="true"|"false"|
|comp_vars|Переменные для протаскивания в объект vars при открытии формы раздела в формате ИМЯ:const/var/ctrl:ЗНАЧЕНИЕ|comp_vars="varName:const:Значение"|
|comp_request|Переменные для протаскивания в объект request при открытии формы раздела в формате ИМЯ:const/var/ctrl:ЗНАЧЕНИЕ|comp_request="varName:const:Значение"|
|data|Данные для компонента из “dataset”. В данном случае данные представляются в виде пары: ключ:значение.|data="caption:field_caption;value:field_value;unit:field_unit"|
|append_filter|Передача профилей фильтрации|string|-|-|

Чтение и изменение атрибутов можно делать также через методы getControlProperty("user_link_Ctrl", "имя_свойства")
и setControlProperty("user_link_Ctrl", "имя_свойства", "значение").

Для атрибутов "keyvalue" и  "caption" работают стандартные setValue(), getValue(), setCaption(), getCaption();

## Примеры использования
```xml
<cmpHyperLink name="user_link_Ctrl" caption="Пользователь" href="https://google.ru" target="_blank"/>
Обычная гиперссылка, открывающаяся в новой вкладке браузера.
```
```xml
<cmpHyperLink name="user_link_Ctrl" caption="Пользователь" href="https://google.ru" target="_blank" onclick="console.log('!!!')"/>
Сначала обрабатывается onclick, потом открывается ссылка в новой вкладке браузера.
```
```xml
<cmpHyperLink name="user_link_Ctrl" caption="Пользователь" href="https://google.ru" target="_blank" onclick="console.log('!!!');return false;"/>
Обрабатывается только onclick.
```
```xml
<cmpHyperLink name="user_link_Ctrl" caption="Пользователь" keyvalue="https://google.ru" target="_blank"/>
Работает как гиперссылка, открывающаяся в новой вкладке браузера, но значение берется из "keyvalue".
Можно также задавать значение через setValue('user_link_Ctrl', 'https://google.ru');
```
```xml
<cmpHyperLink name="user_link_Ctrl" caption="Пользователь" target="_blank"/>
Работает как гиперссылка, открывающаяся в новой вкладке браузера.
Значение задается в JavaScript через setValue('user_link_Ctrl', 'https://google.ru'); 
```
```xml
<cmpHyperLink name="user_link_Ctrl" caption="Пользователь" unit="users" keyvalue="1" target="_blank"/>
Открываем карточку редактирования раздела "users" в новой вкладке.
По умолчанию используем метод показа "default"
Вместо keyvalue="1" можно указывать значение через setValue('user_link_Ctrl', '1');
```
```xml
<cmpHyperLink name="user_link_Ctrl" caption="Пользователь" unit="users" keyvaluecontrol="user_Ctrl" newthread="true" comp_vars="agent:ctrl:agent_Ctrl"/>
Открываем карточку редактирования раздела "users" в новой нити.
Значение value берем из контрола "user_Ctrl".
Дополнительно прокидываем в vars свойство "agent" со значением из контрола "agent_Ctrl"
```
```xml
<cmpHyperLink name="user_link_Ctrl" caption="Пользователь" unit="users" method="GRID" keyvalue="1"/>
Открываем карточку редактирования раздела "users", используя метод показа "GRID"
```
```xml
<cmpHyperLink name="user_link_Ctrl" caption="Пользователь" unit="users" composition="default"/>
Открываем композицию "default" раздела "users".
```
```xml
<cmpHyperLink name="user_link_Ctrl" caption="Пользователь" unit="users" composition="default"  target="_blank" keyvalue="1"/>
Открываем композицию "default" раздела "users" в новой вкладке и позиционируемся на записи со значением 1
Вместо keyvalue="1" можно указывать значение через setValue('user_link_Ctrl', '1');
```
```xml
<cmpHyperLink name="user_link_Ctrl" caption="Пользователь" unit="users" composition="default" emptyvalue="true" comp_request="show_buttons:const:false"/>
Открываем композицию "default" раздела "users".
Если value передаваться не будет, то обязателельно наличие атрибута emptyvalue="true" (снимает обязательность указания value).
Атрибут comp_request (прокидывание свойства в объект request формы) нужен для скрытия кнопок выбора из композиции (Ок/Отмена) 
```
### Использование в Grid
```xml
<cmpColumn caption="Пользователь" field="user_caption" sort="user_caption" filter="user_caption" sortorder="" like="both">
    <cmpHyperLink data="caption:user_caption;value:user" unit="users"/>
</cmpColumn>
Открываем карточку редактирования раздела "users", используя метод показа "default".
Значение value и caption берется из полей датасета грида.
```
```xml
<cmpColumn caption="Пользователь" field="user_caption" sort="user_caption" filter="user_caption" sortorder="" like="both">
    <cmpHyperLink data="caption:user_caption;value:user;unit:field_unit;target:field_target" method="GRID"/>
</cmpColumn>
Открываем карточку редактирования, используя метод показа "GRID".
Значения раздела (unit), target, value и caption берутся из полей датасета грида.
```
### Пример использования append_filter
 В атрибуте указываются коды профилей фильтрации, которые необходимо применить на вызываемой форме.

 Синтаксис: append_filter="тип_значения:значение"
 
 тип_значения - может быть const (константа), var (значение берется из переменной), ctrl (значение берется из value компонента).
 
 Если тип не указан, что считаем константой, т.е. допустИма следующая запись: append_filter="cmn_products"
 
 Возможна передача нескольких профилей фильтрации через разделитель ";"
 ```xml
 <cmpHyperLink name="user_link_Ctrl" caption="Пользователь" unit="users" composition="default" append_filter="const:default_profile;var:data.id"/>
```
[Подробная документация инструмента "Профили фильтрации"](https://conf.bars.group/pages/viewpage.action?pageId=69246255)
