function updateNeighbours(query_id) {

  // get neighbours for query ID
  $.ajax({
    url: '/api/sample/neighbours/' + query_id,
    async: false,
    success: function(json) {
      var neighbours = json[0]['neighbours'];
      setThumbnails(neighbours);
    }
  })
}

function setThumbnails(query_ids) {
  $.ajax({
    type: 'GET',
    url: 'api/images/',
    data: {
      'sample_ids': query_ids
    },
    async: false,
    success: function(json) {
      for(var i = 0; i < 25; i++) {
        $('#nebula-' + i).attr("src", "data:image/jpg;base64," + json[i]['image_thumb']);
      }
    }
  });
}
