function updateNebulaImages(query_id) {

    var neighbours = [];
    var selectedImage = "";
    var neighbourImages = [];

    $.when(
        $.ajax({
            url: '/api/sample/neighbours/' + query_id,
            async: false,
            success: function(json) {
                neighbours = json[0]['neighbours'].slice(1, 25);
            }
        }),
        $.ajax({
            url: '/api/image/' + query_id,
            async: false,
            success: function(json) {
                selectedImage = json[0];
            }
        }),
        $.ajax({
            type: 'GET',
            url: '/api/images/',
            data: {
                'sample_ids': neighbours
            },
            async: false,
            success: function(json) {
                neighbourImages = json;
            }
        })).then(function(res, status) {
            setImages(selectedImage, neighbourImages);
        });
}

function setImages(selectedImage, neighbourImages) {
    $('#nebula-0').attr('src', 'data:image/jpg;base64,' + selectedImage['image_full']);
    $('#nebula-0').attr('title', selectedImage['sample_id']);

    for(var i = 0; i < 24; i++) {
        var nebula_selector = '#nebula-' + (i+1);
        console.log(nebula_selector);
        $(nebula_selector).attr('src', 'data:image/jpg;base64,' + neighbourImages[i]['image_thumb']);
        $(nebula_selector).attr('title', neighbourImages[i]['sample_id']);
    }
}

