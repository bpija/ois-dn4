var map;
var service;
var infowindow;

var x = document.getElementById("demo");

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
        $('#yay').fadeIn('slow');
    } else {
        //x.innerHTML = "Geolocation is not supported by this browser.";
        $('#ooh').fadeIn('slow');
    }
}

function showPosition(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    $("#val").html("<b>Zempljepisna širina:</b> " + lat + "<br><b>Zemljepisna dolžina:</b> " + lon);
    var latlon = new google.maps.LatLng(lat,lon);
    initialize(lat, lon, latlon);
  }

function initialize(lat, lon, moja) {

  var pyrmont = new google.maps.LatLng(lat, lon);

  var map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: pyrmont,
      zoom: 15
    });

  var contentString = '<div id="content" style="width:100px">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<div id="bodyContent">'+
      '<p">Nahajate se tukaj!</p>'+
      '</div>'+
      '</div>';

  var infowindow = new google.maps.InfoWindow({
      content: contentString
  });

  var mojaLokacija = new google.maps.Marker({
      position: moja,
      map: map,
      title: "Moja lokacija"
  });

  google.maps.event.addListener(mojaLokacija, 'click', function() {
    infowindow.open(map, mojaLokacija);
  });

  var tabelaMarkerjev = [];
  var tabelaInfo = [];
  var st=0; 

  for (var i in json.bolnisnice) {
      var tmp = json.bolnisnice[i];
      var lokacija = new google.maps.LatLng(tmp.lat, tmp.lon);

      tabelaMarkerjev[st] = new google.maps.Marker({
          position: lokacija,
          map: map,
          title: tmp.ime
      });

      tabelaInfo[st] = new google.maps.InfoWindow({
          content: '<div id="content" style="width:100px">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<div id="bodyContent">'+
      tmp.ime+
      '</div>'+
      '</div>'
      });

      st=st+1;

     /* var marker = new google.maps.Marker({
        position: lokacija,
        map: map,
        title: tmp.ime
      });*/
  }

  google.maps.event.addListener(tabelaMarkerjev[0], 'click', function() {
    tabelaInfo[0].open(map, tabelaMarkerjev[0]);
  });

  google.maps.event.addListener(tabelaMarkerjev[1], 'click', function() {
    tabelaInfo[1].open(map, tabelaMarkerjev[1]);
  });

  google.maps.event.addListener(tabelaMarkerjev[2], 'click', function() {
    tabelaInfo[2].open(map, tabelaMarkerjev[2]);
  });

  google.maps.event.addListener(tabelaMarkerjev[3], 'click', function() {
    tabelaInfo[3].open(map, tabelaMarkerjev[3]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[4], 'click', function() {
    tabelaInfo[4].open(map, tabelaMarkerjev[4]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[5], 'click', function() {
    tabelaInfo[5].open(map, tabelaMarkerjev[5]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[6], 'click', function() {
    tabelaInfo[6].open(map, tabelaMarkerjev[6]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[7], 'click', function() {
    tabelaInfo[7].open(map, tabelaMarkerjev[7]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[8], 'click', function() {
    tabelaInfo[8].open(map, tabelaMarkerjev[8]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[9], 'click', function() {
    tabelaInfo[9].open(map, tabelaMarkerjev[9]);
  });

  google.maps.event.addListener(tabelaMarkerjev[10], 'click', function() {
    tabelaInfo[10].open(map, tabelaMarkerjev[10]);
  });

  google.maps.event.addListener(tabelaMarkerjev[11], 'click', function() {
    tabelaInfo[11].open(map, tabelaMarkerjev[11]);
  });

  google.maps.event.addListener(tabelaMarkerjev[12], 'click', function() {
    tabelaInfo[12].open(map, tabelaMarkerjev[12]);
  });

  google.maps.event.addListener(tabelaMarkerjev[13], 'click', function() {
    tabelaInfo[13].open(map, tabelaMarkerjev[13]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[14], 'click', function() {
    tabelaInfo[14].open(map, tabelaMarkerjev[14]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[15], 'click', function() {
    tabelaInfo[15].open(map, tabelaMarkerjev[15]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[16], 'click', function() {
    tabelaInfo[16].open(map, tabelaMarkerjev[16]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[17], 'click', function() {
    tabelaInfo[17].open(map, tabelaMarkerjev[17]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[18], 'click', function() {
    tabelaInfo[18].open(map, tabelaMarkerjev[18]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[19], 'click', function() {
    tabelaInfo[19].open(map, tabelaMarkerjev[19]);
  });

  google.maps.event.addListener(tabelaMarkerjev[20], 'click', function() {
    tabelaInfo[20].open(map, tabelaMarkerjev[20]);
  });

  google.maps.event.addListener(tabelaMarkerjev[21], 'click', function() {
    tabelaInfo[21].open(map, tabelaMarkerjev[21]);
  });

  google.maps.event.addListener(tabelaMarkerjev[22], 'click', function() {
    tabelaInfo[22].open(map, tabelaMarkerjev[22]);
  });

  google.maps.event.addListener(tabelaMarkerjev[23], 'click', function() {
    tabelaInfo[23].open(map, tabelaMarkerjev[23]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[24], 'click', function() {
    tabelaInfo[24].open(map, tabelaMarkerjev[24]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[25], 'click', function() {
    tabelaInfo[25].open(map, tabelaMarkerjev[25]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[26], 'click', function() {
    tabelaInfo[26].open(map, tabelaMarkerjev[26]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[27], 'click', function() {
    tabelaInfo[27].open(map, tabelaMarkerjev[27]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[28], 'click', function() {
    tabelaInfo[28].open(map, tabelaMarkerjev[28]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[29], 'click', function() {
    tabelaInfo[29].open(map, tabelaMarkerjev[29]);
  });

  google.maps.event.addListener(tabelaMarkerjev[30], 'click', function() {
    tabelaInfo[30].open(map, tabelaMarkerjev[30]);
  });

  google.maps.event.addListener(tabelaMarkerjev[31], 'click', function() {
    tabelaInfo[31].open(map, tabelaMarkerjev[31]);
  });

  google.maps.event.addListener(tabelaMarkerjev[32], 'click', function() {
    tabelaInfo[32].open(map, tabelaMarkerjev[32]);
  });

  google.maps.event.addListener(tabelaMarkerjev[33], 'click', function() {
    tabelaInfo[33].open(map, tabelaMarkerjev[33]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[34], 'click', function() {
    tabelaInfo[34].open(map, tabelaMarkerjev[34]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[35], 'click', function() {
    tabelaInfo[35].open(map, tabelaMarkerjev[35]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[36], 'click', function() {
    tabelaInfo[36].open(map, tabelaMarkerjev[36]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[37], 'click', function() {
    tabelaInfo[37].open(map, tabelaMarkerjev[37]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[38], 'click', function() {
    tabelaInfo[38].open(map, tabelaMarkerjev[38]);
  });
  
  google.maps.event.addListener(tabelaMarkerjev[39], 'click', function() {
    tabelaInfo[39].open(map, tabelaMarkerjev[39]);
  });

   google.maps.event.addListener(tabelaMarkerjev[40], 'click', function() {
    tabelaInfo[40].open(map, tabelaMarkerjev[40]);
  });

  var request = {
    location: pyrmont,
    radius: '500000',
    name: 'ZD Zdravstveni zdravstveni Klinika klinika Bolnišnica bolnišnica Poliklinika poliklinika'
  };

  //infowindow = new google.maps.InfoWindow();
  
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

google.maps.event.addDomListener(window, 'load', initialize);
