let map, infoWindow;
var start,end;
let markers=[];

function initMap() {
  var opts = {
    zoom: 15,
    center: new google.maps.LatLng(35.68944, 139.69167)
  };
  var map = new google.maps.Map(document.getElementById("map"), opts);
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  var restaurantTypes = document.getElementById("restaurantTypes");
  add_marker(map);

  infoWindow = new google.maps.InfoWindow();
  const locationButton = document.createElement("button");
  locationButton.textContent = "Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(locationButton);

  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          infoWindow.setPosition(pos);
          infoWindow.setContent("Current Location");
          infoWindow.open(map);
          map.setCenter(pos);
          start = pos;
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
    
  });

  const onChangeHandler = function () {
    displayFilter(markers);
  };
  document.getElementById("foodType").addEventListener("change", onChangeHandler);

  const routeButton = document.createElement("button");
  routeButton.textContent = "Display Route";
  routeButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(routeButton);
  directionsRenderer.setMap(map);
  routeButton.addEventListener("click", () => {
    calcRoute(directionsService, directionsRenderer);
  });
  

}

function add_marker(map){
  for (var i = 0; i < RESTAURANT_list.length; i++) {
    var item = RESTAURANT_list[i];
    var lat = item["location"]["latitude"]
    var lng = item["location"]["longitude"]
    var latlng = new google.maps.LatLng(lat,lng);
    var marker = new google.maps.Marker({
        position: latlng,
        map: map
    });
    var ins = '<div class="map-window">';
        ins += '</div>';
        ins += '<h1 id="firstHeading" class="firstHeading">'+item['displayName']["text"] + '</h1>';
        ins += '<div id="bodyContent">';
        ins += item["formattedAddress"]+'</div>';
        ins += '<div>PhoneNumber : '+item["nationalPhoneNumber"]+'</div>';
        ins += '<div>rating : '+item["rating"]+'</div>';
    var infoWindow = new google.maps.InfoWindow({
            content: ins
    });
    markers[i] = marker
    add_event_to_marker(marker,infoWindow,i);
  }
}

function add_event_to_marker(marker, infoWindow, index) {
    var item = RESTAURANT_list[index];
    var restaurantTypes = document.getElementById("restaurantTypes");
    var typesList = item['types'];
    var typesListStr = "";
    for (var j = 0; j < item['types'].length; j++){
        typesListStr += item['types'][j]
        typesListStr += "\n"
    }

    item['marker'] = marker;
    item['infoWindow'] = infoWindow;

 
    item['marker'].addListener('click', function(e) {
        infoWindows_hide();
        item['infoWindow'].open(map, item['marker']);
        restaurantTypes.innerHTML = "<span>"+typesListStr+"</span>";

        var lat = item["location"]["latitude"]
        var lng = item["location"]["longitude"]
        end = new google.maps.LatLng(lat,lng);
    });
}

function infoWindows_hide() {
    for (var i = 0; i < RESTAURANT_list .length; i++) {
        RESTAURANT_list[i]['infoWindow'].close();
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

function calcRoute(directionsService, directionsRenderer) {
  var request = {
    origin: start,
    destination: end,
    travelMode: 'DRIVING'
  };
  directionsService.route(request)
  .then((response) => {
    directionsRenderer.setDirections(response);
  })
  .catch((e) => window.alert("Click Current Location and Restaurant Pin"));
}

function displayFilter(markers){
  for (var i = 0; i < markers.length; i++){
    var types=RESTAURANT_list[i]["types"]
    console.log(types)
    if (types.includes(document.getElementById("foodType").value)){
      markers[i].setVisible(true);
    }else{
      markers[i].setVisible(false);
    };
  }
}