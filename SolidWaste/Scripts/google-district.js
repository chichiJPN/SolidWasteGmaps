/// <reference path="arcgis-district.js" />
var map,
    markers = [],
    loading = $('#loading'),
    polygonOnMap = [],
    markers = [],
    districtID = $('#dataDiv').data('district_id'),
    drawingManager,
    polylines = [],
    tempArray = [],
    routes = [],
    lastToggled= {
        infowindow : null,
        marker : null,
        route : null
    };

    function displayCoordinates(pnt) {
        var lat = pnt.lat();
        lat = lat.toFixed(4);
        var lng = pnt.lng();
        lng = lng.toFixed(4);
    }

    function placeMarker(location, title, id) {
        if (title === undefined) { title = "No Title"; }

        var infoContent = helper.createEl('h3', null, { id: 'content' });
        infoContent.appendChild(helper.createEl('h3', 'firstHeading', { id: 'firstHeading' }, 'Lorry ' +title));
		
        var infowindow = new google.maps.InfoWindow({
            content: infoContent
        });

        var tempmarker = new google.maps.Marker({
            position: location,
            title: title,
            map: map,
        });

        tempmarker.set('id',id);

        tempmarker.addListener('click', function () {
            if (lastToggled.infowindow != null) {
                lastToggled.infowindow.close();
            }

            infowindow.open(map, tempmarker);

            lastToggled.infowindow = infowindow;
            lastToggled.marker = tempmarker;
        });
        markers.push(tempmarker);

    }
    
    function createInfoWindow(type,data) {
        var infowindow;

        switch (type) {
            case 'route':
                var infoContent = helper.createEl('div', null, { id: 'content' });
                infoContent.appendChild(helper.createEl('h3', 'firstHeading', { id: 'firstHeading' }, 'Route ' + data.routeName));
                infoContent.appendChild(helper.createEl('h5', null, null, 'Will be on ' + data.dayName));

                var infowindow = new google.maps.InfoWindow({
                    content: infoContent
                });
                infowindow.setPosition({ lat: parseFloat(data.lat), lng: parseFloat(data.lng)});
                break;
        }

        return infowindow;
    }

    function placeRoute(route) {

        var driverName = route.DriverFirstName == null ? 'None' : route.DriverFirstName + ' ' + route.DriverLastName,
            truckName = route.TruckName == null ? 'None' : route.TruckName;

        var data = {
            routeName: route.get('RouteName'),
            driverName: driverName,
            truckName: truckName,
            routeID: route.RouteID,
            driverID: route.DriverID,
            truckID: route.TruckID,
            lat: route.get('lat'),
            lng: route.get('lng'),
            dayID: route.DayID,
            dayName: route.DayName == null ? 'None' : route.DayName
        }
		
        var infowindow = createInfoWindow('route', data);


        route.setOptions({zIndex: 25});

        route.addListener('click', function () {

            if (lastToggled.route != null && lastToggled.route != route) {
                lastToggled.route.setOptions({ strokeColor: '#000000' });
                var foo = lastToggled.route;
                foo.addListener('mouseover', function () {
                    foo.setOptions({ strokeColor: '#00FF00' });
                });
                foo.addListener('mouseout', function () {
                    foo.setOptions({ strokeColor: '#000000' });
                });

                if (lastToggled.infowindow != null) {
                    lastToggled.infowindow.close();
                }
            }

            infowindow.open(map, route);

            lastToggled.infowindow = infowindow;
            lastToggled.route = route;
			
            route.setOptions({ strokeColor: '#FF0000' });

            google.maps.event.clearListeners(route, 'mouseover');
            google.maps.event.clearListeners(route, 'mouseout');
        });


        route.addListener('mouseover', function () {
            route.setOptions({ strokeColor: '#00FF00' });
        });
        route.addListener('mouseout', function () {
            route.setOptions({ strokeColor: '#000000' });
        });

        route.setMap(map);
    }

    function getDistrictBoundaries() {
        var request = new XMLHttpRequest();
        request.open("GET", "../Content/district.xml", false);
        request.send();
        var xml = request.responseXML;

        var places = xml.getElementsByTagName("Placemark");
        for (var i = 0; i < places.length; i++) {

            var place = places[i];
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
            switch (true) {
                case 'port louis':

                    break;
            }
        }
    }

    function setDistrictBoundaries(districtName, setAllDistrictsFlag) {
        var request = new XMLHttpRequest();
        request.open("GET", "../Content/district.xml", false);
        request.send();

        if (setAllDistrictsFlag == undefined) { setAllDistrictsFlag = false; }
        var xml = request.responseXML;

        var places = xml.getElementsByTagName("Placemark");
        for (var i = 0; i < places.length; i++) {

            var place = places[i],
                placeName = place.getElementsByTagName('name')[0].innerHTML;

            if (districtName == placeName || setAllDistrictsFlag) {
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
                    fillOpacity: 0
                });


                polygonOnMap.push(bermudaTriangle);

                google.maps.event.addListener(bermudaTriangle, 'click', function (event) {
                    displayCoordinates(event.latLng);
                });

                bermudaTriangle.setMap(map);
            }
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

    var refresh = {
        routelist: function (search) {
            var truckID, driverID, dayID;

            if (search == 'all') {
                truckID = 'All';
                driverID = 'All';
                dayID = 'All';
            } else {
                var truckslist = document.getElementById("truckslist"),
                    driverslist = document.getElementById("driverslist"),
                    daylist = document.getElementById('daylist');

                truckID = truckslist.options[truckslist.selectedIndex].value;
                driverID = driverslist.options[driverslist.selectedIndex].value;
                dayID = daylist.options[daylist.selectedIndex].value;
            }

            var data = {
                DistrictID: districtID,
                TruckID: null,
                DriverID: null,
                DayID: null
            };

            data.TruckID = truckID != 'All' ? truckID : -1;
            data.DriverID = driverID != 'All' ? driverID : -1;
            data.DayID = dayID != 'All' ? dayID : -1;

            var options = {
                url: '/ajax/GetRoutesByFilter',
                type: 'POST',
                data: data
            };

            $.ajax(options).done(function (data) {

                routes = [];

                var returned_routes = data;

                for (var x = 0, length = returned_routes.length ; x < length; x++) {

                    var points = returned_routes[x].RoutePoints.split(';'),
                        temproute = [];
                    for (var y = 0, length2 = points.length ; y < length2; y++) {
                        var coordinate = points[y].split(',');
                        temproute.push({ lat: parseFloat(coordinate[0]), lng: parseFloat(coordinate[1]) });
                    }
                    var routeObject = new google.maps.Polyline({
                        path: temproute,
                        strokeColor: 'black',
                        strokeWeight: 5
                    });
                    routeObject.set('lat', temproute[0].lat);
                    routeObject.set('lng', temproute[0].lng);
                    routeObject.set('RouteID', returned_routes[x].RouteID);
                    routeObject.set('RouteName', returned_routes[x].RouteName);
                    routeObject.set('DriverID', returned_routes[x].DriverID);
                    routeObject.set('DriverFirstName', returned_routes[x].DriverFirstName);
                    routeObject.set('DriverLastName', returned_routes[x].DriverLastName);
                    routeObject.set('TruckID', returned_routes[x].TruckID);
                    routeObject.set('TruckName', returned_routes[x].TruckName);
                    routeObject.set('DayID', returned_routes[x].dayid);
                    routeObject.set('DayName', returned_routes[x].Day);

                    placeRoute(routeObject);
                    routes.push(routeObject);
                }
            });
        }
    };


    function initAutocomplete() {
		
        var data = $('#dataDiv'),
            zoomed_x_coor = parseFloat(data.data('x_coor')),
            zoomed_y_coor = parseFloat(data.data('y_coor')),
            districtName = data.data('district_name');


        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: zoomed_x_coor, lng: zoomed_y_coor },
            zoom: 12,
            mapTypeId: 'roadmap',
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            streetViewControl: false
        });

        setDistrictBoundaries(districtName);

        var options = {
            url: '/ajax/GetDistrictData',
            type: 'POST',
            data: { districtID: districtID }
        };

        $.ajax(options).done(function (data) {
            var lorries = data.Lorries.Data;
            for (var x = 0, length = lorries.length ; x < length; x++) {
                placeMarker({ lat: parseFloat(lorries[x].x), lng: parseFloat(lorries[x].y) }, lorries[x].name, lorries[x].id);
            }
        });

        refresh.routelist('all');

        addSearch();
    }

    function updateLastToggled(action,data) {
        switch (action) {
            case 'removeRoute':
                if (lastToggled.infowindow != null) {
                    lastToggled.infowindow.close();
                    lastToggled.infowindow = null;
                }

                for (var x = 0 ; x < routes.length ; x++) {
                    if (routes[x] == lastToggled.route) {
                        routes[x].setMap(null);
                        routes.splice(x, 1);
                        lastToggled.route = null;
                        break;
                    }
                }
                break;
            case 'updateMarker':
                updateLastToggled('removeMarker');
                placeMarker(data.location,data.title,data.id);
                break;
            case 'removeMarker':

                if (lastToggled.infowindow != null) {
                    lastToggled.infowindow.close();
                    lastToggled.infowindow = null;
                }

                for (var x = 0 ; x < markers.length ; x++) {
                    if (markers[x] == lastToggled.marker) {
                        markers[x].setMap(null);
                        markers.splice(x, 1);
                        lastToggled.marker = null;
                        break;
                    }
                }
                break;
        }
    }

    var helper = {
        createEl : function(elementName,classes, dataAttrib, innerHTML, func) {
            var element = document.createElement(elementName);

            if(classes != undefined || classes != null) { element.className = classes; }
            if (innerHTML != undefined) { element.innerHTML = innerHTML; }

            if (dataAttrib != undefined || dataAttrib != null) {
                for (var x in dataAttrib) {
                    element.setAttribute( x , dataAttrib[x]);
                }
            }

            if (func != undefined && func != null) { element.onclick = func; }

            return element;
        },
		findRoute: function(RouteID) {
			for(var x = 0, length = routes.length ; x < length; x++) {
				// if(routes[x])
				
			}
			return null;
		}
    };
