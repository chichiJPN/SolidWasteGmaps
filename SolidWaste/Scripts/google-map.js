/// <reference path="arcgis-district.js" />
var map;
var markers = []; // for the search
    function displayCoordinates(pnt) {

        var lat = pnt.lat();
        lat = lat.toFixed(4);
        var lng = pnt.lng();
        lng = lng.toFixed(4);
        console.log("Latitude: " + lat + "  Longitude: " + lng);
    }

    function disableMovement(disable) {
        var mapOptions;
        if (disable) {
            mapOptions = {
                draggable: false,
                scrollwheel: false,
                disableDoubleClickZoom: true,
                zoomControl: false
            };
        } else {
            mapOptions = {
                draggable: true,
                scrollwheel: true,
                disableDoubleClickZoom: false,
                zoomControl: true
            };
        }
        map.setOptions(mapOptions);
    }
    
    function placeMarker(location, title, name, id) {
        if (title === undefined) { title = "No Title"; }

        var infoContent = '<div id="content">' +
            '<h1 id="firstHeading" class="firstHeading">'+title+'</h1>' +
            '<div id="bodyContent">' +
            '<a href="' + window.baseUrl + 'Member/District?name=' + name + '&id=' + id + '" target="_blank">Click here to know more about this place.</a>' +
            '</div>' +
            '</div>';
        var infowindow = new google.maps.InfoWindow({
            content: infoContent
        });

        var marker = new google.maps.Marker({
            position: location,
            title: title,
            map: map
        });

        marker.addListener('click', function () {
            infowindow.open(map, marker);
        });
    }

    function setMarkerOnMapClick() {
        google.maps.event.addListener(map, 'click', function (event) {
            placeMarker(event.latLng);
        });

    }


    function getDistrictLocations() {
        var locations = {
            'Pamplemousses': { lat: -20.0908, lng: 57.5684 },
            'Riviere du Rempart': { lat: -20.0663, lng: 57.6549 },
            'Flacq': { lat: -20.2326, lng: 57.7153 },
            'Moka': { lat: -20.2609, lng: 57.5876 },
            'Grand Port': { lat: -20.4026, lng: 57.6398 },
            'Savanne': { lat: -20.4592, lng: 57.5038 },
            'Black River': { lat: -20.3189, lng: 57.4104 },
            'Plaines Wilhems': { lat: -20.3292, lng: 57.5134 },
            'Port Louis': { lat: -20.1643, lng: 57.5217 }
        };

        return locations;
    }

    function setDistrictMarkers() {
        var locations = getDistrictLocations();

        for (var x in locations) {
            placeMarker(locations[x]);
        }
    }

    function setDistrictBoundaries() {
        var request = new XMLHttpRequest();
        request.open("GET", "../Content/district.xml", false);
        request.send();
        var xml = request.responseXML;
        console.log(xml);

        var places = xml.getElementsByTagName("Placemark");
        for (var i = 0; i < places.length; i++) {

            var place = places[i];
            console.log(place.getElementsByTagName('name')[0].innerHTML);
            var coordinatesText = place.getElementsByTagName('MultiGeometry')[0]
                               .getElementsByTagName('Polygon')[0]
                               .getElementsByTagName('outerBoundaryIs')[0]
                               .getElementsByTagName('LinearRing')[0]
                               .getElementsByTagName('coordinates')[0]
                                .innerHTML
                                .split('\n');

            var coordinates = [];
            for (var x = 0, length = coordinatesText.length ; x < length ; x++) {
                if (coordinatesText[x] != "") {
                    var temp = coordinatesText[x].split(',');
                    coordinates.push({ lat: parseFloat(temp[1]), lng: parseFloat(temp[0]) });
                }
            }

            var bermudaTriangle = new google.maps.Polygon({
                paths: coordinates,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillOpacity: 0.35
            });

            //google.maps.event.addListener(bermudaTriangle, 'click', function (event) {
            //    placeMarker(event.latLng);
            //});

            bermudaTriangle.setMap(map);
        }
    }

    function addSearch() {
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function () {
            searchBox.setBounds(map.getBounds());
        });

        searchBox.addListener('places_changed', function () {

            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // Clear out the old markers.
            markers.forEach(function (marker) {
                marker.setMap(null);
            });
            markers = [];

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function (place) {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                // Create a marker for each place.
                markers.push(new google.maps.Marker({
                    map: map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location
                }));
                console.log(place.geometry.location);
                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
        });
    }

    function initAutocomplete() {



        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: -20.2351, lng: 57.5945 },
            zoom: 10,
            mapTypeId: 'roadmap'
        });


        //setDistrictBoundaries();
        disableMovement(true);

        var options = {
            url: $('#dataDiv').data('district-url'),
            type: 'POST'
        };

        $.ajax(options).done(function (data) {
            console.log('data is');
            console.log(data);
            for (var x = 0, length = data.length ; x < length; x++) {
                placeMarker({ lat: data[x].x_coor, lng: data[x].y_coor }, data[x].name, data[x].name, data[x].id);
            }
        });


        //addSearch();


    }
