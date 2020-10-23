# Tree

Древовидное представление таблицы данных с помощью сворачиваемых узлов.

## Компонент TreeColumn

Колонка таблицы древовидной структуры Tree.

## Компонент GridFooter

Компонент GridFooter представляет собой область под таблицей, предназначенная для размещения компонента Range. Размещается внутри компонента Tree, после объявления компонентов TreeColumn.

## Компонент Range.

Компонент Range представляет собой элементы управления количеством одновременно отображаемых записей в компоненте Tree.

## Примеры синтаксиса

```xml
<component cmptype="Tree" name="MO_REG" dataset="DS_MO_BY_REG" keyfield="id" parentfield="hid" parentvar="tree_parent" caption="Медицинские организации" childsfield ="haschildrens" popupmenu="pMO">
    <component cmptype="TreeColumn" caption="Наименование" field="caption"/>
    <component cmptype="TreeColumn" caption="Классификация МО" field="nom_lpu_caption"/>
    <component cmptype="TreeColumn" caption="Статус" field=""/>
</component>
```

## Свойства компонента Tree

|Название|Значение|Тип|Возможные значения|get|set|
|---|---|---|---|---|---|
|calc_height|Режим расчета высоты компонента. Можно указать значение “parent” – высота равна высоте родительского компонента, или математические выражения с участием “parent” и css-селекторов типа parent-#selectorCss#+#selectorCss2#|string||\+|\+|
|caption|Отображаемое наименование таблицы|string||\+|\+|
|childsfield|Поле указывающее наличие потомков узла. 0 - дочерних узлов нет|string||\+|\+|
|dataset|Имя компонента DataSet, данные которого отображаются в таблице|string||\+|\+|
|excel|Свойство, указывающее на то что данные таблицы можно выгрузить в формате Excel средствами платформы|boolean||\+|\+|
|fulldata|Свойство, указывающее на то, что для дерева все данные приходят за один раз и дерево само строит иерархию|boolean||\+|\+|
|keyfield|Название поля, значение из которого будет присваиваться значению Tree при выборе строки.|string||\+|\+|
|maxlevels|Максимальное количество страниц|numeric||\+|\+|
|onchange|Функция Javascript, которая должна срабатывать после редактирования компонента|string||\+|\+|
|ondblclick|Функция Javascript, которая должна срабатывать после двойного щелчка мыши по строке компонента|string||\+|\+|
|parentfield|Поле для связи с родителем|string||\+|\+|
|parentvar|Имя переменной, в которую будет записано значение keyfield для разварачиваемой строки(плюсик нажали)|string||\+|\+|
|popupmenu|Контекстное меню компонента|string||\+|\+|


## Свойства компонента TreeColumn

|Название|Значение|Тип|Возможные значения|get|set|
|---|---|---|---|---|---|
|caption|Отображаемое наименование таблицы|string||\+|\+|
|field|Наименование поля из компонента Dataset (который указан в родительском компоненте Tree), из которого будут подтягиваться данные в данный столбец|string||\+|\+|
|filter|Наименование поля из компонента Dataset (который указан в родительском компоненте Tree), к которому будет применяться фильтр из заголовка таблицы.|string||\+|\+|
|filterkind||string||\+|\+|
|fcontent||string||\+|\+|
|like|Свойство, определяющее метод поиска.|string|“both” – поиск в любом месте текста,“right” – поиск текста, который заканчивается на введенный текст,“left” – поиск текста, который начинается на введенный текст,|\+|\+|
|sort|Наименование поля из компонента Dataset (который указан в родительском компоненте Tree), к которому будет применяться сортировка из заголовка таблицы.|string||\+|\+|
|sortorder||string||\+|\+|
|upper|Флаг, определяющий необходимость переводить искомый через фильтр текст в верхний регистр.|string||\+|\+|
|colspanfield|Поле из датасета для величины colspan для текущей записи. Значения записи < 2 игнорируются|string|"colspanfield"|||
|align|выравнивание текста в колонке (right,left, center)|

## Дополнительная информация

* Чтобы в Popupmenu дерева добавить "Список" нужно прописать

 ```xml
 <component cmptype="PopupItem" caption="Список" name="pList" onclick="setControlProperty('MO_CATALOGS','list', !getControlProperty('MO_CATALOGS','list'));"/>
```

, где 'MO_CATALOGS'- имя дерева

* Пример компонента DataSet с настроенной иерархией для отображения и фильтрации данных

```xml
<component cmptype="DataSet" name="DS_REVENUE_CODES" compile="true" hierarchy="gisgmp:v_gisgmp_revenue_codes:npd.id:npd.hid:parent">
<![CDATA[
   SELECT npd.id,
        npd.hid,
        npd.name,
        npd.code,
        haschildren,
		"substring"(npd.code::text, 1, 14) AS revenue_code,
        CASE WHEN npd.haschildren = 0 THEN 1 ELSE 0 END as flag
    FROM gisgmp.v_gisgmp_revenue_codes npd
    WHERE 	{hierarchy}
			and
			@if(:revHid) {
				((npd.hid=:revHid) or	(npd.hid is null and :revHid is null)) and
			@}
			npd.version = :version
		@if(:curr_date_begin) {
			AND npd.date_begin::timestamp <= :curr_date_begin::timestamp AND (:curr_date_begin::timestamp <= npd.date_end::timestamp OR npd.date_end::timestamp is null)
		@}
		@if(:curr_date_end) {
			AND (npd.date_end::timestamp >= :curr_date_end::timestamp  OR npd.date_end::timestamp is null)
		@} else {
			@ if(:curr_date_begin) {
				AND npd.date_end::timestamp is null
			@ }
		@}
]]>
    <component cmptype="DataSetVar" name="version" get="v1" src="version" srctype="session"/>
    <component cmptype="DataSetVar" name="revHid"      src="tree_parent"   get="v2" srctype="var"/>
	<component cmptype="DataSetVar" name="parent"      src="tree_parent"   get="v3" srctype="var"/>
	<component cmptype="DataSetVar" name="curr_date_begin" 	get="g1"	src="curr_date_begin"	srctype="var"/>
	<component cmptype="DataSetVar" name="curr_date_end" 	get="g2"	src="curr_date_end"		srctype="var"/>
</component>
```
