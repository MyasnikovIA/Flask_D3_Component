# Работа с компонентами формы

Получение значения переменной на форме осуществляется с помощью метода *getVar*, в параметре которого указывается наименование переменной.
Для присвоения значения переменной рекомендуется использовать метод *setVar*, в первом параметре которого указывается наименование переменной, во втором параметре присваиваемое значение.

## Основные методы работы с компонентами

Получение значения контрола осуществляется с помощью метода *getValue*, в параметре которого указывается наименование компонента.
Для присвоения значения компоненту рекомендуется использовать метод *setValue*, в первом параметре которого указывается наименование компонента, во втором параметре присваиваемое значение.

```js
var status = getValue('status_skv3');
setValue('status_skv3',1);
```

Получение отображаемого значения контрола осуществляется с помощью метода *getCaption*, в параметре которого указывается наименование компонента.
Для присвоения значения компоненту рекомендуется использовать метод *setCaption*, в первом параметре которого указывается наименование компонента, во втором параметре присваиваемое значение.

Назначение свойства видимости компонента осуществляется с помощью метода *setVisible*, в первом параметре которого указывается наименование компонента, во втором параметре присваиваемое значение. True - видимый, false - невидимый.
Назначение доступа для ручного редактирования компонента осуществляется с помощью метода *setEnabled*, в первом параметре которого указывается наименование компонента, во втором параметре присваиваемое значение. True - доступен, false - недоступен.

```js
setVisible('receiver_kio','false');
setEnabled('nearRow','false');
```

Получить практически любое свойство компонента можно с помощью метода *getControlProperty*, в первом параметре которого указывается наименование компонента, во втором параметре наименование свойства, значение которого необходимо получить.

```js
var gisgmp = getControlProperty('gisgmp_payments_default', 'data')['from_gisgmp']
var nr = getControlProperty('gisgmp_payments_default','nearRow');
if(nr)
{
	setControlProperty('gisgmp_payments_default','locate', getControlProperty(nr,'value'));
				}
```

Метод *callControlMethod* позволяет убрать все выделения записей в компоненте Grid. В данном случае к наименованию компонента, указанного в пером параметре, необходимо добавить окончание "_SelectList". Во втором параметре указываем параметр 'unCheckAll' для снятия выделений.

```js
callControlMethod('gisgmp_payments_default_SelectList','unCheckAll');
```

Метод *callControlMethod* позволяет удалить компонент из формы.

```js
callControlMethod('kosgu','clear');
```

Метод *callControlMethod* позволяет добавить/удалить зависимость компонента от другого.
В данном случае в первом параметре указывается наименование компонента Dependeces.
Во втором параметре указывается действие. addRequiredControl - добавляет зависимость, removeRequiredControl - удаляет зависимость.
В третьем параметре указывается наименование компонента зависимость от которого добавляется/удаляется.

```js
callControlMethod('DependKlad','addRequiredControl','KLADR', true);
callControlMethod('DependKlad','removeRequiredControl','ADDR_MANUAL', true);
```

## Работа с масками

Для назначения компоненту маски с помощью макроса прилагается следующий пример.

```js
var vMaska = 'S 00000009';
var MaskaCheck = '(.?) [0-g]?[0-g]?[0-g]?[0-g]?[0-g]?[0-g]?[0-g]?[0-9]';
var MaskaTemplate = 'x xxxxxxx9';

D3Api.MaskCtrl.setParam(getControl('document_number'), 'mask_check_regular', '^'+MaskaCheck+'$');
D3Api.MaskCtrl.setParam(getControl('document_number'), 'mask_template', MaskaTemplate);
D3Api.MaskCtrl.setParam(getControl('document_number'), 'mask_original', MaskaTemplate);
D3Api.MaskCtrl.setParam(getControl('document_number'), 'mask_strip', true);
setControlProperty('document_number','hint',vMaska);
```
