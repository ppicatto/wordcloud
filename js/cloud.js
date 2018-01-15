var wordcloudChart = dc.wordcloudChart('#cloudChart');

// jquery function to get text only on wordcloud elements
$.fn.immediateText = function() {
    return this.contents().not(this.children()).text();
};
var stopWordsFromFile = [];
$.ajax({
    url: './bower_components/stopwords-zh/stopwords-zh.json',
    async: false,
    dataType: 'json',
    success: function (response) {
        stopWordsFromFile = response;
        console.log(stopWordsFromFile);
    }
});

(function(){
    'use strict'

	function drawWordcloudChart(ndx){
		var wordDim = ndx.dimension(function(d){
            // console.log(d);
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
    $.get( "data/china_fixed.json", function( data ) {
        // table name, version, description, size (1024 MB)
        var db = openDatabase('tweets', '1', 'tweets list db', 1024 * 1024 * 1024);
        db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS tweetsTable (articleId TEXT, title TEXT, news_title TEXT, news_location TEXT, news_localgov TEXT, news_circulationLevel TEXT, news_Start TEXT, news_end TEXT, authorType_name TEXT, keywords TEXT, Place TEXT, OrganisationType TEXT, peopleMentioned TEXT, imageURL TEXT, videoURL TEXT, pageNumber TEXT, page TEXT, file TEXT, content TEXT, date TEXT);", []);
            var sql = "INSERT OR REPLACE INTO tweetsTable (articleId, title, news_title, news_location, news_localgov, news_circulationLevel, news_Start, news_end, authorType_name, keywords, Place, OrganisationType, peopleMentioned, imageURL, videoURL, pageNumber, page, file, content, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
            // console.log('Inserting or Updating in local database:');
        
            for (let o in data) {
                // console.log(data[o].articleId + ' ' + data[o].title + ' ' + data[o]['newsPaper.title'] + ' ' + data[o]['newsPaper.location'] + ' ' + data[o]['newsPaper.localgov'] + ' ' + data[o]['newsPaper.circulationLevel'] + ' ' + data[o]['newsPaper.Start'] + ' ' + data[o]['newsPaper.end'] + ' ' + data[o]['authorType.name'] + ' ' + data[o]['keywords'] + ' ' + data[o]['Place'] + ' ' + data[o]['OrganisationType'] + ' ' + data[o].peopleMentioned + ' ' + data[o].imageURL + ' ' + data[o].videoURL + ' ' + data[o].pageNumber + ' ' + data[o].page + ' ' + data[o].file + ' ' + data[o].content + ' ' + data[o].date);
                let params = [data[o].articleId, data[o].title, data[o]['newsPaper.title'], data[o]['newsPaper.location'], data[o]['newsPaper.localgov'], data[o]['newsPaper.circulationLevel'], data[o]['newsPaper.Start'], data[o]['newsPaper.end'], data[o]['authorType.name'], data[o].keywords, data[o].Place, data[o].OrganisationType, data[o].peopleMentioned, data[o].imageURL, data[o].videoURL, data[o].pageNumber, data[o].page, data[o].file, data[o].content, data[o].date];
                tx.executeSql(sql, params);
                console.log('Synchronization complete (' + o + ' items synchronized)');
            }
        }, this.txErrorHandler, function(tx) {
            generateCloud();
        });
    });

    $('#btnMaxWords').click(function(){
        generateCloud();
    });

    $('#btnStopWord').click(function(){
        if (!$('#txtStopWord').val()) {
            return false;
        }
        let word = $('<li>').text($('#txtStopWord').val());
        word.click(function(){
            $(this).remove();
            generateCloud();
        });
        $('#ulStopWord').append(word);
        generateCloud();
        $('#txtStopWord').val("");
    });

    $('#btnDoNotWord').click(function(){
        if (!$('#txtDoNotWord').val()) {
            return false;
        }
        let word = $('<li>').text($('#txtDoNotWord').val());
        word.click(function(){
            $(this).remove();
            generateCloud();
        });
        $('#ulDoNotWord').append(word);
        generateCloud();
        $('#txtDoNotWord').val("");
    });
    function generateCloud() {
        var db = openDatabase('tweets', '1', 'tweets list db', 1024 * 1024 * 1024);
        db.transaction(function (tran) {
            var content = '';
            tran.executeSql('SELECT content FROM tweetsTable limit 10', [], function (tran, data) {
                // Convert JSON to content only array.
                var arr = $.map(data.rows, function(el) { 
                    let stopWordList = $($('#ulStopWord li').get());
                    if (stopWordList.length) {
                        for (let idx = 0; idx < stopWordList.length; idx++) {
                            if (el.content.indexOf($(stopWordList[idx]).text()) !== -1) {
                                return el.content;
                            }
                        }
                    } else {
                        return el.content;
                    }
                });

                // Join array values to single string, split words in to an array, remove empty values.
                arr = $.grep((arr.join(",")).split(" "), function(n, i){
                    if (!(n !== "" && n != null)) {
                        return false;
                    }
                    if ($.isNumeric(n) || $.inArray(n, ['“', ',', '”', '——']) !== -1 || $.inArray(n, stopWordsFromFile) !== -1) {
                        return false;
                    }

                    let DoNotWordList = $($('#ulDoNotWord li').get());
                    if (!DoNotWordList.length) {
                        return true;
                    }
                    for (let idx = 0; idx < DoNotWordList.length; idx++) {
                        console.log(n, $(DoNotWordList[idx]).text());
                        if (n === $(DoNotWordList[idx]).text()) {

                            return false;
                        }
                    }

                    return true;
                })
                var counts = _.countBy(arr);
                var words =  _.map(counts, function(value, key) {
                    return {"key": key, "value": value};
                });
                words = (_.sortBy(words, 'value')).reverse();
                if ($("#txtMaxWords").val()) {
                    words = words.slice(0, $("#txtMaxWords").val());
                }
                var ndx = crossfilter(words);
                drawWordcloudChart(ndx);
            });
        });
        loadContextMenu();
    };
    function loadContextMenu() {
        $.contextMenu({
            selector: '#cloudChart svg text', 
            callback: function(key, options) {
                if ("filter-by" === key) {
                    $("#txtStopWord").val($(this).immediateText());
                    $("#btnStopWord").click();
                } else if ("filter-not-contain" === key) {
                    $("#txtDoNotWord").val($(this).immediateText());
                    $("#btnDoNotWord").click();
                }
            },
            items: {
                "filter-by": {name: "Contain word"},
                "filter-not-contain": {name: "Do not contain it"},
            }
        });
    }
})();
