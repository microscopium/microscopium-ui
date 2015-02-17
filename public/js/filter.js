function filter(uniqueRow, uniqueCol, uniquePlate, uniqueGene) {

    // remove existing items in filter
    $('.filter-items').children().remove();

    var length = uniquePlate.length/2;
    console.log(length);
    for(var j = 0; j < 2; j++) {
        for(var i = 0; i < length; i++) {
            var el = '#plate-' + (j+1);
            $('<input />', { type: 'checkbox',
                name: 'uniquePlate[' + [uniquePlate[i+j*length]] + ']',
                value: true,
                checked: true}).appendTo(el);
            $('<label />', { 'for': uniquePlate[i], text: uniquePlate[i+j*length] }).appendTo(el);
            $('<br />').appendTo(el);
        }
    }

    var length = uniqueRow.length/2;
    console.log(length);
    for(var j = 0; j < 2; j++) {
        for(var i = 0; i < length; i++) {
            var el = '#row-' + (j+1);
            $('<input />', { type: 'checkbox',
                name: 'uniqueRow[' + [uniqueRow[i+j*length]] + ']',
                value: true,
                checked: true}).appendTo(el);
            $('<label />', { 'for': uniqueRow[i], text: uniqueRow[i+j*length] }).appendTo(el);
            $('<br />').appendTo(el);
        }
    }

    var length = uniqueCol.length/3;
    for(var j = 0; j < 3; j++) {
        for(var i = 0; i < length; i++) {
            var el = '#col-' + (j+1);
            $('<input />', { type: 'checkbox',
                name: 'uniqueCol[' + [uniqueCol[i+j*length]] + ']',
                value: true,
                checked: true}).appendTo(el);
            $('<label />', { 'for': uniqueCol[i], text: uniqueCol[i+j*length] }).appendTo(el);
            $('<br />').appendTo(el);
        }
    }

    for(var i = 0; i < uniqueGene.length; i++) {
        $('<option />', {
            value: uniqueGene[i],
            text: uniqueGene[i]
        }).appendTo('#gene-select');
    }

    // TODO make filters actually do stuff

    $('#filter-button').removeClass('hidden');
}