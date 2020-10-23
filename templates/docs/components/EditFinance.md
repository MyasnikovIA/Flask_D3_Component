# EditFinance

Компонент EditFinance представляет собой поле для ввода данных в финансовом формате.

Для отображения и редактирования числа в качестве разделителя (целой и дробной части, а также групп разрядов) используются настройки локали.

Все основные свойства наследуются от компонента Edit.

## Примеры синтаксиса

```xml
 <cmpEditFinance name="field_finance_Ctrl" width="100"/>
```

## Свойства компонента EditFinance

|Название|Значение|Тип|Значение по умолчанию|
|---|---|---|---|
|format|Опции форматирования. Подробнее смотри метод onformat компонента Edit|string|{toType : 'number', options : {minimumFractionDigits:2,maximumFractionDigits:2}}|
|mask_type|Тип маски компонента Mask|string|fnumberlocal|
