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
    
    function placeMarker(location, title, id) {
        if (title === undefined) { title = "No Title"; }

        var infoContent = helper.createEl('h3', null, { id: 'content' });
        infoContent.appendChild(helper.createEl('h3', 'firstHeading', { id: 'firstHeading' }, 'Lorry ' +title));
		var div = helper.createEl('div', 'popup');
        div.appendChild(helper.createEl('button', 'btn btn-secondary', null, 'Update', function () { btnfuncs.updateLorryForm(id,title); }));
        div.appendChild(helper.createEl('button', 'btn btn-secondary', null, 'Delete', function () { btnfuncs.deleteLorryForm(id); }));

		infoContent.appendChild(div);
		
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
                infoContent.appendChild(helper.createEl('h5', null, null, 'Assigned Driver: ' + data.driverName));
                infoContent.appendChild(helper.createEl('h5', null, null, 'Assigned Truck: ' + data.truckName));
                infoContent.appendChild(helper.createEl('h5', null, null, 'Assigned Day: ' + data.dayName));
				
				var div = helper.createEl('div','popup');
				
                div.appendChild(helper.createEl('button', 'btn btn-secondary', { 'data-dayid':data.dayID, 'data-routeID': data.routeID, 'data-driverID': data.driverID, 'data-truckID': data.truckID }, 'Edit Assigned', function () {
                    var AssignedDriverID = $(this).data('driverid');
                    var AssignedTruckID = $(this).data('truckid');
                    var RouteID = $(this).data('routeid');
                    var DayID = $(this).data('dayid');
					
                    console.log('Route ID is ' + DayID);
                    btnfuncs.updateRouteForm(AssignedDriverID, AssignedTruckID, RouteID, DayID);
                }));
                div.appendChild(helper.createEl('button', 'btn btn-secondary', { 'data-routeID': data.routeID, 'data-driverID': data.driverID, 'data-truckID': data.truckID }, 'Delete Route', function () {
                    var RouteID = $(this).data('routeid');
                    btnfuncs.deleteRouteForm(RouteID);
                }));
				
				infoContent.appendChild(div);

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
                //console.log('setting last toggled');
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
    
	function setMarkerOnMapClick(flag) {
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

    function setDistrictMarkers(locations) {
        for (var x in locations) {
            placeMarker(locations[x]);
        }
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

            //console.log(placeName);

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
                //google.maps.event.addListener(bermudaTriangle, 'click', function (event) {
                //    placeMarker(event.latLng);
                //});

                bermudaTriangle.setMap(map);
            }
        }
    }

    function enableDrawing() {
        var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.MARKER,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: ['marker', 'circle', 'polygon', 'polyline', 'rectangle']
            },
            markerOptions: { icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png' },
            circleOptions: {
                fillColor: '#ffff00',
                fillOpacity: 1,
                strokeWeight: 5,
                clickable: false,
                editable: true, 
                zIndex: 1
            }
        });
        google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
            // assuming you want the points in a div with id="info"
            document.getElementById('info').innerHTML += "polygon points:" + "<br>";
            for (var i = 0; i < polygon.getPath().getLength() ; i++) {
                document.getElementById('info').innerHTML += polygon.getPath().getAt(i).toUrlValue(6) + "<br>";
            }
        });

        drawingManager.setMap(map);
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
                console.log(data);
                var routeslist = document.getElementById('routeslist');
                //<input type="checkbox" name="vehicle" value="Car">I have a car 
                routeslist.innerHTML = '';

                if (lastToggled.infowindow != null) {
                    lastToggled.infowindow.close();
                    lastToggled.infowindow = null;
                }


                for (var x = 0, length = routes.length ; x < length; x++) {
                    routes[x].setMap(null);
                }

                routes = [];

                for (var x = 0, length = data.length ; x < length ; x++) {
                    var label = helper.createEl('label', null);
                    label.appendChild(helper.createEl('input', null, { type: 'checkbox', value: data[x].RouteID, checked: 'checked' }, null, function () {
                        var route,
                            routeID = $(this).val();

                        for (var x = 0, length = routes.length ; x < length; x++) {
                            if (routes[x].RouteID == routeID) {
                                route = routes[x];
                                break;
                            }
                        }


                        if (this.checked == false) {
                            route.setMap(null);
                        } else if (this.checked == true) {
                            route.setMap(map);
                        }
                    }));
                    label.appendChild(document.createTextNode(data[x].RouteName));

                    routeslist.appendChild(label);
                }

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
        },
        trucklist: function () {
            var sidebar_loading = helper.createEl('div', 'loading-gif margin-auto');

            var options = {
                url: '/ajax/GetTrucks',
                type: 'POST',
                data: { districtID: districtID }
            };

            $.ajax(options).done(function (data) {
                var truckslist = document.getElementById('truckslist');
                truckslist.innerHTML = '';

                truckslist.appendChild(helper.createEl('option', null, { value: 'All', selected: 'selected' }, 'All Trucks'));

                for (var x = 0, length = data.length ; x < length ; x++) {
                    truckslist.appendChild(helper.createEl('option', null, { value: data[x].id }, data[x].name));
                }
            });

        },
        driverlist: function () {
            var options = {
                url: '/ajax/GetDrivers',
                type: 'POST'
            };

            $.ajax(options).done(function (data) {
                var driverslist = document.getElementById('driverslist');
                driverslist.innerHTML = '';

                driverslist.appendChild(helper.createEl('option', null, { value: 'All', selected: 'selected' }, 'All Drivers'));

                for (var x = 0, length = data.length ; x < length ; x++) {
                    driverslist.appendChild(helper.createEl('option', null, { value: data[x].id }, data[x].firstName + ' ' + data[x].lastName));
                }

            });
        },
        daylist: function () {
            var options = {
                url: '/ajax/GetDays',
                type: 'POST'
            };

            $.ajax(options).done(function (data) {
                var daylist = document.getElementById('daylist');
                daylist.innerHTML = '';

                daylist.appendChild(helper.createEl('option', null, { value: 'All', selected: 'selected' }, 'All Days'));

                for (var x = 0, length = data.length ; x < length ; x++) {
                    daylist.appendChild(helper.createEl('option', null, { value: data[x].id }, data[x].name ));
                }
                console.log(data);
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


        // display coordinates on mouse move
        //google.maps.event.addListener(map, 'mousemove', function (event) {
        //    displayCoordinates(event.latLng);
        //});

        //disableMovement(true);
        console.log('district name is ' + districtName);

        setDistrictBoundaries(districtName);
        
        //drawPolygon();
        //setDistrictMarkers();

        //getDistrictBoundaries();
        enableAddRoute();

        //var options2 = {
        //    url: '/ajax/GetTest',
        //    type: 'POST',
        //    data: { DistrictID: districtID }
        //};  
            
        //$.ajax(options2).done(function (data) {
        //    console.log(data);
        //});

        var options = {
            url: '/ajax/GetDistrictData',
            type: 'POST',
            data: { districtID: districtID }
        };

        $.ajax(options).done(function (data) {
            //console.log(data);
            var lorries = data.Lorries.Data;
            for (var x = 0, length = lorries.length ; x < length; x++) {
                placeMarker({ lat: parseFloat(lorries[x].x), lng: parseFloat(lorries[x].y) }, lorries[x].name, lorries[x].id);
            }


            //console.log(routes);
        });


        refresh.driverlist();
        refresh.trucklist();
        refresh.daylist();

        refresh.routelist('all');
        //enableDrawing();
        //setMarkerOnMapClick();


        //var options = {
        //    url: $('#dataDiv').data('district-url'),
        //    type: 'POST'
        //};

        //$.ajax(options).done(function (data) {
        //    console.log('data is');
        //    console.log(data);
        //    for (var x = 0, length = data.length ; x < length; x++) {
        //        placeMarker({ lat: data[x].x_coor, lng: data[x].y_coor }, data[x].name, data[x].name, data[x].id);
        //    }
        //});

        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        addSearch();
        modal.init();
        infobox.setElement('infoDiv');
        document.getElementById('btn-manageDrivers').onclick = btnfuncs.manageDrivers;
        document.getElementById('btn-manageTrucks').onclick = btnfuncs.manageTrucks;
        document.getElementById('btn-addRouteStart').onclick = btnfuncs.addRouteBtnClicked;
        document.getElementById('btn-addLorry').onclick = btnfuncs.addLorryForm;
        document.getElementById('btn-routesearchbyfilter').onclick = refresh.routelist;

        
    }

    function enableAddRoute() {

        var apiKey = 'AIzaSyCUezPkykFJdiK29b6vLeGvGEyXGOuR_E8';
        var snappedCoordinates = [];
        var placeIdArray = [];
        tempArray = [];

        drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: false,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                  google.maps.drawing.OverlayType.POLYLINE
                ]
            },
            polylineOptions: {
                strokeColor: '#696969',
                strokeWeight: 2
            }
        });

        drawingManager.setMap(map);

        // Snap-to-road when the polyline is completed.
        drawingManager.addListener('polylinecomplete', function (poly) {
            var path = poly.getPath();

            placeIdArray = [];
            poly.setMap(null);
            runSnapToRoad(path);
        });


        // Snap a user-created polyline to roads and draw the snapped path
        function runSnapToRoad(path) {
            var pathValues = [];
            for (var i = 0; i < path.getLength() ; i++) {
                pathValues.push(path.getAt(i).toUrlValue());
            }

            $.get('https://roads.googleapis.com/v1/snapToRoads', {
                interpolate: true,
                key: apiKey,
                path: pathValues.join('|')
            }, function (data) {
                processSnapToRoadResponse(data);
                drawSnappedPolyline();

                drawingManager.setDrawingMode(null);
                var sidebar = helper.createEl('div','sidebar width-auto');
                var div = helper.createEl('div', 'sidebar-list');
                // console.log(tempArray.join(';'));
                //<div class="sidebar-list">
                //    <ul>
                //        <li id="btn-addLorry">Add Lorry</li>
                //        <li id="btn-addRouteStart">Add Route</li>
                //        <li id="btn-manageDrivers">Manage Drivers</li>
                //        <li id="btn-manageTrucks">Manage Trucks</li>
                //    </ul>
                var ul = helper.createEl('ul');

                var liSave = helper.createEl('li', null, null, 'Save route', function () { btnfuncs.addRoute(districtID, tempArray.join(';'), $('#routeName').val()); });
                var liRedraw = helper.createEl('li', null, null, 'Redraw route', function () { btnfuncs.redrawRoute(); });
                var liCancel = helper.createEl('li', null, null, 'Cancel', function () { btnfuncs.cancelDrawRoute(); });
                ul.appendChild(liSave);
                ul.appendChild(liRedraw);
                ul.appendChild(liCancel);
                div.appendChild(ul);
                sidebar.appendChild(div);
                infobox.setData(sidebar);
                //getAndDrawSpeedLimits();
            });
        }

        // Store snapped polyline returned by the snap-to-road service.
        function processSnapToRoadResponse(data) {
            snappedCoordinates = [];
            placeIdArray = [];
            temparray = [];
            for (var i = 0; i < data.snappedPoints.length; i++) {
                var latlng = new google.maps.LatLng(
                    data.snappedPoints[i].location.latitude,
                    data.snappedPoints[i].location.longitude);
                snappedCoordinates.push(latlng);
                tempArray.push([data.snappedPoints[i].location.latitude.toFixed(4), data.snappedPoints[i].location.longitude.toFixed(4)]);
                placeIdArray.push(data.snappedPoints[i].placeId);
            }
        }

        // Draws the snapped polyline (after processing snap-to-road response).
        function drawSnappedPolyline() {
            var snappedPolyline = new google.maps.Polyline({
                path: snappedCoordinates,
                strokeColor: 'black',
                strokeWeight: 5
            });

            snappedPolyline.setMap(map);
            polylines.push(snappedPolyline);
        }
    }

    $(document).ready(function() {
        $('#btn-saveChanges-driver').click(function () {
            var firstName = $('#driverFirstName').val(),
                lastName = $('#driverLastName').val();

            var options = {
                url: '/ajax/addDriver',
                type: 'POST',
                data: {
                    firstName: firstName,
                    lastName: lastName
                }
            };

            loading.fadeIn();
            $.ajax(options).done(function (data) {
                console.log('driver id is ' + data.id);
                $('#addDriverModal').modal('hide');
                refresh.driverlist();
                btnfuncs.manageDrivers();

            });
            

        });

        $('#btn-saveChanges-truck').click(function () {
            var truckName = $('#truckName').val();

            var options = {
                url: '/ajax/addDriver',
                type: 'POST',
                data: {
                    name: truckName
                }
            };

            loading.fadeIn();
            $.ajax(options).done(function (data) {
                console.log('driver id is ' + data.id);
                $('#addTruckModal').modal('hide');
                refresh.trucklist();
                btnfuncs.manageTrucks();
            });


        });
        $('#btn-update-truck').click(function () {
            btnfuncs.updateTruck($(this).data('truckid'));
        });

        $('#btn-update-driver').click(function () {
            btnfuncs.updateDriver($(this).data('driverid'));
        });

        $('#btn-delete-truck').click(function () {
            btnfuncs.deleteTruck($(this).data('truckid'));
        });

        $('#btn-delete-driver').click(function () {
            btnfuncs.deleteDriver($(this).data('driverid'));
        });

    });



    var btnfuncs = {
        manageDrivers: function () {
            console.log('manage drivers ');
            var options = {
                url: '/ajax/getDrivers',
                type: 'POST'
            };

            loading.fadeIn();
            $.ajax(options).done(function (data) {
                console.log('data is');
                console.log(data);
                var table = helper.createEl('table', 'table'),
                    thead = helper.createEl('thead'),
                    tbody = helper.createEl('tbody');

                thead.appendChild(helper.createEl('th', null, null, 'Driver ID'));
                thead.appendChild(helper.createEl('th', null, null, 'First Name'));
                thead.appendChild(helper.createEl('th', null, null, 'Last Name'));

                function addDriverButton() {
                    modal.hide();

                    $('#addDriverModal').modal('show');
                    console.log('add button was clicked');
                }


                for (var x = 0, length = data.length; x < length; x++) {
                    var temp = data[x],
                    attribs = {
                        'data-id': temp.id,
                        'data-firstname': temp.firstName,
                        'data-lastname': temp.lastName
                    }
                    var tr = helper.createEl('tr', null, attribs, null);

                    tr.appendChild(helper.createEl('td', null, null, '' + temp.id));
                    tr.appendChild(helper.createEl('td', null, null, '' + temp.firstName));
                    tr.appendChild(helper.createEl('td', null, null, '' + temp.lastName));
                    tr.appendChild(helper.createEl('td', 'cursor-pointer', { 'data-id': temp.id, 'data-firstname': temp.firstName, 'data-lastname': temp.lastName }, 'Edit', function () { btnfuncs.updateDriverForm($(this).data('id'), $(this).data('firstname'), $(this).data('lastname')); }));
                    tr.appendChild(helper.createEl('td', 'btn-delete cursor-pointer', {'data-driverid': temp.id}, 'Delete', function () { btnfuncs.deleteDriverForm($(this).data('driverid')); }));

                    tbody.appendChild(tr);
                }


                table.appendChild(thead);
                table.appendChild(tbody);
                modal.setTitle('<h3>Manage Drivers<h3>');
                modal.setBody(table);
                modal.setFooter(helper.createEl('button', 'btn btn-secondary', { type: 'button' }, 'Add new driver', function () { addDriverButton(); }));

                loading.fadeOut();
                modal.show();

            });
        },
        updateDriverForm: function (driverID, firstName, lastName) {
            $('#btn-update-driver').data('driverid', driverID);
            $('#updateDriverFirstName').val(firstName);
            $('#updateDriverLastName').val(lastName);
            $('#updateDriverModal').modal('show');
        },
        updateDriver: function (driverID) {
            console.log('Driver ID is ' + driverID);
            var firstName = $('#updateDriverFirstName').val(),
                lastName = $('#updateDriverLastName').val();

            var options = {
                url: '/ajax/UpdateDriver',
                type: 'POST',
                data: {
                    driverID: driverID,
                    firstName: firstName,
                    lastName: lastName
                }
            };

            console.log('passing to updateDriver');
            console.log(options);


            loading.fadeIn();
            $.ajax(options).done(function (data) {

                infobox.setData(helper.createEl('p', null, null, 'Driver details have been updated'));
                refresh.driverlist();
                loading.fadeOut();
                modal.hide();
            });
        },
        deleteDriverForm: function (driverID) {
            console.log('passing '+ driverID);
            $('#btn-delete-driver').data('driverid', driverID);
            $('#deleteDriverModal').modal('show');
        },
        deleteDriver: function (driverID) {

            console.log('id is ' + driverID);

            var options = {
                url: '/ajax/DeleteDriver',
                type: 'POST',
                data: { DriverID: driverID }
            };
            loading.fadeIn();

            $.ajax(options).done(function (data) {
                refresh.driverlist();
                btnfuncs.manageDrivers();
                $('#deleteDriverModal').modal('hide');
                loading.fadeOut();
            });
        },
        manageTrucks: function () {
            var options = {
                url: '/ajax/getTrucks',
                type: 'POST'
            };

            loading.fadeIn();
            $.ajax(options).done(function (data) {
                console.log('data is');
                console.log(data);
                var table = helper.createEl('table', 'table'),
                    thead = helper.createEl('thead'),
                    tbody = helper.createEl('tbody');

                thead.appendChild(helper.createEl('th', null, null, 'Truck ID'));
                thead.appendChild(helper.createEl('th', null, null, 'Truck Name'));

                for (var x = 0, length = data.length; x < length; x++) {
                    var temp = data[x],
                    attribs = {
                        'data-id': temp.id,
                        'data-name': temp.name
                    }
                    var tr = helper.createEl('tr', null, attribs,null);
                    console.log(temp.id);
                    console.log(temp.name);
                    tr.appendChild(helper.createEl('td', null, null, ''+temp.id));
                    tr.appendChild(helper.createEl('td', null, null, '' + temp.name));
                    tr.appendChild(helper.createEl('td', 'cursor-pointer', { 'data-name': temp.name, 'data-id': temp.id }, 'Edit', function () { btnfuncs.updateTruckForm($(this).data('id'), $(this).data('name')); }));
                    tr.appendChild(helper.createEl('td', 'btn-delete cursor-pointer', { 'data-name': temp.name, 'data-truckid': temp.id }, 'Delete', function () { btnfuncs.deleteTruckForm($(this).data('truckid')); }));

                    tbody.appendChild(tr);
                }

                table.appendChild(thead);
                table.appendChild(tbody);
                modal.setTitle('<h3>Manage Trucks<h3>');
                modal.setBody(table);
                modal.setFooter(helper.createEl('button', 'btn btn-secondary', {type:'button'}, 'Add new truck', function () { addButton(); }));
                loading.fadeOut();
                modal.show();

            });            

        },
        deleteTruckForm: function (truckID) {
            $('#btn-delete-truck').data('truckid', truckID);
            $('#deleteTruckModal').modal('show');
        },
        deleteTruck: function (truckID) {
            console.log('passing truck ID ' + truckID);
            var options = {
                url: '/ajax/DeleteTruck',
                type: 'POST',
                data: { TruckID: truckID}
            };
            loading.fadeIn();

            $.ajax(options).done(function (data) {
                btnfuncs.manageTrucks();
                refresh.trucklist();
                $('#deleteTruckModal').modal('hide');

                loading.fadeOut();
            });
        },

        updateTruckForm: function (truckID, currentName) {
            $('#btn-update-truck').data('truckid', truckID);
            $('#updateTruckName').val(currentName);
            $('#updateTruckModal').modal('show');
        },
        updateTruck: function (truckID) {
            console.log('Truck ID is ' + truckID);
            var newName = $('#updateTruckName').val();

            var options = {
                url: '/ajax/UpdateTruck',
                type: 'POST',
                data: {
                    truckID: truckID,
                    name: newName
                }
            };

            console.log('passing to updateTruck');
            console.log(options);


            loading.fadeIn();
            $.ajax(options).done(function (data) {

                infobox.setData(helper.createEl('p', null, null, 'Truck has been updated'));
                refresh.trucklist();
                loading.fadeOut();
                modal.hide();
            });
        },
        drawRouteStart: function () {
            modal.hide();
            infobox.setData(helper.createEl('p', null, null, 'Create a route by drawing on map. Double click when you are finished drawing.'));
            for (var x = 0, length = polylines.length ; x < length; x++) {
                polylines[x].setMap(null);
            }
            polylines = [];

            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
            console.log('im in here');
        },
        addRouteBtnClicked: function () {
            modal.setTitle(helper.createEl('h3',null,null,'Add a route'));
            modal.setBody(helper.createEl('input', 'form-control', { type:'text',id: 'routeName', placeholder: 'Add Route Name' }));
            modal.setFooter(helper.createEl('button', 'btn btn-secondary', null, 'Add route', function () { btnfuncs.drawRouteStart(); }));
            modal.show();
        },
        redrawRoute: function () {
            for (var x = 0, length = polylines.length ; x < length; x++) {
                polylines[x].setMap(null);
            }
            polylines = [];

            infobox.setData(helper.createEl('p', null, null, 'Create a route by drawing on map. Double click when you are finished drawing.'));
            drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
        },
        cancelDrawRoute: function () {
            for (var x = 0, length = polylines.length ; x < length; x++) {
                polylines[x].setMap(null);
            }
            polylines = [];

            infobox.setData(helper.createEl('p', null, null, 'Please choose an option or explore the map'));
            drawingManager.setDrawingMode(null);
        },
        addRoute: function (districtID, points, name) {
            // console.log('adding points');
            // console.log(points);
            var options = {
                url: '/ajax/AddRoute',
                type: 'POST',
                data: {
                    districtID: districtID,
                    points: points,
                    name: name
                }
            };

            loading.fadeIn();
            $.ajax(options).done(function (data) {
                console.log('data is');
                console.log(data);
                infobox.setData(helper.createEl('p', null, null, 'Route has been saved. You can click on the route to assign a designated person.'));
                polylines[polylines.length - 1].setMap(null);

                refresh.routelist();
                loading.fadeOut();
            });
        },
        updateRouteForm: function (assignedDriverID, assignedTruckID, RouteID) {
            console.log('RouteID is');
            console.log(RouteID);
			var options = {
				url: '/ajax/GetDriversAndTrucksAndDays',
				type: 'POST',
				data: {
				}
			};

			loading.fadeIn();
			$.ajax(options).done(function (data) {
			    loading.fadeOut();
                console.log(data);
				
				var div = helper.createEl('div'),
					drivers = data.Drivers.Data,
					trucks = data.Trucks.Data,
					days = data.Days.Data
					driverselect = helper.createEl('select', 'form-control', { id: 'routedriver-select' }),
					truckselect = helper.createEl('select', 'form-control', { id: 'routetruck-select' }),
					dayselect = helper.createEl('select', 'form-control', { id: 'routeday-select' }),
					driverFlag = false,
					truckFlag =false,
					dayFlag = false,
					emptyobject = null;
				
				
				for (var x = 0, length = drivers.length; x < length; x++) {
					var object = { 'value': drivers[x].id };
					
					if(drivers[x].id == assignedDriverID) { driverFlag = true; object.selected = 'selected'; }
					
					var option = helper.createEl('option', null, object, drivers[x].firstName + ' ' + drivers[x].lastName);
					driverselect.appendChild(option);
				}
				
				emptyobject = { 'value': null };
				if(driverFlag == false) { emptyobject.selected = 'selected'; }
				driverselect.insertBefore(helper.createEl('option', null, emptyobject, 'None'), driverselect.childNodes[0]);
				

				for (var x = 0, length = trucks.length; x < length; x++) {
					var object = { 'value': trucks[x].id };
					
					if(trucks[x].id == assignedTruckID) { truckFlag = true; object.selected = 'selected'; }
					
					var option = helper.createEl('option', null, object , trucks[x].name);
					truckselect.appendChild(option);
				}

				emptyobject = { 'value': null };
				if(truckFlag == false) { emptyobject.selected = 'selected'; }
				truckselect.insertBefore(helper.createEl('option', null, emptyobject, 'None'), truckselect.childNodes[0]);

				for (var x = 0, length = days.length; x < length; x++) {
					var object = { 'value': days[x].id };
					
					if(days[x].id == assignedTruckID) { dayFlag = true; object.selected = 'selected'; }
					
					var option = helper.createEl('option', null, object , days[x].name);
					dayselect.appendChild(option);
				}

				emptyobject = { 'value': null };
				if(dayFlag == false) { emptyobject.selected = 'selected'; }
				dayselect.insertBefore(helper.createEl('option', null, emptyobject, 'None'), dayselect.childNodes[0]);

				
				div.appendChild(helper.createEl('p', null, null, 'Assigned Driver'));
				div.appendChild(driverselect);
				div.appendChild(helper.createEl('p', null, null, 'Assigned Truck'));
				div.appendChild(truckselect);
				div.appendChild(helper.createEl('p', null, null, 'Assigned Day'));
				div.appendChild(dayselect);
				
				modal.setTitle('<h3>Update Route:</h3>');
				modal.setBody(div);
				modal.setFooter(helper.createEl('button', 'btn btn-secondary', {'data-routeid' : RouteID}, 'Update Route', function () { btnfuncs.updateRoute($(this).data('routeid')); }));
				modal.show();
				console.log(data);
			});
			

        },
        updateRoute: function (routeID) {
            var truckID = $('#routetruck-select').val(),
				truckName = $('#routetruck-select option:selected').text(),
                driverID = $('#routedriver-select').val(),
                driverName = $('#routedriver-select option:selected').text(),
                dayID = $('#routeday-select').val(),
                dayName = $('#routeday-select option:selected').text();

			console.log(driverName);
			console.log(truckName);
			console.log('day id is '+dayID);

            var options = {
                url: '/ajax/updateRoute',
                type: 'POST',
                data: {
                    routeID: parseInt(routeID),
                    truckID: truckID == 'null' ? -1 : parseInt(truckID),
                    driverID: driverID == 'null' ? -1 : parseInt(driverID),
                    dayID: dayID == 'null' ? -1 : parseInt(dayID),
                }
            };
			
            console.log(options);

            loading.fadeIn();
            $.ajax(options).done(function (data) {
                refresh.routelist();
				loading.fadeOut();
				modal.hide();
            });

        },
        addLorryForm: function () {
            modal.setTitle(helper.createEl('h3', null, null, 'Add a lorry'));
            modal.setBody(helper.createEl('input','form-control',{id:'lorryName',placeholder:'Lorry Name here'}));
            modal.setFooter(helper.createEl('button', 'btn btn-secondary', null, 'Add Lorry', function () { btnfuncs.enableAddLorryonDistrictClick(); }));
            modal.show();
        },
        enableAddLorryonDistrictClick: function (flag) {

            modal.hide();
            if (polygonOnMap.length > 0) {
                infobox.setData(helper.createEl('p',null,null,'Please click on the shaded district to add the lorry.'));
                google.maps.event.addListener(polygonOnMap[0], 'click', function (event) {
                    console.log(event);
                    var newLorryName = $('#lorryName').val();
                    var options = {
                        url: '/ajax/addLorry',
                        type: 'POST',
                        data: {
                            districtID: districtID,
                            x: event.latLng.lat().toFixed(4),
                            y: event.latLng.lng().toFixed(4),
                            name: newLorryName
                        }
                    };


                    google.maps.event.clearListeners(polygonOnMap[0], 'click');

                    loading.fadeIn();
                    $.ajax(options).done(function (data) {
                        console.log('lorry id is ' + data.id);
                        infobox.setData(helper.createEl('p', null, null, 'Lorry "' + newLorryName + '" has been added'));
                        placeMarker(event.latLng, newLorryName, data.id);
                        loading.fadeOut();

                    });

                });
            }
        },
        deleteRouteForm: function (RouteID) {
            modal.setTitle(helper.createEl('h3', null, null, 'Delete a route'));
            modal.setBody(helper.createEl('p', null, null, 'Are you sure you want to delete this route?'));
            modal.setFooter(helper.createEl('button', 'btn btn-secondary', null, 'Delete Route', function () { btnfuncs.deleteRoute(RouteID); }));
            modal.show();
        },
        deleteRoute: function(RouteID) {
            var options = {
                url: '/ajax/DeleteRoute',
                type: 'POST',
                data: {
                    RouteID: RouteID
                }
            };

            loading.fadeIn();
            $.ajax(options).done(function (data) {
                infobox.setData(helper.createEl('p', null, null, "Route has been deleted."));

                updateLastToggled('removeRoute');
                loading.fadeOut();
                modal.hide();
                refresh.routelist();
            });
        },
        updateLorryForm: function (lorryID, name) {
            console.log('lorry id is ' + lorryID + ' ' + name);
            modal.setTitle(helper.createEl('h3', null, null, 'Update Lorry'));
            modal.setBody(helper.createEl('input', 'form-control', { value: name ,id: 'lorryName', placeholder: 'Lorry Name here' }));
            modal.setFooter(helper.createEl('button', 'btn btn-secondary', null, 'Update Lorry', function () {
                console.log("name is " + $('#lorryName').val());
                btnfuncs.updateLorry(lorryID, $('#lorryName').val());
            }));
            modal.show();
        },
        updateLorry: function (lorryID, name) {
            console.log('lorry id is ' + lorryID);
            console.log('name is  ' + name);
            var options = {
                url: '/ajax/UpdateLorryName',
                type: 'POST',
                data: {
                    lorryID : lorryID,
                    name: name
                }
            };

            loading.fadeIn();
            $.ajax(options).done(function (data) {
                infobox.setData(helper.createEl('p', null, null, 'Lorry has been renamed to "' + name));
                var markerData = {
                    location: lastToggled.marker.position,
                    title: name,
                    id: lorryID
                };

                updateLastToggled('updateMarker',markerData);
                loading.fadeOut();
                modal.hide();
            });
        },
        deleteLorryForm: function (lorryID) {
            console.log('lorry id is ' + lorryID);
			modal.setTitle('');
            modal.setBody(helper.createEl('p', null, null, 'Are you sure you want to delete this lorry?'));
            modal.setFooter(helper.createEl('button', 'btn btn-secondary', { 'data-lorryid': lorryID }, 'Delete Lorry', function () { btnfuncs.deleteLorry( $(this).data('lorryid')); }))
            modal.show();
        },
        deleteLorry: function (lorryID) {
            var options = {
                url: '/ajax/DeleteLorry',
                type: 'POST',
                data: {
                    lorryID: lorryID,
                }
            };


            loading.fadeIn();
            $.ajax(options).done(function (data) {

                infobox.setData(helper.createEl('p', null, null, 'Lorry has been deleted'));
                loading.fadeOut();
                updateLastToggled('removeMarker');

                modal.hide();
            });
        }
    
	};
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

    var infobox = {
        getElement: function () { return this.infobox; },
        setElement: function (elName) { this.infobox = $('#' + elName) },
        setData: function (element) {
            this.infobox.html(element);
            var foo = this.infobox;
            foo.addClass('highlighted');

            setTimeout(function () {
                    foo.removeClass('highlighted');
            }, 2000);
            
            

            //setTimeout(function () {
            //    infobox.getElement().animate({
            //        "borderBottomColor": "#fff",
            //        "borderLeftColor": "#fff",
            //        "borderRightColor": "#fff",
            //        "borderTopColor": "#fff"
            //    });
            //}, 2000);

        },
        highlight: function () {



        },
        clear: function () {
            this.infobox.html('');
        }
    };

    var modal = {
        init: function () {
            this.modal = $('#theModal');
        },
        setTitle: function (title) {
            $('#modalHeader').html(title);
        },
        setBody: function (element) {

            $('#modalBody').html(element);
        },
        setFooter: function (title) {
            $('#modalFooter').html(title);
            var btnClose = helper.createEl('button','btn btn-secondary',{type:'button', 'data-dismiss':'modal'},'Close');
            $('#modalFooter').append(btnClose);
        },
        show: function () {
            this.modal.modal('show');
        },
        hide: function () {
            this.modal.modal('hide');
        },
    };
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
