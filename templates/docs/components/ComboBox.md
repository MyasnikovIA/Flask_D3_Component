# ComboBox

Компонент ComboBox представляет собой элемент формы для создания поля, выбор значения которого осуществляется из выпадающего списка элементов (ComboItem).


## Компонент ComboItem

Компонент ComboItem представляет собой единичный элемент из выпадающего списка компонента ComboBox. Заполняется двумя способами:
статически, используя свойства caption и value
динамически из dataset, используя свойства data, repeat и dataset

## Примеры синтаксиса

Пример  ComoBox со статическим списком элементов

```xml
<component cmptype="ComboBox" name="f_sex">
        <component cmptype="ComboItem" caption=""        value=""/>
        <component cmptype="ComboItem" caption="Женский" value="0"/>
        <component cmptype="ComboItem" caption="Мужской" value="1"/>
</component>
```

Пример ComoBox с динамическим списком элементов

```xml
<component cmptype="ComboBox" name="q_status_payment" >
	<component cmptype="ComboItem" data="value:id;caption:caption" repeat="0" 		dataset="ADDR_TYPE_dataset"/>
</component>
```

Эти  способы можно комбинировать между собой. Например,

```xml
<component cmptype="ComboBox" name="q_status_payment" >
	<component cmptype="ComboItem" caption=""        value=""/>
	<component cmptype="ComboItem" data="value:id;caption:caption" repeat="0" 		dataset="ADDR_TYPE_dataset"/>
</component>
```

## Статические свойства компонента ComboBox

|Название|Значение|Тип|Возможнные значения|
|---|---|---|---|
|mode|режим работы при ручном вводе. Имеет смысл только при readonly="false". По умолчанию filter|string|**filter**-при вводе текста в комбобокс происходит фильтрация строк. Количество элементов в выпадающем списке уменьшается за счет отсечения неподходящих строк. **none** - отсечение не происходит|
|readonly|разрешить/запретить ручной ввод в  ComboBox. По умолчанию false|boolean||
|placeholder|Выводит текст-подсказку внутри ComboBox, который исчезает при получении фокуса|string||
|additem|Добавлять новйый элемент списка, если была задана пара value и caption, которых нет в списке. По умолчанию false.|boolean||

## Динамические свойства компонента ComboBox

|Название|Значение|Тип|Возможнные значения|get|set|
|---|---|---|---|---|---|
|caption|Отображаемое значение|string||\+||\+||
|enabled|Доступность компонента|boolean||\-||\+||
|focus|Фокус|boolean||\-||\+||
|input|Свойство только для чтения. Позволяет получиьт dom-объект input из ComboBox|dom||\+||\-||
|item|текущая активная строка ComboBox|dom||\+||\-||
|onchange|Метод который сработает после редактирования значения компонента|string||\-||\+||
|readonly|разрешить/запретить ручной ввод в  ComboBox|boolean||\+||\+||
|value|Значение|string||\+||\+||

## Статические свойства компонента ComboItem

|Название|Значение|Тип|Возможнные значения|
|---|---|---|---|
|caption|Отображаемое значение|string||
|value|Значение|string||
|selected|Указывает выбраную строку. |boolean||

## Динамические свойства компонента ComboItem

|Название|Значение|Тип|Возможнные значения|get|set|
|---|---|---|---|---|---|
|caption|Отображаемое значение|string||\+||\+||
|value|Значение|string||\+||\+||

## Примечание

* Для того, чтобы заполнить ComboBox данными из запроса, необходимо указать у ComboItem свойства data, dataset, repeat. Подробнее в статье [[Способы задания свойств компонентов]]
* В случае, когда строками выпадающего списка должны быть данные из уже настроенной композиции, используется компонент [UnitEdit](UnitEdit.md), у которого указывается type= «ComboBox»
