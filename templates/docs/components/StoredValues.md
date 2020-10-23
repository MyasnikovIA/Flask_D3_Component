# StoredValues

Компонент StoredValues позволяет сохранять заполненные значения(получаемые функцией getValue) контролов формы под именем и использовать их как шаблон для заполнения в последствии.

## Примеры синтаксиса

```xml
<cmpStoredValues name="svc_1" entity_name="QueryBuilder/query_builder" params="ta1;ta2"/>
```

## Cвойства компонента UnitEdit

|Название|Значение|Тип|Возможнные значения|get|set|
|---|---|---|---|---|---|
|entity_name|Имя формы(сущности)|string||||
|params|При указании будет сохранять значения с контролов с перечисленными именами|string||||

## Ограничения

Работает только с контролами типов:Edit,TextArea,ComboBox,DateEdit,CheckBox,RadioGroup
