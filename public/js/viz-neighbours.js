var test_query = [
  "MYORES-2490688-D15",
  "MYORES-2490688-D22",
  "MYORES-2490701-F05",
  "MYORES-2490705-F06",
  "MYORES-2490688-J14",
  "MYORES-2490688-F15",
  "MYORES-2490705-H05",
  "MYORES-2490688-H06",
  "MYORES-2490688-N18",
  "MYORES-2490688-J17",
  "MYORES-2490701-C18",
  "MYORES-2490705-I03",
  "MYORES-2490705-I15",
  "MYORES-2490689-K10",
  "MYORES-2490689-M04",
  "MYORES-2490688-D17",
  "MYORES-2490700-C18",
  "MYORES-2490695-M08",
  "MYORES-2490688-J15",
  "MYORES-2490702-F18",
  "MYORES-2490701-E04",
  "MYORES-2490700-K04",
  "MYORES-2490689-I17",
  "MYORES-2490700-N11",
  "MYORES-2490705-N15"
];

$.ajax({
  type: 'GET',
  url: 'api/images/',
  data: {
    'sample_ids': test_query
  },
  async: false,
  success: function(json) {
    console.log(json);
    for(var i = 0; i < 25; i++) {
      console.log(json[i]['image_thumb']);
      $('#nebula-' + i).attr("src", "data:image/jpg;base64," + json[i]['image_thumb']);
    }
  }
});


