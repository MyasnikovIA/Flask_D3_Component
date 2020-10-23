# Label

Компонент Label представляет собой элемент формы - надпись.

## Примеры синтаксиса

```xml
<component cmptype="Label" name="system_name_label" caption="Наименование системы: "/>
<cmpLabel name="label_date_Ctrl" format="{toType:'date', mask:'m/Y'}"/>

```
## Свойства компонента Label

|Название|Значение|Тип|Возможнные значения|get|set|
|---|---|---|---|---|---|
|caption|Отображаемое значение|string||\+|\+|
|data|Данные для компонента из “dataset”. В данном случае данные представляются в виде пары: ключ – значение.|string||\-|\+|
|enabled|Доступность компонента|boolean||\-|\+|
|focus|Фокус|boolean||\-|\+|
|onchange|Метод, который будет выполняться после изменения значения компонента.|string||\-|\+|
|format|Настройки форматирования|string|{toType : 'number',  options : {minimumFractionDigits:0, maximumFractionDigits:12}}||

## Примеры форматирования

Финансовый формат: {toType : 'number', options : {minimumFractionDigits:2, maximumFractionDigits:2}}
Интервал в часах: {toType : 'hours'}
Дата/время по маске: {toType:'date', mask:'m/Y'}, {toType:'date', mask:'d.m.Y H:i'}
