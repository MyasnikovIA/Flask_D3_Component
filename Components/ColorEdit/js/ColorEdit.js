if(typeof(SYS_ControlActions) == 'undefined'){ SYS_ControlActions={};}
if(typeof(SYS_ControlActions['ColorEdit']) == 'undefined'){ SYS_ControlActions['ColorEdit']=new Array();}
SYS_ControlActions['ColorEdit']['value']={set:ColorEdit_SetValue,get:ColorEdit_GetValue};

function ColorEdit_Init(_DOM)
{
	_DOM.CSObject = new color_select(_DOM.getElementsByTagName('input')[0].value);
	_DOM.CSObject.hide_update_function = function(_NewColor) { ColorEdit_SetValue(this, _NewColor) }.bind(_DOM);
	_DOM.CSObject.attach_to_element(_DOM.getElementsByTagName('span')[0]);
}

function ColorEdit_GetValue(_DOM)
{
	return _DOM.getElementsByTagName('input')[0].value;
}

function ColorEdit_SetValue(_DOM, _Value)
{
	if (_Value == '-1')
	{
		_DOM.getElementsByTagName('span')[0].style.display = '';
	}
	else
	{
		_DOM.getElementsByTagName('span')[0].style.display = 'none';
		_DOM.getElementsByTagName('input')[0].value = _Value;
		_DOM.getElementsByTagName('select')[0].style.background = _Value;
	}
}

///////////////////////////////////////

var SYS_mouse_x;
var SYS_mouse_y;
var SYS_ColorSelects = new Array(0);
var SYS_scrolling = true;

function set_scrolling(){
  //alert('(set_scrolling)');
  SYS_scrolling = true;

  //window.status = '(scrolling!)'; 
  //scrolling = true;
}

function color_select(init_color) {

  // current control position
  this.sv_image="";
  this.x=0;
  this.y=0;
  this.hexcolor=""
  
  // map methods
  
  // Time to get funky with the DOM.  Unh.

  // Create a DOM element to hold the color select
  this.color_select_box = document.createElement('div');     // the box around the entire color select
  this.color_select_box.className = "color_select_box";
  this.color_select_box.style.display = "none";
  
  //document.body.appendChild(this.color_select_box);
  document.getElementsByTagName("body").item(0).appendChild(this.color_select_box);
  
  // horizontal & vertical s-v cursors
  this.sv_crosshair_horiz_cursor = document.createElement('div');
  this.sv_crosshair_horiz_cursor.className = "sv_crosshair_horiz_cursor";
  this.sv_crosshair_horiz_cursor.style.visibility = "hidden";
  this.color_select_box.appendChild(this.sv_crosshair_horiz_cursor);
  
  this.sv_crosshair_vert_cursor = document.createElement('div');
  this.sv_crosshair_vert_cursor.className = "sv_crosshair_vert_cursor";
  this.sv_crosshair_vert_cursor.style.visibility = "hidden";
  this.color_select_box.appendChild(this.sv_crosshair_vert_cursor);

  // center s-v cursor
  this.sv_crosshair_center_cursor = document.createElement('div');
  this.sv_crosshair_center_cursor.className = "sv_crosshair_center_cursor";
  this.sv_crosshair_center_cursor.style.visibility = "hidden";
  this.color_select_box.appendChild(this.sv_crosshair_center_cursor);
  
  this.sv_select_box_bg = document.createElement('div');
  this.sv_select_box_bg.className = "sv_select_box_bg";
  this.color_select_box.appendChild(this.sv_select_box_bg);
  this.sv_select_box_bg.style.height="256px";
  this.sv_select_box_bg.style.width="256px";
  
  this.sv_select_box = document.createElement('div');
  this.sv_select_box.className = "sv_select_box";
  this.sv_select_box_bg.appendChild(this.sv_select_box);
  this.sv_select_box.style.height="256px";
  this.sv_select_box.style.width="256px";
  D3Api.addEvent(this.sv_select_box, "mousedown", function() { this.sv_select_box_mousedown(); }.bind(this));
  D3Api.addEvent(this.sv_select_box, "mouseup", function() { this.sv_select_box_mouseup(); }.bind(this));
  
  this.h_select_box = document.createElement('div');
  this.h_select_box.className = "h_select_box";
  D3Api.addEvent(this.h_select_box, "mousedown", function(){ this.h_select_box_mousedown(); }.bind(this));
  D3Api.addEvent(this.h_select_box, "mouseup", function(){ this.h_select_box_mouseup(); }.bind(this));
  this.color_select_box.appendChild(this.h_select_box);
  
  this.color_box = document.createElement('div');
  this.color_box.className = "color_box";
  this.color_select_box.appendChild(this.color_box);
  
  this.color_value_box = document.createElement('div');
  this.color_value_box.className = "color_value_box";
  this.color_box.appendChild(this.color_value_box);
  
  // ok button
  this.ok_button = document.createElement('div');
  this.ok_button.className = "ok_button";
  this.color_select_box.appendChild(this.ok_button);
  this.ok_button.innerHTML = "ok";
  
  D3Api.addEvent(this.ok_button,"mouseup", function() { this.hide(); }.bind(this));
  
  // hue cursor
  this.hue_cursor = document.createElement('div');
  this.hue_cursor.className = "hue_cursor";
  this.h_select_box.appendChild(this.hue_cursor);
  
  // used for mapping between mouse positions and color parameters
  this.hue_offset=0;
  this.sat_offset=0;
  this.val_offset=0;
  this.color_select_bounding_box = new Array(4);    // upper-left corner x, upper-left corner y, width, height

  // state information for the controls
  this.initialized=false;
  this.active=false;
  //alert('this should appear only twice! ' + this.id);
  this.h_select_box_focus=false;
  this.sv_select_box_focus=false;

    
  // function to call each time the color is updated
  this.change_update_function = null;
  this.hide_update_function = null;
 
  this.attach_to_element = function(e)
  {
    this.x = docjslib_getRealLeft(e);
    this.y = docjslib_getRealTop(e) + 22;  // clumsy hack.  Won't work for elements higher than 22 px 
  }


  this.h_select_box_mousedown = function()
  {
    this.h_select_box_focus = true;
    this.hue_cursor_to_color();
    this.sv_update();
    color_select_update();
  }

  this.h_select_box_mouseup = function()
  {
    this.h_select_box_focus = false;
  }

  this.sv_select_box_mousedown = function()
  {
    this.sv_select_box_focus = true;
    this.sv_update();
    color_select_update();
  }

  this.sv_select_box_mouseup = function()
  {
    this.sv_select_box_focus = false;
  }

  // these functions are tied to events (usually).
  // they are the entry points for whatever color_select does

  this.show = function()
  {
    this.color_select_bounding_box = new Array;
    
    // in mozilla, insert the saturation-value background image
    if (!document.all && this.sv_image)
      this.sv_select_box.style.backgroundImage = "url('"+this.sv_image+"')";

    // make them visible first so we can substract the position of 
    // offsetParent 
    this.color_select_box.style.visibility = "visible";
    this.color_select_box.style.display = "block";   
    this.color_select_box.style.position = "absolute";
    this.color_select_box.style.left = this.x - docjslib_getRealLeft(this.color_select_box.offsetParent) + "px";
    this.color_select_box.style.top = this.y - docjslib_getRealTop(this.color_select_box.offsetParent) + "px";

    
    this.sat_offset = docjslib_getRealTop(this.sv_select_box);
    this.val_offset = docjslib_getRealLeft(this.sv_select_box);
    this.hue_offset = docjslib_getRealTop(this.h_select_box);
  
    this.color_select_bounding_box[0]=this.x;
    this.color_select_bounding_box[1]=this.y;
    this.color_select_bounding_box[2]=300;
    this.color_select_bounding_box[3]=300;
    
    this.sv_cursor_draw();
    
    // position hue cursor
    this.hue_cursor.style.left = docjslib_getRealLeft(this.h_select_box) - docjslib_getRealLeft(this.color_select_box)-1;
    this.hue_cursor_draw();
    
    this.initialized=true;
    this.active=true;
    if (!this.color_select_box.style) alert ("color select box style not found!");
    
    this.update_color_box();
  }
  
  this.hide = function()
  {
    if (this.color_select_box)
      this.color_select_box.style.display = "none";
      
    this.active=false;
    this.unfocus();
    
    if (typeof(this.hide_update_function) == 'function') this.hide_update_function(this.hexcolor);
  }

  this.toggle_color_select = function()
  {
    if (this.active)
      this.hide();
    else
      this.show();
  }

  this.hue_cursor_to_color = function() 
  {
    //alert(this.h_select_box_focus);
    // map from the mouse position to the new hue value
    
    if (!this.h_select_box_focus) return;
    
    var new_hue_cursor_pos = SYS_mouse_y - this.hue_offset;
    //alert(new_hue_cursor_pos);
    
    // keep the value sensible
    if (new_hue_cursor_pos > 255)
      new_hue_cursor_pos=255;
    if (new_hue_cursor_pos < 0)
      new_hue_cursor_pos=0;
  
    this.hue_cursor_pos = new_hue_cursor_pos;
    this.hue_value = 360 - new_hue_cursor_pos/255*360;
    
    this.hue_cursor_draw();
    this.cursor_to_color();
      
  }
    
  this.sv_update = function() 
  {
    // map from the mouse position to the new s-v values
    
    // might be possible to get rid of this
    if (!this.sv_select_box_focus) return;
    
    var new_sat_cursor_pos = SYS_mouse_y - this.sat_offset;
    var new_val_cursor_pos = SYS_mouse_x - this.val_offset;
    
    // keep the values sensible
    if (new_sat_cursor_pos > 255)
      new_sat_cursor_pos = 255;
    if (new_sat_cursor_pos < 0)
      new_sat_cursor_pos = 0;
      
    if (new_val_cursor_pos > 255)
      new_val_cursor_pos = 255;
    if (new_val_cursor_pos < 0)
      new_val_cursor_pos = 0;
    
    this.sat_cursor_pos = new_sat_cursor_pos;
    this.val_cursor_pos = new_val_cursor_pos;
    //window.status = this.hue_cursor_pos + ","+this.sat_cursor_pos + ","+this.val_cursor_pos +"("+this.sat_offset+ ","+this.val_offset+")";
    
    this.sv_cursor_draw();
    this.cursor_to_color();
    
    return;
  }

  this.hue_cursor_draw = function()
  {
    if (!this.hue_cursor.style) return;
    if (!this.sv_select_box_bg.style) return;
  
    this.hue_cursor.style.top = this.hue_cursor_pos+1 + "px";

    this.hue_cursor.style.visibility = "visible";
    //this.cursor_to_color();
    
    // update sv_select_box background
    var hsvcolor = new Array(this.hue_value,1,255);
    var rgbcolor = hsv2rgb(hsvcolor);
    var new_color = "rgb("+rgbcolor[0]+", "+rgbcolor[1]+", "+rgbcolor[2]+")";
    this.sv_select_box_bg.style.background = new_color;
    //window.status="hue cursor draw! " + this.hue_cursor.style.left;
  }
  
  
  
  this.sv_cursor_draw = function()
  {
    if (!this.sv_crosshair_horiz_cursor.style) return;
    if (!this.sv_crosshair_vert_cursor.style) return;
    
    // this is sort of a seat-of-the-pants algorithm for keeping the cursor
    // visible against the s-v background.  There are probably better methods.
    var cursor_color=this.val_cursor_pos;
    if (cursor_color==0) cursor_color=.001;
    cursor_color = Math.round(255/(cursor_color/30));
    if (cursor_color > 255) cursor_color = 255;
    if (cursor_color < 0) cursor_color = 0;
    
    this.sv_crosshair_vert_cursor.style.backgroundColor = "rgb("+cursor_color+","+cursor_color+","+cursor_color+")";
    this.sv_crosshair_horiz_cursor.style.borderColor = "rgb("+cursor_color+","+cursor_color+","+cursor_color+")";
    
    // place the s-v cursors.
    this.sv_crosshair_horiz_cursor.style.top = this.sat_cursor_pos+3 + "px";
    this.sv_crosshair_horiz_cursor.style.left = 2 + "px";
    this.sv_crosshair_horiz_cursor.style.visibility = "visible";
  
    this.sv_crosshair_vert_cursor.style.left = this.val_cursor_pos+3 + "px";
    this.sv_crosshair_vert_cursor.style.visibility = "visible";
    
    //this.cursor_to_color();
  }
    
  
  
  this.cursor_to_color = function()
  {
    //calculate real h, s & v
    this.hue_value = ((255-this.hue_cursor_pos)/255*360);
    this.sat_value = (255 - this.sat_cursor_pos)/255;
    //this.sat_value = this.sat_cursor_pos;
    this.val_value = this.val_cursor_pos;
    //alert ("cursor_to_color: "+ this.hue_value +" "+this.sat_value+" "+this.val_value);

    this.update_color_box();
  }
  
  
  this.unfocus = function() 
  {
    //this.h_select_box_focus=false;
    this.sv_select_box_focus=false;
  }


  this.setrgb = function(c)
  {
    //  hsv:  h = 0-360    s = 0 (gray) - 1.0 (pure color)   v = 0 (black) to 255 (white)
    if (!c.match(/#?([0-9]|[A-Fa-f]){1,6}/i))  // valid hex #color?
	{
      return false;
	}
      
    var rgb = hex2rgb(c.substring(1,7));
    //alert ("hex -> rgb: "+ rgb[0] +" "+rgb[1]+" "+rgb[2]);
    
    hsv = rgb2hsv(rgb);
    
    //alert ("rgb -> hsv: "+ hsv[0] +" "+hsv[1]+" "+hsv[2]);
    
    this.sethsv(hsv[0],hsv[1],hsv[2]);
    
    //rgb_again = hsv2rgb(hsv);
    //alert ("hex -> rgb: "+ rgb[0] +" "+rgb[1]+" "+rgb[2]+
    //       "\nrgb -> hsv: "+ hsv[0] +" "+hsv[1]+" "+hsv[2]+
    //       "\nrgb -> hsv -> rgb: "+ rgb_again[0] +" "+rgb_again[1]+" "+rgb_again[2]);
    return true;
  }
  
  
  this.sethsv = function(h, s, v)
  {
    var hsvcolor;
    
    this.hue_value = h;  
    this.sat_value = s;  
    this.val_value = v;  
   
    this.hue_cursor_pos = (360 - this.hue_value)/360*255;
    this.sat_cursor_pos = Math.round(255 - 255*this.sat_value);
    this.val_cursor_pos = this.val_value;
    
    this.update_color_box();    
  }
  
  
  this.update_color_box = function()
  {
    var hsvcolor = new Array(this.hue_value,this.sat_value,this.val_value);
    
    // make them into an rgb color
    var rgbcolor = hsv2rgb(hsvcolor);
    
    //rgbcolor[0] = Math.round(rgbcolor[0]/255*100);
    //rgbcolor[1] = Math.round(rgbcolor[1]/255*100);
    //rgbcolor[2] = Math.round(rgbcolor[2]/255*100);
    
    var new_color = "rgb("+rgbcolor[0]+","+rgbcolor[1]+","+rgbcolor[2]+")";
    //alert ("rgb: "+ rgbcolor[0] +" "+rgbcolor[1]+" "+rgbcolor[2]);
    
    
    // and in hex
    this.hexcolor = "#"+baseconverter(rgbcolor[0],10,16,2)+baseconverter(rgbcolor[1],10,16,2)+baseconverter(rgbcolor[2],10,16,2);
    
    if (typeof(this.change_update_function) == 'function') this.change_update_function(this.hexcolor);
    
    // display it!
    if (this.color_value_box)
      this.color_value_box.innerHTML = this.hexcolor;
    
    if (this.color_value_box.style)
      this.color_box.style.background = new_color;
  }
      
  // push the new color select object onto the
  // global array of color select objects.
  
  // for some reason, the array.push() method 
  // doesn't work with objects, only with primitives.
  
    // initial values
  if (init_color)
    this.setrgb(init_color)
  else
    this.setrgb("#ffffff");

  SYS_ColorSelects[SYS_ColorSelects.length] = this;
  
}

function color_select_mousedown(event) {
  var cs_active = false;

  for (var l1=0;l1<SYS_ColorSelects.length;l1++)
  {
    var ob = SYS_ColorSelects[l1];
    if (!ob.active) continue;
    cs_active = true;
  
    // if the mousedown is outside the color_select_box, close it.
    if  (SYS_mouse_x < ob.color_select_bounding_box[0] ||
        SYS_mouse_y < ob.color_select_bounding_box[1] ||
        SYS_mouse_x > (ob.color_select_bounding_box[0]+ob.color_select_bounding_box[2]) ||
        SYS_mouse_y > (ob.color_select_bounding_box[1]+ob.color_select_bounding_box[3]))
    {
      //alert('(color_select_mousedown) about to hide!');
      //alert('scrolling: ' + scrolling);
      
      SYS_scrolling = false;
      setTimeout("color_select_hide("+l1+")",200);
    }
  }
  
  
  if (cs_active && event)
  {
    if (event.cancelBubble)
      event.cancelBubble = true;
    else
    {
	    if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();
    }
  }
  
}

function color_select_hide(num)
{
  if (!SYS_scrolling)
    SYS_ColorSelects[num].hide();
  else
    SYS_scrolling = false;
}


function color_select_hideall()
{
  //alert("hiding all color selects!");
  for (var l1=0;l1<SYS_ColorSelects.length;l1++)
    SYS_ColorSelects[l1].hide();
}


function color_select_mouseup() {
  //alert('(color_select_mouseup)');
  
  for (var l1=0;l1<SYS_ColorSelects.length;l1++)
  {
    ob=SYS_ColorSelects[l1];
    ob.unfocus();
    SYS_scrolling = false;
  }
}

function get_mouse_coords(e) { 
	if (window.getSelection) {  // Moz
    SYS_mouse_x=e.pageX;
    SYS_mouse_y=e.pageY;
	} else if (document.selection && document.selection.createRange) { // IE
    if (document.documentElement.scrollTop)   // Explorer 6 Strict
    {
      SYS_mouse_x = window.event.clientX + document.documentElement.scrollLeft - 4;
      SYS_mouse_y = window.event.clientY + document.documentElement.scrollTop - 4;
    }
    else if (document.body) // all other Explorers
    {
      SYS_mouse_x=window.event.clientX+document.body.scrollLeft-4;
      SYS_mouse_y=window.event.clientY+document.body.scrollTop-4;
    } 
    
    
	} else { // out of luck below v.4
		var str = "";
		  window.status="Sorry, event capture is not possible with your browser.";
		return;
	}
}

function color_select_update(event) {
  var cs_active = false;

  //window.status = SYS_ColorSelects.length+" color selects";
  for (var l1=0;l1<SYS_ColorSelects.length;l1++)
  {
    ob = SYS_ColorSelects[l1];
    if (ob.active) cs_active = true;
    ob.sv_update();
    ob.hue_cursor_to_color();
  }
  
  if (event && cs_active)
  {
    if (event.cancelBubble)
      event.cancelBubble = true;
    else
    {
	    if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();
    }
  }
}

function baseconverter (number,ob,nb,desired_length) 
{
	// Created 1997 by Brian Risk.  http://members.aol.com/brianrisk
  number += "";  // convert to character, or toUpperCase will fail on some browsers
	number = number.toUpperCase();
	var list = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var dec = 0;
	for (var i = 0; i <=  number.length; i++) 
		dec += (list.indexOf(number.charAt(i))) * (Math.pow(ob , (number.length - i - 1)));
	number = "";
	var magnitude = Math.floor((Math.log(dec))/(Math.log(nb)));
	for (var i = magnitude; i >= 0; i--) 
  {
    //--  stupid nedit, thinks the decrement above is a html commment.
		var amount = Math.floor(dec/Math.pow(nb,i));
		number = number + list.charAt(amount); 
		dec -= amount*(Math.pow(nb,i));
	}
  
  var length=number.length;
  if (length<desired_length)
    for (var i=0;i<desired_length-length;i++)
      number = "0"+number;
  
	return number;
}

function docjslib_getRealTop(imgElem) {
  yPos = imgElem.offsetTop;
  tempEl = imgElem.offsetParent;
  while (tempEl != null) {
    yPos += tempEl.offsetTop;
    tempEl = tempEl.offsetParent;
  }
  return yPos;
}

function docjslib_getRealLeft(imgElem) {
  xPos = imgElem.offsetLeft;
  tempEl = imgElem.offsetParent;
    while (tempEl != null) {
      xPos += tempEl.offsetLeft;
      tempEl = tempEl.offsetParent;
    }
  return xPos;
}

// RGB, each 0 to 255
//  hsv:  h = 0-360    s = 0 (gray) - 1.0 (pure color)   v = 0 (black) to 255 (white)
function rgb2hsv(rgb) {
  var r = rgb[0];
  var g = rgb[1];
  var b = rgb[2];

  var h;
  var s;
	var v = Math.max(Math.max(r, g), b);
	var min = Math.min(Math.min(r, g), b);
  var delta = v - min;

   // Calculate saturation: saturation is 0 if r, g and b are all 0
  if (v == 0)
    s = 0
  else 
    s = delta / v;
    
  if (s==0)
    h=0;  //achromatic.  no hue
  else
  {
    if (r==v)            // between yellow and magenta [degrees]
      h=60*(g-b)/delta;
    else if (g==v)       // between cyan and yellow
      h=120+60*(b-r)/delta;
    else if (b==v)       // between magenta and cyan
      h=240+60*(r-g)/delta;
  }  
  
  if (h<0)
    h+=360;
    
  return new Array(h,s,v);
}

// RGB, each 0 to 255
//  hsv:  h = 0-360    s = 0 (gray) - 1.0 (pure color)   v = 0 (black) to 255 (white)
function hsv2rgb(hsv) {
  var h = hsv[0];
  var s = hsv[1];
  var v = hsv[2];
  
  var r;
  var g;
  var b;
  
  if (s==0) // achromatic (grey)
    return new Array(v,v,v);
  
  var htemp;
  
  if (h==360)
    htemp=0;
  else
    htemp=h;
    
  htemp=htemp/60;
  var i = Math.floor(htemp);   // integer <= h
  var f = htemp - i;           // fractional part of h

  var p = v * (1-s);
  var q = v * (1-(s*f));
  var t = v * (1-(s*(1-f)));
 
  if (i==0) {r=v;g=t;b=p;}
  if (i==1) {r=q;g=v;b=p;}
  if (i==2) {r=p;g=v;b=t;}
  if (i==3) {r=p;g=q;b=v;}
  if (i==4) {r=t;g=p;b=v;}
  if (i==5) {r=v;g=p;b=q;}

  r=Math.round(r);
  g=Math.round(g);
  b=Math.round(b);

  return new Array(r,g,b);
}

function hex2rgb(h) {
  h = h.replace(/#/,'');
  for (var i = 6 - h.length; i >= 0; i--) h += '0';
  // RGB, each 0 to 255
  var r = Math.round(parseInt(h.substring(0,2),16));
  var g = Math.round(parseInt(h.substring(2,4),16));
  var b = Math.round(parseInt(h.substring(4,6),16));
  //alert("hex2rgb: "+h+" "+r+" "+g+" "+b);

  var results = new Array(r,g,b);
  return results;
}

// hook up the appropriate browser events.
D3Api.addEvent(document, 'scroll', set_scrolling);
D3Api.addEvent(document, 'resize',color_select_mousedown);
D3Api.addEvent(document, 'mousedown', color_select_mousedown);
D3Api.addEvent(document, 'mouseup', color_select_mouseup);
D3Api.addEvent(document, 'mousemove', get_mouse_coords);
D3Api.addEvent(document, 'mousemove', color_select_update);
D3Api.addEvent(document, 'resize', color_select_hideall);