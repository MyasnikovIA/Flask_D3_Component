# Expander

Компонент Expander предназначен для скрытия/раскрытия определенного элемента или группы элементов формы (экспандер).

## Примеры синтаксиса

Пример  Expander с влиянием на определенный элемент формы

```xml
<component cmptype="Expander" caption="Действует на определенный элемент  формы" control="panel"/>
     <div cmptype="Base" name="panel">
     <component cmptype="Edit" />
     <component cmptype="Button" />
</div>
```

Пример Expander , который влияет на группу элементов

```xml
<component cmptype="Expander" value="true" caption="Действует на группу элементов формы ">
    <component cmptype="Edit" />
    <component cmptype="Edit" />
    <component cmptype="Button"/>
</component>
```

## Свойства компонента Expander

|Название|Значение|Тип|Возможнные значения|get|set|
|---|---|---|---|---|---|
|caption|Отображаемое значение|string||\+|\+|
|control|Идентификатор компонента (элемента) формы, который будет скрыт/раскрыт|string||\-|\+|
|enabled|Доступность компонента|boolean||\-|\+|
|focus|Фокус|boolean||\-|\+|
|mode|Используется для применения стиля к компоненту. По умолчанию horizontal|boolean|horizontal - горизонтальное отображение, vertical - вертикальное отображение|\-|\+|
|value|Значение компонента. Если значение равно “true”, то определенный элемент или группа элементов формы будут раскрыты. При значении равным “false” элементы будут скрыты.|string||\+|\+|
