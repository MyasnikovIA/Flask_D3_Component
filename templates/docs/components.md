Компоненты
=============================

Все основные компоненты являются наследниками компонента  BaseCtrl.
У каждого компонента есть свойства, которые можно задать при разработке формы (так называемые статические свойства) и свойства, которые можно получать/изменять в процессе работы пользователя с формой (динамические свойства).
Все динамические свойства можно получать/изменять с помощью функции

```js
                getControlProperty('Имя компонента','имя свойства');// получить значение свойства
                setControlProperty('Имя компонента','имя свойства', значение свойства);// установить значение свойства
```

Подробнее в статье [Способы задания свойств компонентов](components/properties.md)

[Base](components/Base.md) - Базовый класс

[Form](components/Form.md) - компонент Форма.

Поля ввода:
--------------------

* [Button](components/Button.md)
* [ButtonEdit](components/ButtonEdit.md)
* [CheckBox](components/CheckBox.md)
* [ComboBox](components/ComboBox.md)
* [DateEdit](components/DateEdit.md)
* [Edit](components/Edit.md)
* [EditWithMask](components/EditWithMask.md)
* [EditHours](components/EditHours.md)
* [EditFinance](components/EditFinance.md)
* [Expander](components/Expander.md)
* [HyperLink](components/HyperLink.md)
* [Image](components/Image.md)
* [Label](components/Label.md)
* [TextArea](components/TextArea.md)
* [Range](components/Range.md)
* [RadioGroup](components/RadioGroup.md)
* [SelectList](components/SelectList.md)

Отображение данных:
--------------------

* [Grid](components/Grid.md)
* [Tree](components/Tree.md)

Мета-компоненты:
--------------------

* [UnitEdit](components/UnitEdit.md)
* [UnitView](components/UnitView.md)
* [UnitEditGenerate](components/UnitEditGenerate.md)
* [UnitProps](components/UnitProps.md)
* [Composition](components/Composition.md)

Запросы к серверу:
--------------------

* [Action](components/Action.md)
* [DataSet](components/DataSet.md)

Прочие
--------------------

* [Dependences](components/Dependences.md)
* [PopupMenu](components/PopupMenu.md)
* [Mask](components/Mask.md)
* [File](components/File.md)
* [PageControl](components/PageControl.md)
* [SubForm](components/SubForm.md)
* [Репитеры](components/Repeater.md)
* [RepeaterStyler](components/RepeaterStyler.md)
* [StoredValues](components/StoredValues.md)
* [Расширенные настройки шоу-методов](show_methods/settings.md)
