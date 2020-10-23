# Работа с репитерами

Основные функции js для работы с репитором и его клонами:
* ```getRepeater('repeatername');``` - возвращает объект репитора по его имени
* ```getClone(element, 'repeatername');``` - возвращает dom клона внутри которого лежит элемент element для репитора 'repeatername'
* ```getRepeater('repeatername').addClone();``` - добавляет клон, в функцию можно передать объект с данными для клона, например ```getRepeater('repeatername').addClone({example: 'Пример'});```
* ```getRepeater('repeatername').removeClone(getClone(element, 'repeatername'));``` - удаляет клон, на вход dom клона который нужно удалить

```js
Form.nameJsFunction = function(parentField/*имя поля из родителя - id*/, data/*объект данных*/) {
    if(data.pid)
        return data.pid;
    else
        return undefined;
};
```

Можно сколь угодно сложно комбинировать эти варианты, например ```parent="name_repeater_parent_1:pid:col1=colPar1:col2=@getParent;name_repeater_parent_2:pid"```

### Атрибут condition

Служит для выборки клонов, по условию. Есть несколько вариантов использования:
* condition="col=2" - оставляет при клонировании только те клоны, для которых справедливо условие поле col равно 2
* condition="col=@nameJsFunction" - оставляет при клонировании только те клоны, для которых функция nameJsFunction возвращает true
```js
Form.nameJsFunction = function(condField/*имя поля - col*/, data/*объект данных*/) {
    if(data[condField] == 'example')
        return true;
    else
        return false;
};
``` 
