# EditWithMask

Компонент EditWithMask представляет собой текстовое поле для ввода данных с навешанным форматированием и маской.
Рализация: компонент преобразуется в 2 связанных компонента: Edit и Mask.

Основное назначение: является родительским классом для полей ввода со специфическим форматированием (EditFinance)

Все основные свойства наследуются от компонента Edit.

## Примеры синтаксиса

```xml
 <cmpEditWithMask name="field_editmask_Ctrl" width="100" format="{toType : 'hours'}" mask_type="hoursminutes"/>
```

## Свойства компонента EditWithMask

|Название|Значение|Тип|Возможные значения|
|---|---|---|---|
|format|Опции форматирования. Подробнее смотри метод onformat компонента Edit|string|{toType : 'number', options : {maximumFractionDigits:20}}|
|mask_type|Тип маски компонента Mask|string|fnumberlocal|
