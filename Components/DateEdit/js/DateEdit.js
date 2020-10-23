/*  Copyright Mihai Bazon, 2002-2005  |  www.bazon.net/mishoo
 * -----------------------------------------------------------
 *
 * The DHTML Calendar, version 1.0 "It is happening again"
 *
 * Details and latest version at:
 * www.dynarch.com/projects/calendar
 *
 * This script is developed by Dynarch.com.  Visit us at www.dynarch.com.
 *
 * This script is distributed under the GNU Lesser General Public License.
 * Read the entire license text here: http://www.gnu.org/licenses/lgpl.html
 */

// $Id: calendar.js,v 1.51 2005/03/07 16:44:31 mishoo Exp $

/** The Calendar object constructor. */
TCalendar = function (firstDayOfWeek, dateStr, onSelected, onClose) {
	// member variables
	this.activeDiv = null;
	this.currentDateEl = null;
	this.getDateStatus = null;
	this.getDateToolTip = null;
	this.getDateText = null;
	this.timeout = null;
	this.onSelected = onSelected || null;
	this.onClose = onClose || null;
	this.dragging = false;
	this.hidden = false;
	this.minYear = 1000;
	this.maxYear = 2999;
	this.dateFormat = TCalendar._TT["DEF_DATE_FORMAT"];
	this.ttDateFormat = TCalendar._TT["TT_DATE_FORMAT"];
	this.isPopup = true;
	this.weekNumbers = false;
	this.firstDayOfWeek = typeof firstDayOfWeek == "number" ? firstDayOfWeek : TCalendar._FD; // 0 for Sunday, 1 for Monday, etc.
	this.showsOtherMonths = true;
	this.dateStr = dateStr;
	this.ar_days = null;
	this.showsTime = false;
	this.time24 = true;
	this.yearStep = 1;
	this.hiliteToday = true;
	this.multiple = null;
	// HTML elements
	this.table = null;
	this.element = null;
	this.tbody = null;
	this.firstdayname = null;
	// Combo boxes
	this.monthsCombo = null;
	this.yearsCombo = null;
	this.hilitedMonth = null;
	this.activeMonth = null;
	this.hilitedYear = null;
	this.activeYear = null;
	// Information
	this.dateClicked = false;
	this.timeClicked = false;

	// one-time initializations
	if (typeof TCalendar._SDN == "undefined") {
		// table of short day names
		if (typeof TCalendar._SDN_len == "undefined")
			TCalendar._SDN_len = 3;
		var ar = new Array();
		for (var i = 8; i > 0;) {
			ar[--i] = TCalendar._DN[i].substr(0, TCalendar._SDN_len);
		}
		TCalendar._SDN = ar;
		// table of short month names
		if (typeof TCalendar._SMN_len == "undefined")
			TCalendar._SMN_len = 3;
		ar = new Array();
		for (var i = 12; i > 0;) {
			ar[--i] = TCalendar._MN[i].substr(0, TCalendar._SMN_len);
		}
		TCalendar._SMN = ar;
	}
};

// ** constants

/// "static", needed for event handlers.
TCalendar._C = null;

/// detect a special case of "web browser"
TCalendar.is_ie = ( /msie/i.test(navigator.userAgent) &&
		   !/opera/i.test(navigator.userAgent) );

TCalendar.is_ie5 = ( TCalendar.is_ie && /msie 5\.0/i.test(navigator.userAgent) );

/// detect Opera browser
TCalendar.is_opera = /opera/i.test(navigator.userAgent);

/// detect KHTML-based browsers
TCalendar.is_khtml = /Konqueror|Safari|KHTML/i.test(navigator.userAgent);

// BEGIN: UTILITY FUNCTIONS; beware that these might be moved into a separate
//        library, at some point.

TCalendar.getAbsolutePos = function(el) {
	var SL = 0, ST = 0;
	var is_div = /^div$/i.test(el.tagName);
	if (is_div && el.scrollLeft)
		SL = el.scrollLeft;
	if (is_div && el.scrollTop)
		ST = el.scrollTop;
	var r = {x: el.offsetLeft - SL, y: el.offsetTop - ST};
	if (el.offsetParent) {
		var tmp = this.getAbsolutePos(el.offsetParent);
		r.x += tmp.x;
		r.y += tmp.y;
	}
	return r;
};

TCalendar.isRelated = function (el, evt) {
	var related = evt.relatedTarget;
	if (!related) {
		var type = evt.type;
		if (type == "mouseover") {
			related = evt.fromElement;
		} else if (type == "mouseout") {
			related = evt.toElement;
		}
	}
	while (related) {
		if (related == el) {
			return true;
		}
		related = related.parentNode;
	}
	return false;
};

TCalendar.removeClass = function(el, className) {
	if (!(el && el.className)) {
		return;
	}
	var cls = el.className.split(" ");
	var ar = new Array();
	for (var i = cls.length; i > 0;) {
		if (cls[--i] != className) {
			ar[ar.length] = cls[i];
		}
	}
	el.className = ar.join(" ");
};

TCalendar.addClass = function(el, className) {
	TCalendar.removeClass(el, className);
	el.className += " " + className;
};

// FIXME: the following 2 functions totally suck, are useless and should be replaced immediately.
TCalendar.getElement = function(ev) {
	var f = TCalendar.is_ie ? window.event.srcElement : ev.currentTarget;
	while (f.nodeType != 1 || /^div$/i.test(f.tagName))
		f = f.parentNode;
	return f;
};

TCalendar.getTargetElement = function(ev) {
	var f = TCalendar.is_ie ? window.event.srcElement : ev.target;
	while (f.nodeType != 1)
		f = f.parentNode;
	return f;
};

TCalendar.stopEvent = function(ev) {
	return D3Api.stopEvent(ev);
};

TCalendar.addEvent = function(el, evname, func) {
	if (el.attachEvent) { // IE
		el.attachEvent("on" + evname, func);
	} else if (el.addEventListener) { // Gecko / W3C
		el.addEventListener(evname, func, true);
	} else {
		el["on" + evname] = func;
	}
};

TCalendar.removeEvent = function(el, evname, func) {
	if (el.detachEvent) { // IE
		el.detachEvent("on" + evname, func);
	} else if (el.removeEventListener) { // Gecko / W3C
		el.removeEventListener(evname, func, true);
	} else {
		el["on" + evname] = null;
	}
};

TCalendar.createElement = function(type, parent) {
	var el = null;
	if (document.createElementNS) {
		// use the XHTML namespace; IE won't normally get here unless
		// _they_ "fix" the DOM2 implementation.
		el = document.createElementNS("http://www.w3.org/1999/xhtml", type);
	} else {
		el = document.createElement(type);
	}
	if (typeof parent != "undefined") {
		parent.appendChild(el);
	}
	return el;
};

// END: UTILITY FUNCTIONS

// BEGIN: CALENDAR STATIC FUNCTIONS

/** Internal -- adds a set of events to make some element behave like a button. */
TCalendar._add_evs = function(el) {
	with (TCalendar) {
		addEvent(el, "mouseover", dayMouseOver);
		addEvent(el, "mousedown", dayMouseDown);
		addEvent(el, "mouseout", dayMouseOut);
		if (is_ie) {
			addEvent(el, "dblclick", dayMouseDblClick);
			el.setAttribute("unselectable", true);
		}
	}
};

TCalendar.findMonth = function(el) {
	if (typeof el.month != "undefined") {
		return el;
	} else if (typeof el.parentNode.month != "undefined") {
		return el.parentNode;
	}
	return null;
};

TCalendar.findYear = function(el) {
	if (typeof el.year != "undefined") {
		return el;
	} else if (typeof el.parentNode.year != "undefined") {
		return el.parentNode;
	}
	return null;
};

TCalendar.showMonthsCombo = function () {
	var cal = TCalendar._C;
	if (!cal) {
		return false;
	}
	var cal = cal;
	var cd = cal.activeDiv;
	var mc = cal.monthsCombo;
	if (cal.hilitedMonth) {
		TCalendar.removeClass(cal.hilitedMonth, "hilite");
	}
	if (cal.activeMonth) {
		TCalendar.removeClass(cal.activeMonth, "active");
	}
	var mon = cal.monthsCombo.getElementsByTagName("div")[cal.date.getMonth()];
	TCalendar.addClass(mon, "active");
	cal.activeMonth = mon;
	var s = mc.style;
	s.display = "block";
	if (cd.navtype < 0)
		s.left = cd.offsetLeft + "px";
	else {
		var mcw = mc.offsetWidth;
		if (typeof mcw == "undefined")
			// Konqueror brain-dead techniques
			mcw = 50;
		s.left = (cd.offsetLeft + cd.offsetWidth - mcw) + "px";
	}
	s.top = (cd.offsetTop + cd.offsetHeight) + "px";
};

TCalendar.showYearsCombo = function (fwd) {
	var cal = TCalendar._C;
	if (!cal) {
		return false;
	}
	var cal = cal;
	var cd = cal.activeDiv;
	var yc = cal.yearsCombo;
	if (cal.hilitedYear) {
		TCalendar.removeClass(cal.hilitedYear, "hilite");
	}
	if (cal.activeYear) {
		TCalendar.removeClass(cal.activeYear, "active");
	}
	cal.activeYear = null;
	var Y = cal.date.getFullYear() + (fwd ? 1 : -1);
	var yr = yc.firstChild;
	var show = false;
	for (var i = 12; i > 0; --i) {
		if (Y >= cal.minYear && Y <= cal.maxYear) {
			yr.innerHTML = Y;
			yr.year = Y;
			yr.style.display = "block";
			show = true;
		} else {
			yr.style.display = "none";
		}
		yr = yr.nextSibling;
		Y += fwd ? cal.yearStep : -cal.yearStep;
	}
	if (show) {
		var s = yc.style;
		s.display = "block";
		if (cd.navtype < 0)
			s.left = cd.offsetLeft + "px";
		else {
			var ycw = yc.offsetWidth;
			if (typeof ycw == "undefined")
				// Konqueror brain-dead techniques
				ycw = 50;
			s.left = (cd.offsetLeft + cd.offsetWidth - ycw) + "px";
		}
		s.top = (cd.offsetTop + cd.offsetHeight) + "px";
	}
};

// event handlers

TCalendar.tableMouseUp = function(ev) {
	var cal = TCalendar._C;
	if (!cal) {
		return false;
	}
	if (cal.timeout) {
		clearTimeout(cal.timeout);
	}
	var el = cal.activeDiv;
	if (!el) {
		return false;
	}
	var target = TCalendar.getTargetElement(ev);
        target = (target.className == 'daycont')?target.parentNode:target;
	ev || (ev = window.event);
	TCalendar.removeClass(el, "active");
	if (target == el || target.parentNode == el) {
		TCalendar.cellClick(el, ev);
	}
	var mon = TCalendar.findMonth(target);
	var date = null;
	if (mon) {
		date = new Date(cal.date);
		if (mon.month != date.getMonth()) {
			date.setMonth(mon.month);
			cal.setDate(date);
			cal.dateClicked = false;
			cal.callHandler();
		}
	} else {
		var year = TCalendar.findYear(target);
		if (year) {
			date = new Date(cal.date);
			if (year.year != date.getFullYear()) {
				date.setFullYear(year.year);
				cal.setDate(date);
				cal.dateClicked = false;
				cal.callHandler();
			}
		}
	}
	with (TCalendar) {
		removeEvent(document, "mouseup", tableMouseUp);
		removeEvent(document, "mouseover", tableMouseOver);
		removeEvent(document, "mousemove", tableMouseOver);
		cal._hideCombos();
		_C = null;
		return stopEvent(ev);
	}
};

TCalendar.tableMouseOver = function (ev) {
    return true;
	var cal = TCalendar._C;
	if (!cal) {
		return;
	}
	var el = cal.activeDiv;
	var target = TCalendar.getTargetElement(ev);
	if (target == el || target.parentNode == el) {
		TCalendar.addClass(el, "hilite active");
		TCalendar.addClass(el.parentNode, "rowhilite");
	} else {
		if (typeof el.navtype == "undefined" || (el.navtype != 50 && (el.navtype == 0 || Math.abs(el.navtype) > 2)))
			TCalendar.removeClass(el, "active");
		TCalendar.removeClass(el, "hilite");
		TCalendar.removeClass(el.parentNode, "rowhilite");
	}
	ev || (ev = window.event);
	if (el.navtype == 50 && target != el) {
		var pos = TCalendar.getAbsolutePos(el);
		var w = el.offsetWidth;
		var x = ev.clientX;
		var dx;
		var decrease = true;
		if (x > pos.x + w) {
			dx = x - pos.x - w;
			decrease = false;
		} else
			dx = pos.x - x;

		if (dx < 0) dx = 0;
		var range = el._range;
		var current = el._current;
		var count = Math.floor(dx / 10) % range.length;
		for (var i = range.length; --i >= 0;)
			if (range[i] == current)
				break;
		while (count-- > 0)
			if (decrease) {
				if (--i < 0)
					i = range.length - 1;
			} else if ( ++i >= range.length )
				i = 0;
		var newval = range[i];
		el.innerHTML = newval;

		cal.onUpdateTime();
	}
	var mon = TCalendar.findMonth(target);
	if (mon) {
		if (mon.month != cal.date.getMonth()) {
			if (cal.hilitedMonth) {
				TCalendar.removeClass(cal.hilitedMonth, "hilite");
			}
			TCalendar.addClass(mon, "hilite");
			cal.hilitedMonth = mon;
		} else if (cal.hilitedMonth) {
			TCalendar.removeClass(cal.hilitedMonth, "hilite");
		}
	} else {
		if (cal.hilitedMonth) {
			TCalendar.removeClass(cal.hilitedMonth, "hilite");
		}
		var year = TCalendar.findYear(target);
		if (year) {
			if (year.year != cal.date.getFullYear()) {
				if (cal.hilitedYear) {
					TCalendar.removeClass(cal.hilitedYear, "hilite");
				}
				TCalendar.addClass(year, "hilite");
				cal.hilitedYear = year;
			} else if (cal.hilitedYear) {
				TCalendar.removeClass(cal.hilitedYear, "hilite");
			}
		} else if (cal.hilitedYear) {
			TCalendar.removeClass(cal.hilitedYear, "hilite");
		}
	}
	return TCalendar.stopEvent(ev);
};

TCalendar.tableMouseDown = function (ev) {
	if (TCalendar.getTargetElement(ev) == TCalendar.getElement(ev)) {
		return TCalendar.stopEvent(ev);
	}
};

TCalendar.calDragIt = function (ev) {
	var cal = TCalendar._C;
	if (!(cal && cal.dragging)) {
		return false;
	}
	var posX;
	var posY;
	if (TCalendar.is_ie) {
		posY = window.event.clientY + document.body.scrollTop;
		posX = window.event.clientX + document.body.scrollLeft;
	} else {
		posX = ev.pageX;
		posY = ev.pageY;
	}
	cal.hideShowCovered();
	var st = cal.element.style;
	st.left = (posX - cal.xOffs) + "px";
	st.top = (posY - cal.yOffs) + "px";
	return TCalendar.stopEvent(ev);
};

TCalendar.calDragEnd = function (ev) {
	var cal = TCalendar._C;
	if (!cal) {
		return false;
	}
	cal.dragging = false;
	with (TCalendar) {
		removeEvent(document, "mousemove", calDragIt);
		removeEvent(document, "mouseup", calDragEnd);
		tableMouseUp(ev);
	}
	cal.hideShowCovered();
};

TCalendar.dayMouseDown = function(ev) {
	var el = TCalendar.getElement(ev);
	if (el.disabled) {
		return false;
	}
	var cal = el.calendar;
	cal.activeDiv = el;
	TCalendar._C = cal;
	if (el.navtype != 300) with (TCalendar) {
		if (el.navtype == 50) {
			el._current = el.innerHTML;
			addEvent(document, "mousemove", tableMouseOver);
		} else
			addEvent(document, TCalendar.is_ie5 ? "mousemove" : "mouseover", tableMouseOver);
		addClass(el, "hilite active");
		addEvent(document, "mouseup", tableMouseUp);
	} else if (cal.isPopup) {
		cal._dragStart(ev);
	}
	if (el.navtype == -1 || el.navtype == 1) {
		if (cal.timeout) clearTimeout(cal.timeout);
		cal.timeout = setTimeout("TCalendar.showMonthsCombo()", 250);
	} else if (el.navtype == -2 || el.navtype == 2) {
		if (cal.timeout) clearTimeout(cal.timeout);
		cal.timeout = setTimeout((el.navtype > 0) ? "TCalendar.showYearsCombo(true)" : "TCalendar.showYearsCombo(false)", 250);
	} else {
		cal.timeout = null;
	}
	return TCalendar.stopEvent(ev);
};

TCalendar.dayMouseDblClick = function(ev) {
	TCalendar.cellClick(TCalendar.getElement(ev), ev || window.event);
	if (TCalendar.is_ie) {
		document.selection.empty();
	}
};

TCalendar.dayMouseOver = function(ev) {
	var el = TCalendar.getElement(ev);
	if (TCalendar.isRelated(el, ev) || TCalendar._C || el.disabled) {
		return false;
	}
	if (el.ttip) {
		if (el.ttip.substr(0, 1) == "_") {
			el.ttip = el.caldate.print(el.calendar.ttDateFormat) + el.ttip.substr(1);
		}
		el.calendar.tooltips.innerHTML = el.ttip;
	}
	/*if (el.navtype != 300) {
		TCalendar.addClass(el, "hilite");
		if (el.caldate) {
			TCalendar.addClass(el.parentNode, "rowhilite");
		}
	}*/
	return TCalendar.stopEvent(ev);
};

TCalendar.dayMouseOut = function(ev) {
	with (TCalendar) {
		var el = getElement(ev);
		if (isRelated(el, ev) || _C || el.disabled)
			return false;
		removeClass(el, "hilite");
		if (el.caldate)
			removeClass(el.parentNode, "rowhilite");
		if (el.calendar)
			el.calendar.tooltips.innerHTML = _TT["SEL_DATE"];
		return stopEvent(ev);
	}
};

/**
 *  A generic "click" handler :) handles all types of buttons defined in this
 *  calendar.
 */
TCalendar.cellClick = function(el, ev) {
	var cal = el.calendar;
	var closing = false;
	var newdate = false;
	var date = null;
	if (typeof el.navtype == "undefined") {
		if (cal.currentDateEl) {
			TCalendar.removeClass(cal.currentDateEl, "selected");
			TCalendar.addClass(el, "selected");
			closing = (cal.currentDateEl == el);
			if (!closing) {
				cal.currentDateEl = el;
			}
		}
		cal.date.setDateOnly(el.caldate);
		date = cal.date;
		var other_month = !(cal.dateClicked = !el.otherMonth);
		if (!other_month && !cal.currentDateEl)
			cal._toggleMultipleDate(new Date(date));
		else
			newdate = !el.disabled;
		// a date was clicked
		if (other_month)
			cal._init(cal.firstDayOfWeek, date);
	} else {
		if (el.navtype == 200) {
			TCalendar.removeClass(el, "hilite");
			cal.callCloseHandler();
			return;
		}
		date = new Date(cal.date);
		if (el.navtype == 0)
			date.setDateOnly(new Date()); // TODAY
		// unless "today" was clicked, we assume no date was clicked so
		// the selected handler will know not to close the calenar when
		// in single-click mode.
		// cal.dateClicked = (el.navtype == 0);
		cal.dateClicked = false;
		var year = date.getFullYear();
		var mon = date.getMonth();
		function setMonth(m) {
			var day = date.getDate();
			var max = date.getMonthDays(m);
			if (day > max) {
				date.setDate(max);
			}
			date.setMonth(m);
		};
		switch (el.navtype) {
		    case 400:
			TCalendar.removeClass(el, "hilite");
			var text = TCalendar._TT["ABOUT"];
			if (typeof text != "undefined") {
				text += cal.showsTime ? TCalendar._TT["ABOUT_TIME"] : "";
			} else {
				// FIXME: this should be removed as soon as lang files get updated!
				text = "Help and about box text is not translated into this language.\n" +
					"If you know this language and you feel generous please update\n" +
					"the corresponding file in \"lang\" subdir to match calendar-en.js\n" +
					"and send it back to <mihai_bazon@yahoo.com> to get it into the distribution  ;-)\n\n" +
					"Thank you!\n" +
					"http://dynarch.com/mishoo/calendar.epl\n";
			}
			alert(text);
			return;
		    case -2:
			if (year > cal.minYear) {
				date.setFullYear(year - 1);
			}
			break;
		    case -1:
			if (mon > 0) {
				setMonth(mon - 1);
			} else if (year-- > cal.minYear) {
				date.setFullYear(year);
				setMonth(11);
			}
			break;
		    case 1:
			if (mon < 11) {
				setMonth(mon + 1);
			} else if (year < cal.maxYear) {
				date.setFullYear(year + 1);
				setMonth(0);
			}
			break;
		    case 2:
			if (year < cal.maxYear) {
				date.setFullYear(year + 1);
			}
			break;
		    case 100:
			cal.setFirstDayOfWeek(el.fdow);
			return;
		    case 50:
			var range = el._range;
			var current = el.innerHTML;
			for (var i = range.length; --i >= 0;)
				if (range[i] == current)
					break;
			if (ev && ev.shiftKey) {
				if (--i < 0)
					i = range.length - 1;
			} else if ( ++i >= range.length )
				i = 0;
			var newval = range[i];
			el.innerHTML = newval;
			cal.onUpdateTime();
			return;
		    case 0:
			// TODAY will bring us here
			if ((typeof cal.getDateStatus == "function") &&
			    cal.getDateStatus(date, date.getFullYear(), date.getMonth(), date.getDate())) {
				return false;
			}
			break;
		}
		if (!date.equalsTo(cal.date)) {
			cal.setDate(date);
			newdate = true;
		} else if (el.navtype == 0)
			newdate = closing = true;
	}
	if (newdate) {
		ev && cal.callHandler();
	}
	if (closing) {
		TCalendar.removeClass(el, "hilite");
		ev && cal.callCloseHandler();
	}
};

// END: CALENDAR STATIC FUNCTIONS

// BEGIN: CALENDAR OBJECT FUNCTIONS

/**
 *  This function creates the calendar inside the given parent.  If _par is
 *  null than it creates a popup calendar inside the BODY element.  If _par is
 *  an element, be it BODY, then it creates a non-popup calendar (still
 *  hidden).  Some properties need to be set before calling this function.
 */
TCalendar.prototype.create = function (_par) {
	var parent = _par;
	this.isPopup = true;
	this.date = this.dateStr ? new Date(this.dateStr) : new Date();
	this.rootElement = _par;
	var table = TCalendar.createElement("table");
	this.table = table;
	table.cellSpacing = 0;
	table.cellPadding = 0;
	table.calendar = this;
	TCalendar.addEvent(table, "mousedown", TCalendar.tableMouseDown);

	var div = TCalendar.createElement("div");
	this.element = div;
	div.className = "calendar";
	if (this.isPopup) {
		div.style.position = "fixed";
		div.style.display = "none";
	}
	div.appendChild(table);

	var thead = TCalendar.createElement("thead", table);
	var cell = null;
	var row = null;

	var cal = this;
	var hh = function (text, cs, navtype) {
		cell = TCalendar.createElement("td", row);
		cell.colSpan = cs;
		cell.className = "button";
		if (navtype != 0 && Math.abs(navtype) <= 2)
			cell.className += " nav";
                if(text == "close"){
                    cell.className += " closeCalendar";
                    text = "";
                }
		TCalendar._add_evs(cell);
		cell.calendar = cal;
		cell.navtype = navtype;
		cell.innerHTML = "<div unselectable='on'>"+text+"</div>";
		return cell;
	};

	row = TCalendar.createElement("tr", thead);
	var title_length = 6;
	(this.isPopup) && --title_length;
	(this.weekNumbers) && ++title_length;

	hh("", 1, 400).ttip = TCalendar._TT["INFO"];
	this.title = hh("", title_length, 300);
	this.title.className = "title";
	if (this.isPopup) {
		this.title.ttip = TCalendar._TT["DRAG_TO_MOVE"];
		this.title.style.cursor = "move";
		hh("close", 1, 200).ttip = TCalendar._TT["CLOSE"];
	}

	row = TCalendar.createElement("tr", thead);
	row.className = "headrow";

	this._nav_py = hh("", 1, -2);
	this._nav_py.ttip = TCalendar._TT["PREV_YEAR"];

	this._nav_pm = hh("", 1, -1);
	this._nav_pm.ttip = TCalendar._TT["PREV_MONTH"];

	this._nav_now = hh(TCalendar._TT["TODAY"], this.weekNumbers ? 4 : 3, 0);
	this._nav_now.ttip = TCalendar._TT["GO_TODAY"];

	this._nav_nm = hh("", 1, 1);
	this._nav_nm.ttip = TCalendar._TT["NEXT_MONTH"];

	this._nav_ny = hh("", 1, 2);
	this._nav_ny.ttip = TCalendar._TT["NEXT_YEAR"];

	// day names
	row = TCalendar.createElement("tr", thead);
	row.className = "daynames";
	if (this.weekNumbers) {
		cell = TCalendar.createElement("td", row);
		cell.className = "name wn";
		cell.innerHTML = TCalendar._TT["WK"];
	}
	for (var i = 7; i > 0; --i) {
		cell = TCalendar.createElement("td", row);
		if (!i) {
			cell.navtype = 100;
			cell.calendar = this;
			TCalendar._add_evs(cell);
		}
	}
	this.firstdayname = (this.weekNumbers) ? row.firstChild.nextSibling : row.firstChild;
	this._displayWeekdays();

	var tbody = TCalendar.createElement("tbody", table);
	this.tbody = tbody;

	for (i = 6; i > 0; --i) {
		row = TCalendar.createElement("tr", tbody);
		if (this.weekNumbers) {
			cell = TCalendar.createElement("td", row);
		}
		for (var j = 7; j > 0; --j) {
			cell = TCalendar.createElement("td", row);
			cell.calendar = this;
			TCalendar._add_evs(cell);
		}
	}

	if (this.showsTime) {
		row = TCalendar.createElement("tr", tbody);
		row.className = "time";

		cell = TCalendar.createElement("td", row);
		cell.className = "time";
		cell.colSpan = 2;
		cell.innerHTML = TCalendar._TT["TIME"] || "&nbsp;";

		cell = TCalendar.createElement("td", row);
		cell.className = "time";
		cell.colSpan = this.weekNumbers ? 4 : 3;

		(function(){
			function makeTimePart(className, init, range_start, range_end) {
				var part = TCalendar.createElement("span", cell);
				part.className = className;
				part.innerHTML = init;
				part.calendar = cal;
				part.ttip = TCalendar._TT["TIME_PART"];
				part.navtype = 50;
				part._range = [];
				if (typeof range_start != "number")
					part._range = range_start;
				else {
					for (var i = range_start; i <= range_end; ++i) {
						var txt;
						if (i < 10 && range_end >= 10) txt = '0' + i;
						else txt = '' + i;
						part._range[part._range.length] = txt;
					}
				}
				TCalendar._add_evs(part);
				return part;
			};
			var hrs = cal.date.getHours();
			var mins = cal.date.getMinutes();
			var t12 = !cal.time24;
			var pm = (hrs > 12);
			if (t12 && pm) hrs -= 12;
			var H = makeTimePart("hour", hrs, t12 ? 1 : 0, t12 ? 12 : 23);
			var span = TCalendar.createElement("span", cell);
			span.innerHTML = ":";
			span.className = "colon";
			var M = makeTimePart("minute", mins, 0, 59);
			var AP = null;
			cell = TCalendar.createElement("td", row);
			cell.className = "time";
			cell.colSpan = 2;
			if (t12)
				AP = makeTimePart("ampm", pm ? "pm" : "am", ["am", "pm"]);
			else
				cell.innerHTML = "&nbsp;";

			cal.onSetTime = function() {
				var pm, hrs = this.date.getHours(),
					mins = this.date.getMinutes();
				if (t12) {
					pm = (hrs >= 12);
					if (pm) hrs -= 12;
					if (hrs == 0) hrs = 12;
					AP.innerHTML = pm ? "pm" : "am";
				}
				H.innerHTML = (hrs < 10) ? ("0" + hrs) : hrs;
				M.innerHTML = (mins < 10) ? ("0" + mins) : mins;
			};

			cal.onUpdateTime = function() {
				var date = this.date;
				var h = parseInt(H.innerHTML, 10);
				if (t12) {
					if (/pm/i.test(AP.innerHTML) && h < 12)
						h += 12;
					else if (/am/i.test(AP.innerHTML) && h == 12)
						h = 0;
				}
				var d = date.getDate();
				var m = date.getMonth();
				var y = date.getFullYear();
				date.setHours(h);
				date.setMinutes(parseInt(M.innerHTML, 10));
				date.setFullYear(y);
				date.setMonth(m);
				date.setDate(d);
				this.dateClicked = false;
				this.timeClicked = true;
				this.callHandler();
			};
		})();
	} else {
		this.onSetTime = this.onUpdateTime = function() {};
	}

	var tfoot = TCalendar.createElement("tfoot", table);

	row = TCalendar.createElement("tr", tfoot);
	row.className = "footrow";

	cell = hh(TCalendar._TT["SEL_DATE"], this.weekNumbers ? 8 : 7, 300);
	cell.className = "ttip";
	if (this.isPopup) {
		cell.ttip = TCalendar._TT["DRAG_TO_MOVE"];
		cell.style.cursor = "move";
	}
	this.tooltips = cell;

	div = TCalendar.createElement("div", this.element);
	this.monthsCombo = div;
	div.className = "combo";
	for (i = 0; i < TCalendar._MN.length; ++i) {
		var mn = TCalendar.createElement("div");
		mn.className = TCalendar.is_ie ? "label-IEfix" : "label";
		mn.month = i;
		mn.innerHTML = TCalendar._SMN[i];
		div.appendChild(mn);
	}

	div = TCalendar.createElement("div", this.element);
	this.yearsCombo = div;
	div.className = "combo";
	for (i = 12; i > 0; --i) {
		var yr = TCalendar.createElement("div");
		yr.className = TCalendar.is_ie ? "label-IEfix" : "label";
		div.appendChild(yr);
	}

	this._init(this.firstDayOfWeek, this.date);
	parent.appendChild(this.element);
};

/** keyboard navigation, only for popup calendars */
TCalendar._keyEvent = function(ev) {
	var cal = window._dynarch_popupCalendar;
	if (!cal || cal.multiple)
		return false;
	(TCalendar.is_ie) && (ev = window.event);
	var act = (TCalendar.is_ie || ev.type == "keypress"),
		K = ev.keyCode;
	if (ev.ctrlKey) {
		switch (K) {
		    case 37: // KEY left
			act && TCalendar.cellClick(cal._nav_pm);
			break;
		    case 38: // KEY up
			act && TCalendar.cellClick(cal._nav_py);
			break;
		    case 39: // KEY right
			act && TCalendar.cellClick(cal._nav_nm);
			break;
		    case 40: // KEY down
			act && TCalendar.cellClick(cal._nav_ny);
			break;
		    default:
			return false;
		}
	} else switch (K) {
	    case 32: // KEY space (now)
		TCalendar.cellClick(cal._nav_now);
		break;
	    case 27: // KEY esc
		act && cal.callCloseHandler();
		break;
	    case 37: // KEY left
	    case 38: // KEY up
	    case 39: // KEY right
	    case 40: // KEY down
		if (act) {
			var prev, x, y, ne, el, step;
			prev = K == 37 || K == 38;
			step = (K == 37 || K == 39) ? 1 : 7;
			function setVars() {
				el = cal.currentDateEl;
				var p = el.pos;
				x = p & 15;
				y = p >> 4;
				ne = cal.ar_days[y][x];
			};setVars();
			function prevMonth() {
				var date = new Date(cal.date);
				date.setDate(date.getDate() - step);
				cal.setDate(date);
			};
			function nextMonth() {
				var date = new Date(cal.date);
				date.setDate(date.getDate() + step);
				cal.setDate(date);
			};
			while (1) {
				switch (K) {
				    case 37: // KEY left
					if (--x >= 0)
						ne = cal.ar_days[y][x];
					else {
						x = 6;
						K = 38;
						continue;
					}
					break;
				    case 38: // KEY up
					if (--y >= 0)
						ne = cal.ar_days[y][x];
					else {
						prevMonth();
						setVars();
					}
					break;
				    case 39: // KEY right
					if (++x < 7)
						ne = cal.ar_days[y][x];
					else {
						x = 0;
						K = 40;
						continue;
					}
					break;
				    case 40: // KEY down
					if (++y < cal.ar_days.length)
						ne = cal.ar_days[y][x];
					else {
						nextMonth();
						setVars();
					}
					break;
				}
				break;
			}
			if (ne) {
				if (!ne.disabled)
					TCalendar.cellClick(ne);
				else if (prev)
					prevMonth();
				else
					nextMonth();
			}
		}
		break;
	    case 13: // KEY enter
		if (act)
			TCalendar.cellClick(cal.currentDateEl, ev);
		break;
	    default:
		return false;
	}
	return TCalendar.stopEvent(ev);
};

/**
 *  (RE)Initializes the calendar to the given date and firstDayOfWeek
 */
TCalendar.prototype._init = function (firstDayOfWeek, date) {
	var today = new Date(),
		TY = today.getFullYear(),
		TM = today.getMonth(),
		TD = today.getDate();
	this.table.style.visibility = "hidden";
	var year = date.getFullYear();
	if (year < this.minYear) {
		year = this.minYear;
		date.setFullYear(year);
	} else if (year > this.maxYear) {
		year = this.maxYear;
		date.setFullYear(year);
	}
	this.firstDayOfWeek = firstDayOfWeek;
	this.date = new Date(date);
	var month = date.getMonth();
	var mday = date.getDate();
	var no_days = date.getMonthDays();

	// calendar voodoo for computing the first day that would actually be
	// displayed in the calendar, even if it's from the previous month.
	// WARNING: this is magic. ;-)
	date.setDate(1);
	var day1 = (date.getDay() - this.firstDayOfWeek) % 7;
	if (day1 < 0)
		day1 += 7;
	date.setDate(-day1);
	date.setDate(date.getDate() + 1);

	var row = this.tbody.firstChild;
	var MN = TCalendar._SMN[month];
	var ar_days = this.ar_days = new Array();
	var weekend = TCalendar._TT["WEEKEND"];
	var dates = this.multiple ? (this.datesCells = {}) : null;
	for (var i = 0; i < 6; ++i, row = row.nextSibling) {
		var cell = row.firstChild;
		if (this.weekNumbers) {
			cell.className = "day wn";
			cell.innerHTML = '<div class="daycont">'+date.getWeekNumber()+'</div>';
			cell = cell.nextSibling;
		}
		row.className = "daysrow";
		var hasdays = false, iday, dpos = ar_days[i] = [];
		for (var j = 0; j < 7; ++j, cell = cell.nextSibling, date.setTime(date.getTime() + 1.5*24*60*60*1000)) {
                        iday = date.getDate();
                        date.setHours(0,0);
			var wday = date.getDay();
			cell.className = "day";
			cell.pos = i << 4 | j;
			dpos[j] = cell;
			var current_month = (date.getMonth() == month);
			if (!current_month) {
				if (this.showsOtherMonths) {
					cell.className += " othermonth";
					cell.otherMonth = true;
				} else {
					cell.className = "emptycell";
					cell.innerHTML = "&nbsp;";
					cell.disabled = true;
					continue;
				}
			} else {
				cell.otherMonth = false;
				hasdays = true;
			}
			cell.disabled = false;
			cell.innerHTML = '<div class="daycont">'+(this.getDateText ? this.getDateText(date, iday) : iday)+'</div>';
			if (dates)
				dates[date.print("%Y%m%d")] = cell;
			if (this.getDateStatus) {
				var status = this.getDateStatus(date, year, month, iday);
				if (this.getDateToolTip) {
					var toolTip = this.getDateToolTip(date, year, month, iday);
					if (toolTip)
						cell.title = toolTip;
				}
				if (status === true) {
					cell.className += " disabled";
					cell.disabled = true;
				} else {
					if (/disabled/i.test(status))
						cell.disabled = true;
					cell.className += " " + status;
				}
			}
			if (!cell.disabled) {
				cell.caldate = new Date(date);
				cell.ttip = "_";
				if (!this.multiple && current_month
				    && iday == mday && this.hiliteToday) {
					cell.className += " selected";
					this.currentDateEl = cell;
				}
				if (date.getFullYear() == TY &&
				    date.getMonth() == TM &&
				    iday == TD) {
					cell.className += " today";
					cell.ttip += TCalendar._TT["PART_TODAY"];
				}
				if (weekend.indexOf(wday.toString()) != -1)
					cell.className += cell.otherMonth ? " oweekend" : " weekend";
			}
		}
		if (!(hasdays || this.showsOtherMonths))
			row.className = "emptyrow";
	}
	this.title.innerHTML = TCalendar._MN[month] + ", " + year;
	this.onSetTime();
	this.table.style.visibility = "visible";
	this._initMultipleDates();
	// PROFILE
	// this.tooltips.innerHTML = "Generated in " + ((new Date()) - today) + " ms";
};

TCalendar.prototype._initMultipleDates = function() {
	if (this.multiple) {
		for (var i in this.multiple) {
			if(!this.multiple.hasOwnProperty(i)){
				continue;
			}
			var cell = this.datesCells[i];
			var d = this.multiple[i];
			if (!d)
				continue;
			if (cell)
				cell.className += " selected";
		}
	}
};

TCalendar.prototype._toggleMultipleDate = function(date) {
	if (this.multiple) {
		var ds = date.print("%Y%m%d");
		var cell = this.datesCells[ds];
		if (cell) {
			var d = this.multiple[ds];
			if (!d) {
				TCalendar.addClass(cell, "selected");
				this.multiple[ds] = date;
			} else {
				TCalendar.removeClass(cell, "selected");
				delete this.multiple[ds];
			}
		}
	}
};

TCalendar.prototype.setDateToolTipHandler = function (unaryFunction) {
	this.getDateToolTip = unaryFunction;
};

/**
 *  Calls _init function above for going to a certain date (but only if the
 *  date is different than the currently selected one).
 */
TCalendar.prototype.setDate = function (date) {
	if (!date.equalsTo(this.date)) {
		this._init(this.firstDayOfWeek, date);
	}
};

/**
 *  Refreshes the calendar.  Useful if the "disabledHandler" function is
 *  dynamic, meaning that the list of disabled date can change at runtime.
 *  Just * call this function if you think that the list of disabled dates
 *  should * change.
 */
TCalendar.prototype.refresh = function () {
	this._init(this.firstDayOfWeek, this.date);
};

/** Modifies the "firstDayOfWeek" parameter (pass 0 for Synday, 1 for Monday, etc.). */
TCalendar.prototype.setFirstDayOfWeek = function (firstDayOfWeek) {
	this._init(firstDayOfWeek, this.date);
	this._displayWeekdays();
};

/**
 *  Allows customization of what dates are enabled.  The "unaryFunction"
 *  parameter must be a function object that receives the date (as a JS Date
 *  object) and returns a boolean value.  If the returned value is true then
 *  the passed date will be marked as disabled.
 */
TCalendar.prototype.setDateStatusHandler = TCalendar.prototype.setDisabledHandler = function (unaryFunction) {
	this.getDateStatus = unaryFunction;
};

/** Customization of allowed year range for the calendar. */
TCalendar.prototype.setRange = function (a, z) {
	this.minYear = a;
	this.maxYear = z;
};

/** Calls the first user handler (selectedHandler). */
TCalendar.prototype.callHandler = function () {
	if (this.onSelected) {
		this.onSelected(this, this.date.print(this.dateFormat));
	}
};

/** Calls the second user handler (closeHandler). */
TCalendar.prototype.callCloseHandler = function () {
	if (this.onClose) {
		this.onClose(this);
	}
	this.hideShowCovered();
};

/** Removes the calendar object from the DOM tree and destroys it. */
TCalendar.prototype.destroy = function () {
	var el = this.element.parentNode;
	el.removeChild(this.element);
	TCalendar._C = null;
	window._dynarch_popupCalendar = null;
};

/**
 *  Moves the calendar element to a different section in the DOM tree (changes
 *  its parent).
 */
TCalendar.prototype.reparent = function (new_parent) {
	var el = this.element;
	el.parentNode.removeChild(el);
	new_parent.appendChild(el);
};

// This gets called when the user presses a mouse button anywhere in the
// document, if the calendar is shown.  If the click was outside the open
// TCalendar this function closes it.
TCalendar._checkCalendar = function(ev) {
	var calendar = window._dynarch_popupCalendar;
	if (!calendar) {
		return false;
	}
	var el = TCalendar.is_ie ? TCalendar.getElement(ev) : TCalendar.getTargetElement(ev);
	for (; el != null && el != calendar.element; el = el.parentNode);
	if (el == null) {
		// calls closeHandler which should hide the calendar.
		window._dynarch_popupCalendar.callCloseHandler();
		return TCalendar.stopEvent(ev);
	}
};

/** Shows the calendar. */
TCalendar.prototype.show = function () {
	var rows = this.table.getElementsByTagName("tr");
	for (var i = rows.length; i > 0;) {
		var row = rows[--i];
		TCalendar.removeClass(row, "rowhilite");
		var cells = row.getElementsByTagName("td");
		for (var j = cells.length; j > 0;) {
			var cell = cells[--j];
			TCalendar.removeClass(cell, "hilite");
			TCalendar.removeClass(cell, "active");
		}
	}
	this.element.style.display = "block";
	this.hidden = false;
	if (this.isPopup) {
		window._dynarch_popupCalendar = this;
		TCalendar.addEvent(document, "keydown", TCalendar._keyEvent);
		TCalendar.addEvent(document, "keypress", TCalendar._keyEvent);
		TCalendar.addEvent(document, "mousedown", TCalendar._checkCalendar);
	}
	this.hideShowCovered();
};

/**
 *  Hides the calendar.  Also removes any "hilite" from the class of any TD
 *  element.
 */
TCalendar.prototype.hide = function () {
	if (this.isPopup) {
		TCalendar.removeEvent(document, "keydown", TCalendar._keyEvent);
		TCalendar.removeEvent(document, "keypress", TCalendar._keyEvent);
		TCalendar.removeEvent(document, "mousedown", TCalendar._checkCalendar);
	}
	D3Api.removeDom(this.rootElement);
	this.hidden = true;
	this.hideShowCovered();
};

/**
 *  Shows the calendar at a given absolute position (beware that, depending on
 *  the calendar element style -- position property -- this might be relative
 *  to the parent's containing rectangle).
 */
TCalendar.prototype.showAt = function (x, y) {
	var s = this.element.style;
	s.left = x + "px";
	s.top = y + "px";
	this.show();
};

/** Shows the calendar near a given element. */
TCalendar.prototype.showAtElement = function (el, opts) {
	var self = this;
	var p = TCalendar.getAbsolutePos(el);
	//alert(p.x + ' ' + p.y);
	if (!opts || typeof opts != "string") {
		this.showAt(p.x, p.y + el.offsetHeight);
		return true;
	}
	function fixPosition(box) {
		if (box.x < 0)
			box.x = 0;
		if (box.y < 0)
			box.y = 0;
		var cp = document.createElement("div");
		var s = cp.style;
		s.position = "fixed";
		s.right = s.bottom = s.width = s.height = "0px";
		document.body.appendChild(cp);
		var br = TCalendar.getAbsolutePos(cp);
		//alert(br.x + ' ' + br.y);
		document.body.removeChild(cp);
		if (TCalendar.is_ie) {
			br.y += document.body.scrollTop;
			br.x += document.body.scrollLeft;
		} else {
			br.y += window.scrollY;
			br.x += window.scrollX;
		}
		var tmp = box.x + box.width - br.x;
		if (tmp > 0) box.x -= tmp;
		tmp = box.y + box.height - br.y;
		if (tmp > 0) box.y -= tmp;
	};
	this.element.style.display = "block";
	TCalendar.continuation_for_the_fucking_khtml_browser = function() {
		var w = self.element.offsetWidth;
		var h = self.element.offsetHeight;
		self.element.style.display = "none";
		var valign = opts.substr(0, 1);
		var halign = "l";
		if (opts.length > 1) {
			halign = opts.substr(1, 1);
		}
		// vertical alignment
		switch (valign) {
		    case "T":p.y -= h;break;
		    case "B":p.y += el.offsetHeight;break; //
		    case "C":p.y += (el.offsetHeight - h) / 2;break;
		    case "t":p.y += el.offsetHeight - h;break;
		    case "b":break; // already there
		}
		// horizontal alignment
		switch (halign) {
		    case "L":p.x -= w;break;
		    case "R":p.x += el.offsetWidth;break;
		    case "C":p.x += (el.offsetWidth - w) / 2;break;
		    case "l":p.x += el.offsetWidth - w;break;
		    case "r":break; // already there
		}
		p.width = w;
		p.height = h + 40;
		
		p.x -= getBodyScrollLeft();
		p.y -= getBodyScrollTop();
		self.monthsCombo.style.display = "none";
		fixPosition(p);
		self.showAt(p.x, p.y);
	};
	if (TCalendar.is_khtml)
		setTimeout("TCalendar.continuation_for_the_fucking_khtml_browser()", 10);
	else
		TCalendar.continuation_for_the_fucking_khtml_browser();
};

/** Customizes the date format. */
TCalendar.prototype.setDateFormat = function (str) {
	this.dateFormat = str;
};

/** Customizes the tooltip date format. */
TCalendar.prototype.setTtDateFormat = function (str) {
	this.ttDateFormat = str;
};

/**
 *  Tries to identify the date represented in a string.  If successful it also
 *  calls this.setDate which moves the calendar to the given date.
 */
TCalendar.prototype.parseDate = function(str, fmt) {
	if (!fmt)
		fmt = this.dateFormat;
	this.setDate(Date.parseDate(str, fmt));
};

TCalendar.prototype.hideShowCovered = function () {
	if (!TCalendar.is_ie && !TCalendar.is_opera)
		return;
	function getVisib(obj){
		var value = obj.style.visibility;
		if (!value) {
			if (document.defaultView && typeof (document.defaultView.getComputedStyle) == "function") { // Gecko, W3C
				if (!TCalendar.is_khtml)
					value = document.defaultView.
						getComputedStyle(obj, "").getPropertyValue("visibility");
				else
					value = '';
			} else if (obj.currentStyle) { // IE
				value = obj.currentStyle.visibility;
			} else
				value = '';
		}
		return value;
	};

	var tags = new Array("applet", "iframe", "select");
	var el = this.element;

	var p = TCalendar.getAbsolutePos(el);
	var EX1 = p.x;
	var EX2 = el.offsetWidth + EX1;
	var EY1 = p.y;
	var EY2 = el.offsetHeight + EY1;

	for (var k = tags.length; k > 0; ) {
		var ar = document.getElementsByTagName(tags[--k]);
		var cc = null;

		for (var i = ar.length; i > 0;) {
			cc = ar[--i];

			p = TCalendar.getAbsolutePos(cc);
			var CX1 = p.x;
			var CX2 = cc.offsetWidth + CX1;
			var CY1 = p.y;
			var CY2 = cc.offsetHeight + CY1;

			if (this.hidden || (CX1 > EX2) || (CX2 < EX1) || (CY1 > EY2) || (CY2 < EY1)) {
				if (!cc.__msh_save_visibility) {
					cc.__msh_save_visibility = getVisib(cc);
				}
				cc.style.visibility = cc.__msh_save_visibility;
			} else {
				if (!cc.__msh_save_visibility) {
					cc.__msh_save_visibility = getVisib(cc);
				}
				cc.style.visibility = "hidden";
			}
		}
	}
};

/** Internal function; it displays the bar with the names of the weekday. */
TCalendar.prototype._displayWeekdays = function () {
	var fdow = this.firstDayOfWeek;
	var cell = this.firstdayname;
	var weekend = TCalendar._TT["WEEKEND"];
	for (var i = 0; i < 7; ++i) {
		cell.className = "day name";
		var realday = (i + fdow) % 7;
		if (i) {
			cell.ttip = TCalendar._TT["DAY_FIRST"].replace("%s", TCalendar._DN[realday]);
			cell.navtype = 100;
			cell.calendar = this;
			cell.fdow = realday;
			TCalendar._add_evs(cell);
		}
		if (weekend.indexOf(realday.toString()) != -1) {
			TCalendar.addClass(cell, "weekend");
		}
		cell.innerHTML = TCalendar._SDN[(i + fdow) % 7];
		cell = cell.nextSibling;
	}
};

/** Internal function.  Hides all combo boxes that might be displayed. */
TCalendar.prototype._hideCombos = function () {
	this.monthsCombo.style.display = "none";
	this.yearsCombo.style.display = "none";
};

/** Internal function.  Starts dragging the element. */
TCalendar.prototype._dragStart = function (ev) {
	if (this.dragging) {
		return;
	}
	this.dragging = true;
	var posX;
	var posY;
	if (TCalendar.is_ie) {
		posY = window.event.clientY + document.body.scrollTop;
		posX = window.event.clientX + document.body.scrollLeft;
	} else {
		posY = ev.clientY + window.scrollY;
		posX = ev.clientX + window.scrollX;
	}
	var st = this.element.style;
	this.xOffs = posX - parseInt(st.left);
	this.yOffs = posY - parseInt(st.top);
	with (TCalendar) {
		addEvent(document, "mousemove", calDragIt);
		addEvent(document, "mouseup", calDragEnd);
	}
};
// full day names
var wsCalendar=TCalendar;
wsCalendar._DN = new Array
("Воскресенье",
 "Понедельник",
 "Вторник",
 "Среда",
 "Четверг",
 "Пятница",
 "Суббота",
 "Воскресенье");

// short day names
wsCalendar._SDN = new Array(
"Вс",
 "Пн",
 "Вт",
 "Ср",
 "Чт",
 "Пт",
 "Сб",
 "Вс");
var index;
var len=wsCalendar._DN.length;
/*for(index=0;index<len;index++){
	wsCalendar._SDN[index]=wsCalendar._DN[index].substring(0,3);
}*/

//Calendar._SDN = new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sun");
// First day of the week. "0" means display Sunday first, "1" means display
// Monday first, etc.
wsCalendar._FD = 0;
// full month names
wsCalendar._MN = new Array
("Январь",
 "Февраль",
 "Март",
 "Апрель",
 "Май",
 "Июнь",
 "Июль",
 "Август",
 "Сентябрь",
 "Октябрь",
 "Ноябрь",
 "Декабрь");

// short month names
wsCalendar._SMN = new Array
("Янв",
 "Фев",
 "Мар",
 "Апр",
 "Май",
 "Июн",
 "Июл",
 "Авг",
 "Сен",
 "Окт",
 "Ноя",
 "Дек");

// tooltips
wsCalendar._TT = {};
wsCalendar._TT["INFO"] = "Календарь - предназначен для ввыбора даты и времени";
wsCalendar._TT["ABOUT"] =
"Выбор даты:\n" +
"- Используйте кнопки \xab и \xbb для выбора года\n" +
"- Удерживайте кнопку нажатой для выбора из списка.";
wsCalendar._TT["ABOUT_TIME"] = "\n\n" +
"Выбор времени:\n" +
"- Нажмите на любой элемент для его увеличения\n" +
"- или нажмите удерживая Shift для его уменьшения\n" +
"- или нажмите и тяните для быстрого выбора.";

wsCalendar._TT["PREV_YEAR"] = "Предыдущий год (удерживайте для меню)";
wsCalendar._TT["PREV_MONTH"] = "Предыдущий месяц (удерживайте для меню)";
wsCalendar._TT["GO_TODAY"] = "Перейти на текущий день";
wsCalendar._TT["NEXT_MONTH"] = "Следующий месяц (удерживайте для меню)";
wsCalendar._TT["NEXT_YEAR"] = "Следующий год (удерживайте для меню)";
wsCalendar._TT["SEL_DATE"] = "Выбор даты";
wsCalendar._TT["DRAG_TO_MOVE"] = "Тяните для перемещения";
wsCalendar._TT["PART_TODAY"] = " (today)";

// the following is to inform that "%s" is to be the first day of week
// %s will be replaced with the day name.
wsCalendar._TT["DAY_FIRST"] = "Отобразить %s первым";

// This may be locale-dependent.  It specifies the week-end days, as an array
// of comma-separated numbers.  The numbers are from 0 to 6: 0 means Sunday, 1
// means Monday, etc.
wsCalendar._TT["WEEKEND"] = "0,6";

wsCalendar._TT["CLOSE"] = "Закрыть";
wsCalendar._TT["TODAY"] = "Сегодня";
wsCalendar._TT["TIME_PART"] = "(Shift-)Click или тяните для изменения времени";

// date formats
wsCalendar._TT["DEF_DATE_FORMAT"] = "%Y-%m-%d";
wsCalendar._TT["TT_DATE_FORMAT"] = "%a, %b %e";

wsCalendar._TT["WK"] = "";
wsCalendar._TT["TIME"] = "Время:";
// BEGIN: DATE OBJECT PATCHES

/** Adds the number of days array to the Date object. */
Date._MD = new Array(31,28,31,30,31,30,31,31,30,31,30,31);

/** Constants used for time computations */
Date.SECOND = 1000 /* milliseconds */;
Date.MINUTE = 60 * Date.SECOND;
Date.HOUR   = 60 * Date.MINUTE;
Date.DAY    = 24 * Date.HOUR;
Date.WEEK   =  7 * Date.DAY;

Date.parseDate = function(str, fmt) {
	var today = new Date();
	var y = 0;
	var m = -1;
	var d = 0;
	var a = str.split(/\W+/);
	var b = fmt.match(/%./g);
	var i = 0, j = 0;
	var hr = 0;
	var min = 0;
	for (i = 0; i < a.length; ++i) {
		if (!a[i])
			continue;
		switch (b[i]) {
		    case "%d":
		    case "%e":
			d = parseInt(a[i], 10);
			break;

		    case "%m":
			m = parseInt(a[i], 10) - 1;
			break;

		    case "%Y":
		    case "%y":
			y = parseInt(a[i], 10);
			(y < 100) && (y += (y > 29) ? 1900 : 2000);
			break;

		    case "%b":
		    case "%B":
			for (j = 0; j < 12; ++j) {
				if (TCalendar._MN[j].substr(0, a[i].length).toLowerCase() == a[i].toLowerCase()) {m = j;break;}
			}
			break;

		    case "%H":
		    case "%I":
		    case "%k":
		    case "%l":
			hr = parseInt(a[i], 10);
			break;

		    case "%P":
		    case "%p":
			if (/pm/i.test(a[i]) && hr < 12)
				hr += 12;
			else if (/am/i.test(a[i]) && hr >= 12)
				hr -= 12;
			break;

		    case "%M":
			min = parseInt(a[i], 10);
			break;
		}
	}
	if (isNaN(y)) y = today.getFullYear();
	if (isNaN(m)) m = today.getMonth();
	if (isNaN(d)) d = today.getDate();
	if (isNaN(hr)) hr = today.getHours();
	if (isNaN(min)) min = today.getMinutes();
	if (y != 0 && m != -1 && d != 0)
		return new Date(y, m, d, hr, min, 0);
	y = 0;m = -1;d = 0;
	for (i = 0; i < a.length; ++i) {
		if (a[i].search(/[a-zA-Z]+/) != -1) {
			var t = -1;
			for (j = 0; j < 12; ++j) {
				if (TCalendar._MN[j].substr(0, a[i].length).toLowerCase() == a[i].toLowerCase()) {t = j;break;}
			}
			if (t != -1) {
				if (m != -1) {
					d = m+1;
				}
				m = t;
			}
		} else if (parseInt(a[i], 10) <= 12 && m == -1) {
			m = a[i]-1;
		} else if (parseInt(a[i], 10) > 31 && y == 0) {
			y = parseInt(a[i], 10);
			(y < 100) && (y += (y > 29) ? 1900 : 2000);
		} else if (d == 0) {
			d = a[i];
		}
	}
	if (y == 0)
		y = today.getFullYear();
	if (m != -1 && d != 0)
		return new Date(y, m, d, hr, min, 0);
	return today;
};

/** Returns the number of days in the current month */
Date.prototype.getMonthDays = function(month) {
	var year = this.getFullYear();
	if (typeof month == "undefined") {
		month = this.getMonth();
	}
	if (((0 == (year%4)) && ( (0 != (year%100)) || (0 == (year%400)))) && month == 1) {
		return 29;
	} else {
		return Date._MD[month];
	}
};

/** Returns the number of day in the year. */
Date.prototype.getDayOfYear = function() {
	var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
	var then = new Date(this.getFullYear(), 0, 0, 0, 0, 0);
	var time = now - then;
	return Math.floor(time / Date.DAY);
};

/** Returns the number of the week in year, as defined in ISO 8601. */
Date.prototype.getWeekNumber = function() {
	var d = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
	var DoW = d.getDay();
	d.setDate(d.getDate() - (DoW + 6) % 7 + 3); // Nearest Thu
	var ms = d.valueOf(); // GMT
	d.setMonth(0);
	d.setDate(4); // Thu in Week 1
	return Math.round((ms - d.valueOf()) / (7 * 864e5)) + 1;
};

/** Checks date and time equality */
Date.prototype.equalsTo = function(date) {
	return ((this.getFullYear() == date.getFullYear()) &&
		(this.getMonth() == date.getMonth()) &&
		(this.getDate() == date.getDate()) &&
		(this.getHours() == date.getHours()) &&
		(this.getMinutes() == date.getMinutes()));
};

/** Set only the year, month, date parts (keep existing time) */
Date.prototype.setDateOnly = function(date) {
	var tmp = new Date(date);
	this.setDate(1);
	this.setFullYear(tmp.getFullYear());
	this.setMonth(tmp.getMonth());
	this.setDate(tmp.getDate());
};
Date.prototype.clearTime = function() {
	this.setHours(0, 0, 0, 0);
};

/** Prints the date in a string according to the given format. */
Date.prototype.print = function (str) {
	var m = this.getMonth();
	var d = this.getDate();
	var y = this.getFullYear();
	var wn = this.getWeekNumber();
	var w = this.getDay();
	var s = {};
	var hr = this.getHours();
	var pm = (hr >= 12);
	var ir = (pm) ? (hr - 12) : hr;
	var dy = this.getDayOfYear();
	if (ir == 0)
		ir = 12;
	var min = this.getMinutes();
	var sec = this.getSeconds();
	s["%a"] = TCalendar._SDN[w]; // abbreviated weekday name [FIXME: I18N]
	s["%A"] = TCalendar._DN[w]; // full weekday name
	s["%b"] = TCalendar._SMN[m]; // abbreviated month name [FIXME: I18N]
	s["%B"] = TCalendar._MN[m]; // full month name
	// FIXME: %c : preferred date and time representation for the current locale
	s["%C"] = 1 + Math.floor(y / 100); // the century number
	s["%d"] = (d < 10) ? ("0" + d) : d; // the day of the month (range 01 to 31)
	s["%e"] = d; // the day of the month (range 1 to 31)
	// FIXME: %D : american date style: %m/%d/%y
	// FIXME: %E, %F, %G, %g, %h (man strftime)
	s["%H"] = (hr < 10) ? ("0" + hr) : hr; // hour, range 00 to 23 (24h format)
	s["%I"] = (ir < 10) ? ("0" + ir) : ir; // hour, range 01 to 12 (12h format)
	s["%j"] = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy; // day of the year (range 001 to 366)
	s["%k"] = hr;		// hour, range 0 to 23 (24h format)
	s["%l"] = ir;		// hour, range 1 to 12 (12h format)
	s["%m"] = (m < 9) ? ("0" + (1+m)) : (1+m); // month, range 01 to 12
	s["%M"] = (min < 10) ? ("0" + min) : min; // minute, range 00 to 59
	s["%n"] = "\n";		// a newline character
	s["%p"] = pm ? "PM" : "AM";
	s["%P"] = pm ? "pm" : "am";
	// FIXME: %r : the time in am/pm notation %I:%M:%S %p
	// FIXME: %R : the time in 24-hour notation %H:%M
	s["%s"] = Math.floor(this.getTime() / 1000);
	s["%S"] = (sec < 10) ? ("0" + sec) : sec; // seconds, range 00 to 59
	s["%t"] = "\t";		// a tab character
	// FIXME: %T : the time in 24-hour notation (%H:%M:%S)
	s["%U"] = s["%W"] = s["%V"] = (wn < 10) ? ("0" + wn) : wn;
	s["%u"] = w + 1;	// the day of the week (range 1 to 7, 1 = MON)
	s["%w"] = w;		// the day of the week (range 0 to 6, 0 = SUN)
	// FIXME: %x : preferred date representation for the current locale without the time
	// FIXME: %X : preferred time representation for the current locale without the date
	s["%y"] = ('' + y).substr(2, 2); // year without the century (range 00 to 99)
	s["%Y"] = y;		// year with the century 
	s["%%"] = "%";		// a literal '%' character

	var re = /%./g;
	if (!TCalendar.is_ie5 && !TCalendar.is_khtml)
		return str.replace(re, function (par) {return s[par] || par;});

	var a = str.match(re);
	for (var i = 0; i < a.length; i++) {
		var tmp = s[a[i]];
		if (tmp) {
			re = new RegExp(a[i], 'g');
			str = str.replace(re, tmp);
		}
	}

	return str;
};
//TODO: перекрывалось с МИС и уходил в рекурсию. Сделать другой календарь!
if(Date.prototype.__msh_oldSetFullYear)
{
    Date.prototype.__msh_oldSetFullYear = Date.prototype.setFullYear;
    Date.prototype.setFullYear = function(y) {
            var d = new Date(this);
            d.__msh_oldSetFullYear(y);
            if (d.getMonth() != this.getMonth())
                    this.setDate(28);
            this.__msh_oldSetFullYear(y);
    };
}
// END: DATE OBJECT PATCHES
// global object that remembers the calendar
window._dynarch_popupCalendar = null;

function selectedCalendar(cal, date){
        var newdate = new Date(cal.date);
        newdate.clearTime();
	if (cal.timeClicked || cal.dateClicked || (cal.activeDiv.navtype == 0 && cal._oldDate && newdate.equalsTo(cal._oldDate)))
        {
            D3Api.setControlPropertyByDom(cal.ctrl,'value',date,undefined,true);
			if (!(cal.dateClicked && cal.showsTime || cal.timeClicked))
				cal.callCloseHandler();
        }
        cal._oldDate = new Date(newdate);
        newdate = null;
}

function closeCalendar(cal)
{
	if(D3Api.empty(cal.element)) return;
	cal.hide();
	if(D3Api.empty(cal.element.parentNode)) return;
	cal.element.parentNode.removeChild(cal.element);
	_dynarch_popupCalendar = null;
}
D3Api.DateEditCtrl = new function DateEditCtrl()
{
    this.init = function(_dom)
    {
        var inp = D3Api.DateEditCtrl.getInput(_dom);
        D3Api.addEvent(inp, 'change', function(event){D3Api.setControlPropertyByDom(_dom,'value',D3Api.DateEditCtrl.getValue(_dom),undefined,true);D3Api.stopEvent(event);}, true);
		this.init_focus(inp);
        D3Api.BaseCtrl.initEvent(_dom,'onchange');
        _dom.D3Base.addEvent('onchange_property',function(property,value){
            if(property == 'value')
            {
                _dom.D3Base.callEvent('onchange');
                //D3Api.execDomEvent(_dom,'onchange');
            }
        });
		_dom.showsTime = D3Api.getProperty(_dom, 'shows_time', '') == 'shows_time';
		_dom.dateFormat = _dom.showsTime ? '%d.%m.%Y %H:%M' : '%d.%m.%Y';
        if(D3Api.getProperty(_dom,'today',false) == 'true')
        {
            D3Api.setControlPropertyByDom(_dom,'value',(new Date()).print(_dom.dateFormat));
        }
    }
    this.getInput = function DateEdit_getInput(_dom)
    {
        return D3Api.getChildTag(_dom,'input',0);
    }
    this.setEnabled = function DateEdit_setEnabled(_dom, _value)
    {
        var input = D3Api.DateEditCtrl.getInput(_dom);
        //делаем активным
        if (D3Api.getBoolean(_value))
        {
            input.removeAttribute('disabled');
        }//делаем неактивным
        else
        {
            input.setAttribute('disabled','disabled');
        }
        D3Api.BaseCtrl.setEnabled(_dom,_value);
    }
    this.getValue = function DateEdit_getValue(_dom)
    {
    	var v = D3Api.DateEditCtrl.getInput(_dom).value; 
    	if (v == '') return null;
    	return v;
    }
    this.setValue = function DateEdit_setValue(_dom,_value)
    {
        if(_value == null || _value == '')
        {
            D3Api.DateEditCtrl.getInput(_dom).value = '';
        }else
        {
            var _date = Date.parseDate(_value, _dom.dateFormat);
            D3Api.DateEditCtrl.getInput(_dom).value=_date.print(_dom.dateFormat);
        }
    }
    this.getDate = function(_dom)
    {
        return Date.parseDate(D3Api.DateEditCtrl.getInput(_dom).value, _dom.dateFormat);
    }
    this.getCaption = function DateEdit_getCaption(_dom)
    {
        return D3Api.DateEditCtrl.getInput(_dom).value;
    }
    this.setCaption = function DateEdit_setCaption(_dom,_value)
    {
        D3Api.DateEditCtrl.getInput(_dom).value=(_value == null)?'':_value;
    }
    this.getReadonly = function DateEdit_getReadonly(_dom)
    {
        return D3Api.hasProperty(DateEditCtrl.getInput(_dom),'readonly');
    }
    this.setReadonly = function DateEdit_setReadonly(_dom,_value)
    {
        if (D3Api.getBoolean(_value))
        {
            D3Api.DateEditCtrl.getInput(_dom).setAttribute('readonly','readonly');
        }else
        {
            D3Api.DateEditCtrl.getInput(_dom).removeAttribute('readonly','readonly');
        }
    }
    this.showCalendar = function(_dom)
    {
		/**
		 * размещаем элемент в конец дом объекта формы.
		 **/
		var div = document.createElement('div');
		_dom.D3Form.DOM.appendChild(div);

        var input=D3Api.DateEditCtrl.getInput(_dom);

        if (_dynarch_popupCalendar != null) {
                _dynarch_popupCalendar.hide();
        } else {
			var cal = new TCalendar(1, null, selectedCalendar, closeCalendar);
			cal.showsTime = _dom.showsTime;
			_dynarch_popupCalendar = cal;

			_dynarch_popupCalendar.setDateFormat(_dom.dateFormat);

			cal.setRange(1000, 2999);
			cal.create(div);
			cal._oldDate = new Date(cal.date);
			cal._oldDate.clearTime();
        }
        _dynarch_popupCalendar.parseDate(input.value);
        _dynarch_popupCalendar.ctrl = _dom;
        _dynarch_popupCalendar.element._parentDOM_ = _dom;
        var pos = D3Api.getAbsoluteClientRect(input,true,false);
            _dynarch_popupCalendar.showAt(pos.x, pos.y);

        var cal_rect = D3Api.getAbsoluteClientRect(_dynarch_popupCalendar.element);
        var cal_dom = _dynarch_popupCalendar.element;

            var sX = D3Api.getBodyScrollLeft();
        var sY = D3Api.getBodyScrollTop();

        var page = D3Api.getPageWindowSize();

        cal_rect.x = pos.x+pos.width-cal_rect.width;
        cal_rect.y = pos.y+pos.height;

        var h = page.windowHeight+sY;
        var w = page.windowWidth+sX;

        //Растояние внизу окна
        var dH = h - cal_rect.y;
        //Растояние вверху окна
        var uH = pos.y - sY;

        var mcY = cal_rect.y+cal_rect.height;
        var mcX = cal_rect.x+cal_rect.width;

        if (mcY-h > 0)
        {
          //Если выходит за нижний край
          if(dH > uH)
              cal_rect.height = dH;
          else
          {
              if(cal_rect.height > uH)
                  cal_rect.height = uH;
              cal_rect.y -=cal_rect.height+pos.height;
          }

        }

        // Если выходит за левый край
        if(cal_rect.x < 0) {
        cal_rect.x -= cal_rect.x;
        }

        if (mcX-w > 0)
          cal_rect.x -=mcX-w;

        cal_dom.style.left = cal_rect.x +'px';
        cal_dom.style.top = cal_rect.y+'px';

        return false;
    }
    this.clear = function(dom)
    {
        D3Api.setControlPropertyByDom(dom,'caption','',undefined,true);
        D3Api.setControlPropertyByDom(dom,'value','',undefined,true);
    }
}

D3Api.controlsApi['DateEdit'] = new D3Api.ControlBaseProperties(D3Api.DateEditCtrl);
D3Api.controlsApi['DateEdit']['height'] = undefined;
D3Api.controlsApi['DateEdit']['value']={get:D3Api.DateEditCtrl.getValue,set: D3Api.DateEditCtrl.setValue};
D3Api.controlsApi['DateEdit']['caption']={get:D3Api.DateEditCtrl.getCaption,set:D3Api.DateEditCtrl.setCaption}
D3Api.controlsApi['DateEdit']['enabled'].set = D3Api.DateEditCtrl.setEnabled;
D3Api.controlsApi['DateEdit']['input']={get: D3Api.DateEditCtrl.getInput, type: 'dom'};
D3Api.controlsApi['DateEdit']['readonly']={get:D3Api.DateEditCtrl.getReadonly,set: D3Api.DateEditCtrl.setReadonly};
D3Api.controlsApi['DateEdit']['date']={get: D3Api.DateEditCtrl.getDate};
