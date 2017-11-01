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

    d3.json("data/china_fixed.json", function (key) {
        var i = 0;
        // Convert JSON to content only array.
        var arr = $.map(key, function(el) {i++; return el.content;});

        // Join array values to single string, split words in to an array, remove empty values.
        arr = $.grep((arr.join(",")).split(" "), function(n, i){
            return (n !== "" && n != null);
        })
        var counts = _.countBy(arr);
        var words =  _.map(counts, function(value, key){
            return {"key": key, "value": value};
        });
        console.log(words);
        var ndx = crossfilter(words);
        drawWordcloudChart(ndx);

    })

})();