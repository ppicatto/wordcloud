var wordcloudChart = dc.wordcloudChart('#cloudChart');

(function(){
	'use strict'

	function drawWordcloudChart(ndx){
		var wordDim = ndx.dimension(function(d){
            console.log(d);
            return d.key;
        });
        
        var wordGroup = wordDim.group().reduceSum(function(d){
            return d.value;
        });

        wordcloudChart.options({
            height: 500,
            width: 1000,
            minY: -100,
            minX: -350,
            relativeSize: 20,
            dimension: wordDim,
            group: wordGroup,
            valueAccessor: function(d) {return d.value},
            title: function (d) { return [d.key, 'Word Count: '+d.value].join('\n')},
        });
    
        wordcloudChart.render();
    }

    d3.json(data, function (key) {
        console.log(key);
        var ndx = crossfilter(key);
        
        drawWordcloudChart(ndx);

    })

})();