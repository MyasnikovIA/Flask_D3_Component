# CheckBox

Компонент CheckBox представляет собой элемент формы - переключатель.

## Примеры синтаксиса

```xml
<component cmptype="CheckBox" name="rf_r" valuechecked="1" valueunchecked="0" caption="Нерезидент РФ" onchange="Form.onChangeRF();"/>
<cmptCheckBox  name="rf_r" valuechecked="1" valueunchecked="0" caption="Нерезидент РФ" onchange="Form.onChangeRF();"/>
```

### Свойства компонента CheckBox

|Название|Значение|Тип|Возможнные значения|get|set|
|---|---|---|---|---|---|
|caption|Отображаемое значение|string||\+|\+|
|checked|Используется для определения состояния переключателя при открытии формы. По умолчанию “false”.|boolean||\+|\-|
|clearbutton|Добавляет к компоненту дополнительную кнопку – “Очистить данные”. При нажатии на кнопку происходит обнуление значений атрибутов “caption” и “value”.|boolean||\-|\+|
|data|Данные для компонента из “dataset”. В данном случае данные представляются в виде пары: ключ – значение.|string||\-|\+|
|enabled|Доступность компонента|boolean||\-|\+|
|focus|Фокус|boolean||\-|\+|
|onchange|Макрос, который должен сработать при изменении значения компонента|string||\+|\+|
|value|Значение|string||\+|\+|
|valuechecked|Значение при включённом checkbox.|string||\+|\+|
|valueunchecked|Значение при выключенном checkbox.|string||\+|\+|
