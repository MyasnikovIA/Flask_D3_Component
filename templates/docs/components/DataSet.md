# DataSet

Компонент Dataset используется для получения результатов запроса более одной строки.

## Компонент DataSetVar

Компонент DataSetVar - значения переменных, которые передаются в запрос.

## Компонент BeforeSelect

В случае, если необходимо сделать дополнительный запрос до основного запроса, можно использовать компонент BeforeSelect.

```xml
<component cmptype="DataSet" name="DS_gisgmp_payments_default" activateoncreate="false" compile="true">
    <component cmptype="BeforeSelect">
        select core.f_urprivs8check_bppriv(:lpu,'gisgmp_payments_admin',null,0) is_admin
    </component>
...
```


## Пример синтаксиса

```xml
<component cmptype="DataSet" name="DS_gisgmp_members_default" activateoncreate="true" compile="true">
    SELECT
        t.id,
        t.member_name,
        t.member_inn,
        t.member_kpp,
        t.head_incomes_codes_code,
        t.member_type_name,
        t.institution_type_name,
        t.date_end,
        t.cid
    FROM gisgmp.v_gisgmp_members t,
        (select CASE :list WHEN '0' THEN :cid ELSE core.f_tree_list('core','v_catalogs','id','pid',:cid,1) END id) t2
    WHERE t.cid::text = t2.id::text
    @if(:notExclude){
        and t.id NOT  IN (SELECT d.member
        FROM gisgmp.v_gisgmp_nsi_patterns_delegate d
        WHERE d.pattern = :id)
    @}
        AND t.version = :version
    <component cmptype="DataSetVar" name="version" src="version" srctype="session"/>
    <component cmptype="DataSetVar" name="pid"  get="g0" src="PARENT"           srctype="var"/>
    <component cmptype="DataSetVar" name="cid"  get="g1" src="CATALOGS"         srctype="ctrl" parent="DS_catalogs_default:id"/>
    <component cmptype="DataSetVar" name="list" get="g2" src="CATALOGS:list"    srctype="ctrl"/>
    <component cmptype="DataSetVar" name="id"   get="g3" src="id"               srctype="var"/>
</component>
```

## Свойства компонента DataSet

|Название|Значение|Тип|Возможные значения|get|set|
|---|---|---|---|---|---|
|activateoncreate|Данные запроса обновляются при открытии формы, на котором находится данный компонент|boolean||\+|\+|
|compile|Использовать компилирование запроса перед выполнением(@)|boolean||\+|\+|
|name|Имя компонента|string||\+|\+|
|parent|Указание связи между компонентами DataSet|string||\+|\+|
|query_type|Свойство указывает на то, что в этом запросе будет использование методов php|string|server_php|\+|\+|
|hierarchy|Свойство для фильтрации и отображения иерархии в компоненте [[Tree]]|string|{модуль}:{unitcode таблицы или представления}:{первичный ключ (id)}:{поле, отвечающее за иерархию в таблице}:{переменная иерархии}}|||
|unitcode|Указание раздела по умолчанию для профилей фильтрации|string||

### Примечание:

Строка, начинающаяся с  символа @  интерпретируется как строка php. (!!Перед ним не должно быть других символов)
В случае, если в запрос необходимо протолкнуть какое-то значение (например динамически узнаем, из какой таблицы сделать select), можно в запрос вставить

```xml
   @ if(preg_math('/^[a-z_]+$/',:DATE_E)) print :DATE_E;
```
Проверка регуляркой обязательна!


## Свойства компонента DataSetVars

|Название|Значение|Тип|Возможные значения|get|set|
|---|---|---|---|---|---|
|default|Свойство указывает значение по умолчанию, используется в том случае, если переменная или контрол не заполнен|string||\+|\+|
|get|Наименование переменной, передаваемой в запрос|string||\+|\+|
|src|Наименование переменной или контрола на форме. Тип указывается в свойстве srctype|string||\+|\+|
|srctype|Свойство указывает на объект из которого необходимо получить данные.|string|var - переменная на форме, ctrl - контрол на форме, session - данные сессии, const_server - константы сервера|\+|\+|
|name|Имя компонента в запросе. Обозначается в запросе как :Имя|string||\+|\+|
|parent|Указание связи между компонентами DataSet|string||\+|\+|


## Примеры использования DataSet

На практике компонент DataSet используют:

### Для получения данных дерева, компонента Tree.

Для объявления компонента  Tree, данные которого загружаются из запроса, необходимо задать свойство dataset равный наименованию запроса.
Порядок строения дерева определяется родительским полем данных таблицы. Т.е. необходимо в свойство parentfield указать наименование столбца данных, которое определяет, какой объект запроса будет родительской для текущей строки.

В колонках дерева в компонентах TreeColumn необходимо заполнить свойство field равное значению наименования колонки запроса.
```xml
<component cmptype="Tree" name="EMPS" dataset="DS_EMPS" keyfield="id" parentfield="hid" caption="Участники">
    <component cmptype="TreeColumn" caption="Участник" field="caption_short"/>
    <component cmptype="GridFooter">
        <component cmptype="Range" dataset="DS_EMPS"/>
    </component>
</component>
```

В нашем примере, в столбце hid указываются значения столбца id родительской записи.

```xml
<component cmptype="DataSet" name="DS_EMPS" activateoncreate="false">
    SELECT d.id,
       d.member,
       d.u_caption_short AS caption_short,
       d.hid,
       d.member,
       d.haschildren
  FROM gisgmp.v_gisgmp_nsi_patterns_delegate d
  WHERE d.pattern = :id
    and d.version = :version    
	<component cmptype="DataSetVar" name="id" get="g0" src="id" srctype="var"/>
	<component cmptype="DataSetVar" name="version" get="g1" src="version" srctype="session"/>
</component>
```

### Для получения данных таблицы, компонента Grid.

При объявлении компонента  Grid, данные которого загружаются из запроса, необходимо задать свойство dataset равный наименованию запроса.
Свойство компонента data определяет столбец строки запроса, на которой стоит курсор, который будет возвращаться в результата вызова метода контрола getValue.

В колонках таблицы в компонентах Column необходимо заполнить свойство field равное значению наименования колонки запроса.

Если возможно, что в результатах запроса прийдет большое количество данных или время ответа сервера очень большое, используется компонент GridFooter, в котором можно указать, чтобы не подсчитывалось количество страниц.

```xml
<component cmptype="Grid" name="subscriber" dataset="DS_SelectAction"  data="value:id" keyfield="id" caption="Расчетные счета">
	<component cmptype="Column" caption="ТОДК или ФО" field="u_caption" filter="u_caption" sort="u_caption" upper="true" like="both"/>
	<component cmptype="Column" caption="Расчетный счет" field="s_acc" filter="s_acc" sort="s_acc" upper="true" like="both"/>
	<component cmptype="Column" caption="Банк" field="caption_short" filter="caption_short" sort="caption_short" upper="true" like="both"/>
	<component cmptype="Column" caption="Вид зачисления" field="adressee" filter="adressee" sort="adressee" upper="true" like="both"/>
	<component cmptype="GridFooter">
		<component cmptype="Range" dataset="DS_SelectAction"  />
	</component>
</component>
```
 Поля, указанные в атрибутах filter компонента Column используют компонент Filter для фильтрации данных запроса.
 При установке значения фильтра запрос датасета автоматически оборачивается в дополнительный select:
 
 ```xml
    select * from (....) s where s.field like :fltr_field
 ```
### Для оптимизации запроса при фильтрации.

Перенос стандартного фильтра в гриде/дереве поможет ограничить данные в выборке или наложить его в определенном месте запроса.
Используемая конструкция

 ```xml
    @"имя поля"_FilterItem:"фильтруемое значение":"имя поля"_FilterItem@
 ```
помещается в where запроса и дополняет его.

Пример использования и итоговый результат:

```xml
<component cmptype="Tree" name="EMPS" dataset="DS_EMPS" keyfield="id" parentfield="hid" caption="Участники">
    <component cmptype="TreeColumn" caption="Участник" field="caption_short" filter="caption_short"/>
</component>
```

В нашем примере, в столбце caption_short указываются значения столбца u_caption_short раздела.

```xml
<component cmptype="DataSet" name="DS_EMPS" activateoncreate="false">
    SELECT d.id,
       d.member,
       d.u_caption_short AS caption_short,
       d.hid,
       d.member,
       d.haschildren
  FROM gisgmp.v_gisgmp_nsi_patterns_delegate d
  WHERE d.pattern = :id
    and d.version = :version
    @caption_short_FilterItem:d.u_caption_short:caption_short_FilterItem@  
	<component cmptype="DataSetVar" name="id" get="g0" src="id" srctype="var"/>
	<component cmptype="DataSetVar" name="version" get="g1" src="version" srctype="session"/>
</component>
```
Итоговый результат запроса при фильтрации:

```xml
    SELECT d.id,
       d.member,
       d.u_caption_short AS caption_short,
       d.hid,
       d.member,
       d.haschildren
  FROM gisgmp.v_gisgmp_nsi_patterns_delegate d
  WHERE d.pattern = :id
    and d.version = :version
    and lower(d.u_caption_short) like lower(:fltr_caption_short)
```

### Для получения данных репитеров.

При объявлении репитеров, данные которого загружаются из запроса, необходимо задать свойство dataset равный наименованию запроса.
В подчиненных компонентах репитера необходимо заполнить свойство data, где указывается наименование колонки - значение и наименование колонки - отображаемое наименование.

```data="value:id;caption:name"```

```xml
<div  repeat="0" cmpparse="true" repeatername="repFildsPayment" dataset="DS_FIELDS" keyfield="id">
	<table style="width:100%;table-layout:fixed; ">
		<tr>
			<td><component cmptype="Edit" name="payment_plants" data="value:payment_plants;" width="100%" visible="false"/></td>
			<td><component cmptype="Edit" name="field_id" data="value:id;caption:id" width="100%" visible="false"/></td>
			<td><component cmptype="Label" caption="Наименование дополнительного поля:" /></td>
			<td><component cmptype="Edit" name="field_name" data="value:name;caption:name" width="100%"/></td>
			<td style="text-align: right;"><component cmptype="Label" caption="Тип данных:" /></td>
			<td><component cmptype="ComboBox" name="field_type" width="100%" data="value:type" onchange="Form.onChangeType(getValue('field_type'));">
				<component cmptype="ComboItem" caption="Строковый" value="VARCHAR"/>
				<component cmptype="ComboItem" caption="Дата/Время" value="TIMESTAMP"/>
				<component cmptype="ComboItem" caption="Логический" value="BOOL"/>
				<component cmptype="ComboItem" caption="Числовой" value="NUMERIC"/>
			</component></td>
			<td style="text-align: right;"><component cmptype="Label" name="field_length_label" caption="Максимальная длина значения(max 100):" /></td>
			<td><component cmptype="Edit" name="field_length" data="value:length" mask_type="numberlen:0,3" onchange="if (getValue('field_length') > 100) setValue('field_length',100); return;"/>
				<component cmptype="Mask" controls="field_length"/></td>
		</tr>
	</table>	
</div>
```
