# Dialog

Компонент Dialog предназначен для вывода информации и (или) получения ответа от пользователя

## Примеры синтаксиса

```xml
<cmpDialog name="d_recalculate_pos_select" agree_caption="Пересчитать" agree_primary="true"
           agree="Form.recalculatePosSelect(true);"
           cancel_caption="Отмена"
           content="Полный пересчет для выбранных позиций приведет к переподбору основных цен! Пересчитать?"/>
```
```xml
<cmpDialog name="d_recalculate_pos_select" show_buttons="false">
<div style="text-align: center;">
	<cmpLabel caption="Какой то текст"/>
</div>
<div style="text-align: center;">
 <cmpButton caption="Какая то кнопка"/>
</div>
</cmpDialog>
```
## Свойства компонента Dialog

|Название|Значение|Тип|По умолчанию|Возможнные значения|
|---|---|---|---|---|
|caption|Заголовок|string|
|content|Основной текст|string|
|agree_caption|Заголовок для кнопки "Да", по умолчанию "Да"|string|
|agree|Функция которая выполнится при нажатии на кнопку "Да". Если свойство не указано, кнопка не показывается|string|
|cancel_caption|Заголовок для кнопки "Нет", по умолчанию "Нет"|string|
|cancel|Функция которая выполнится при нажатии на кнопку "Нет", по умолчанию стоит "setVisible('dialog', false)". Кнопка показывается всегда|string|
|show_buttons|Показывать div с кнопками|boolean|true|true, false|
|align|Определяет горизонтальное выравнивание текста в компоненте|string|пусто|center, right, left|
|agree_primary|Добавить класс primary на кнопку "Да"|string|false|true, false|

## Функции компонента Dialog
|Функция|Результат|
|---|---|
|setValue(<имя компонента dialog>, <значение>)|меняет значение свойства content|
|setCaption(<имя компонента dialog>, <значение>)|меняет значение свойства caption|
|setVisible(<имя компонента dialog>, <значение>)|мпоказать/скрыть диалоговое окно
|