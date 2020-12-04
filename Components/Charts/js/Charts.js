D3Api.ChartsCtrl = new function() {
    this.isReady = false;
    this.init = function(dom) 
    {
        D3Api.include_js('Components/Charts/js/crossfilter.js',function(){
            D3Api.include_js('Components/Charts/js/d3.js',function(){
                D3Api.include_js('Components/Charts/js/dc.js',function(){
                    D3Api.ChartsCtrl.isReady = true;
                });
            });
        });
        dom.D3Store.chart = {};
        var ta = D3Api.getChildTag(dom,'textarea',0);
        dom.D3Store.chart.settings = ta && ta.value || '';
        ta && D3Api.removeDom(ta);
        dom.D3Store.chart.type = D3Api.getProperty(dom,'type','bar');
        dom.D3Store.chart.datamethod = D3Api.getProperty(dom,'datamethod','');
        dom.D3Store.chart.dimension = D3Api.getProperty(dom,'dimension','');
        dom.D3Store.chart.group = D3Api.getProperty(dom,'group','');
        dom.D3Store.chart.reduce = D3Api.getProperty(dom,'reduce','count');

        dom.D3Store.dataSetName = D3Api.getProperty(dom, 'dataset', '');

        dom.D3Store.dataSetName && dom.D3Form.getDataSet(dom.D3Store.dataSetName).addEvent('onafter_refresh', function() {
            D3Api.ChartsCtrl.parseData(dom, this.data)
        });

        dom.D3Form.addEvent('onResize', function() {
            D3Api.ChartsCtrl.parseData(dom, dom.D3Form.getDataSet(dom.D3Store.dataSetName).data);
        });
    }
    this.setType = function Charts_SetType(dom,value)
    {
      return D3Api.setProperty(dom, 'type', value);
    }
    this.getType = function Charts_GetType(dom)
    {
      return D3Api.getProperty(dom, 'type', '');
    }
    this.parseData = function(dom, data) 
    {
        if(!D3Api.ChartsCtrl.isReady)
        {
            setTimeout(function(){D3Api.ChartsCtrl.parseData(dom,data)},100);
            return;
        }
        var chartData = {};
        if(dom.D3Store.chart.datamethod)
        {
            if(dom.D3Form.existsFunction(dom.D3Store.chart.datamethod))
                dom.D3Form.callFunction(dom.D3Store.chart.datamethod,data,chartData);
            else
                D3Api.debug_msg('Метод "'+dom.D3Store.chart.datamethod+'" для подготовки данных на форме не определен.')
        }else if(dom.D3Store.chart.dimension)
        {
            //Подготавливаем данные сами
            var d = crossfilter(data);
            chartData.values = d.dimension(function(d){return d[dom.D3Store.chart.dimension];});
            chartData.groups = chartData.values.group();
            if(dom.D3Store.chart.group)
            {
                switch(dom.D3Store.chart.reduce)
                {
                    case 'sum':
                            chartData.groups.reduceSum(function(d){return d[dom.D3Store.chart.group || dom.D3Store.chart.dimension];});
                        break;
                    case 'count':
                    default:
                            chartData.groups.reduceCount(function(d){return d[dom.D3Store.chart.group || dom.D3Store.chart.dimension];});
                        break;
                }
            }
        }else
        {
            D3Api.debug_msg('Не указаны параметры для формирования данных.')
            return;
        }
        var chart = null;
        switch (dom.D3Store.chart.type)
        {
            case 'bar': chart = dc.barChart(dom);
                        chart.margins({top: 10, right: 10, bottom: 20, left: 40})
                            .dimension(chartData.values)
                            .group(chartData.groups)
                            .transitionDuration(500)
                            .centerBar(true);  
                break;
            case 'pie': chart = dc.pieChart(dom);
                        chart.dimension(chartData.values)
                            .group(chartData.groups)
                            .transitionDuration(500);
                break;
            case 'rowbar': chart = dc.rowChart(dom);
                           chart.dimension(chartData.values)
                                .group(chartData.groups)
                                .transitionDuration(500);
                break;
        }
        var size = D3Api.getAbsoluteSize(dom);  
        chart.width(size.width)
            .height(size.height);
         
        try
        {
            if(dom.D3Store.chart.settings)
                eval(dom.D3Store.chart.settings);
        }catch(e)
        {
            D3Api.debug_msg(e)
        }
        chart.render();
        dom.D3Store.chart.chart = chart;
    }
}

D3Api.controlsApi['Charts'] = new D3Api.ControlBaseProperties(D3Api.ChartsCtrl);
D3Api.controlsApi['Charts']['type'] = { get:D3Api.ChartsCtrl.getType,set:D3Api.ChartsCtrl.setType };
D3Api.controlsApi['Charts']['datamethod'] = { get:D3Api.ChartsCtrl.getDataMethod,set:D3Api.ChartsCtrl.setDataMethod };
D3Api.controlsApi['Charts']['settings'] = { get:D3Api.ChartsCtrl.getSettings,set:D3Api.ChartsCtrl.setSettings };
