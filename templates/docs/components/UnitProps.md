# UnitProps

## Атрибуты

* name- имя компонента
* unit - имя раздела, к которому привязываются доп свойства
* subunit
* unitid_varname-при необходимости указывается имя переменной из которой берется id записи для которой берем доп. св-ва
* activateoncreate
* bind_action - атрибут используется для указания в какие акшины надо забиндиться каждому контролу
* label_width-
* valueWidth
* depend_control_name - имя контрола, который будет зависить от заполненности поля. Используется только если доп свойство обязательно для заполнения в этом разделе (из таблицы core.v_unitprop_links). Если поле обязательно для заполнения, а depend_control_name не заполнено, то  поле досвойства будет просто подкрашиваться желтым.

## Пример

```xml
 <component cmptype="UnitProps" name="extinfo" unit="mo_medequip_transport" unitid_varname="id" bind_action="ModMedEq" label_width="270" depend_control_name="BUTTON_OK"/>
```
