console.log('neighbours!!!!!');

$.ajax({
  type: 'GET',
  url: 'api/images/',
  data: {
    'image_ids': ['54b70a1cc8dd5b25a4d57f5b', '54b70a52c8dd5b25a4d5805d']
  },
  async: false,
  success: function(json) {
    console.log(json);
  }
});
