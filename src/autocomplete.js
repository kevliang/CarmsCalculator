var options = {
    shouldSort: true,
    threshold: 0.1,
    maxPatternLength: 32,
    keys: [{
            name: 'LocationID',
            weight: 0.5
        }, {
            name: 'NAME',
            weight: 0.3
        }, {
            name: 'City',
            weight: 0.2
        }]
};

var fuse = new Fuse(airports, options);


var ac = $('#autocomplete').on('click', function (e) {
    e.stopPropagation();
}).on('focus keyup', search)
        .on('keyup', onKeyDown);

var wrap = $('<div>')
        .addClass('autocomplete-wrapper')
        .insertBefore(ac)
        .append(ac);

var list = $('<div>')
        .addClass('autocomplete-results')
        .on('click', '.autocomplete-result', function (e) {
            e.preventDefault();
            e.stopPropagation();
            selectIndex($(this).data('index'));
        })
        .appendTo(wrap);

$(document).on('mouseover', '.autocomplete-result', function (e) {
    var index = parseInt($(this).data('index'), 10);
    if (!isNaN(index)) {
        list.attr('data-highlight', index);
    }
}).on('click', clearResults);

function clearResults() {
    results = [];
    numResults = 0;
    list.empty();
}

function selectIndex(index) {
    if (results.length >= index + 1) {
        var output = results[index].City + " - " + results[index].LocationID;
        ac.attr("data-airport", JSON.stringify(findMapAirport(results[index].LocationID)));
        ac.val(output);
        clearResults();
        $(".autocomplete-results").hide();
    }
}

function findMapAirport(locationID) {
    var location = null;
    for (var i in map.airports) {
        if (location == null && map.airports[i].LocationID == locationID) {
            location = map.airports[i];
        }
    }
    return location;
}

var results = [];
var numResults = 0;
var selectedIndex = -1;

function search(e) {
    if (e.which === 38 || e.which === 13 || e.which === 40) {
        return;
    }

    if (ac.val().length > 0) {
        results = _.take(fuse.search(ac.val()), 2);
        numResults = results.length;

        var divs = results.map(function (r, i) {

            return '<div class="autocomplete-result" data-index="' + i + '">'
                    + '<b>' + r.LocationID + '</b> - ' + r.City
                    + '</div>';
        });

        selectedIndex = -1;
        list.html(divs.join('')).attr('data-highlight', selectedIndex);
        if ($(".autocomplete-results .autocomplete-result").length) {
            $(".autocomplete-results").show();
        } else {
            $(".autocomplete-results").hide();
        }
    } else {
        numResults = 0;
        list.empty();
    }
}

function onKeyDown(e) {
    if (ac.val().length <= 0) {
        return;
    }
    if (e.which != 38 && e.which != 13 && e.which != 40) {
        return;
    }
    e.stopPropagation();
    e.preventDefault(); // prevent the default action (scroll / move caret)

    var curIndex = $(".autocomplete-results > .autocomplete-result.active").index();
    var length = $(".autocomplete-results > .autocomplete-result").length;
    $(".autocomplete-results > .autocomplete-result.active").removeClass("active");
    switch (e.which) {
        case 38: // up
            if (curIndex == -1) {
                $(".autocomplete-results > .autocomplete-result:last").addClass("active");
            } else {
                $(".autocomplete-results > .autocomplete-result:eq(" + (curIndex - 1 < 0 ? (length - 1) : (--curIndex)) + ")").addClass("active");
            }
            break;
        case 13: // enter
            $(".autocomplete-results > .autocomplete-result:eq(" + curIndex + ")").click();
            break;
        case 40: // down
            if (curIndex == -1) {
                $(".autocomplete-results > .autocomplete-result:first").addClass("active");
            } else {
                $(".autocomplete-results > .autocomplete-result:eq(" + (curIndex + 1 >= length ? 0 : (++curIndex)) + ")").addClass("active");
            }
            break;
        default:
            return; // exit this handler for other keys
    }
}
