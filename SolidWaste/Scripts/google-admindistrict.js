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
    },
    searchMarkers = [],
    municipalityMarkers = [],
    userMarkers = [],
	tempUserMarkers = [];

    function displayCoordinates(pnt) {

        var lat = pnt.lat();
        lat = lat.toFixed(4);
        var lng = pnt.lng();
        lng = lng.toFixed(4);
        console.log('lat: ' + lat + ' , lng: ' + lng );
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
            if (lastToggled.infowindow != null) {
                lastToggled.infowindow.close();
            }
            infowindow.open(map, tempmarker);
            lastToggled.infowindow = infowindow;
            lastToggled.marker = tempmarker;
        });
        markers.push(tempmarker);

    }
    
    function placeUserMarker(location, firstName, lastName, Address, id, routeid, status) {

        var infoContent = helper.createEl('div', null, { id: 'content' });
        infoContent.appendChild(helper.createEl('h3', 'firstHeading', { id: 'firstHeading' }, firstName + ' ' + lastName));
        infoContent.appendChild(helper.createEl('h5', 'firstHeading', { id: 'firstHeading' }, Address));
        var div = helper.createEl('div', 'popup');
		if(status == 'For Verification' && status != 'Verified') {
			div.appendChild(helper.createEl('button', 'btn btn-secondary', null, 'Verify', function () {  btnfuncs.verifyUser(this, id); }));
		}
		if(routeid != null) {
			div.appendChild(helper.createEl('button', 'btn btn-secondary', {'data-routeid':routeid}, 'Remove Assigned Route', function () {  btnfuncs.unassignUser(this, id); }));
		}
		
        infoContent.appendChild(div);

        var infowindow = new google.maps.InfoWindow({
            content: infoContent
        });

        var tempmarker = new google.maps.Marker({
            position: location,
            title: firstName + ' ' + lastName,
			// label:'A',	
            map: map,
        });

		var lightblueMarker = 'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';
		var greenMarker = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
		var pinkMarker = 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png';
		
		if(routeid != null) { // User Account is assigned a route
			tempmarker.set('icon', lightblueMarker);
		} else if (status == 'For Verification' && status != 'Verified') { // user account is not verified
			tempmarker.set('icon', greenMarker);
		} else { // user is verified but not assigned to a route
			tempmarker.set('icon', pinkMarker);
		}

        tempmarker.set('id', id);
		tempmarker.set('routeid',routeid);
		tempmarker['infowindow'] = infowindow;
		
        tempmarker.addListener('click', function () {
            if (lastToggled.infowindow != null) {
                lastToggled.infowindow.close();
            }
            this['infowindow'].open(map, tempmarker);
			
			
            lastToggled.infowindow = this['infowindow'];
            lastToggled.marker = tempmarker;
        });
        // console.log(tempmarker);
        userMarkers.push(tempmarker);
    }

    function placeMunicipalityMarker(title, id, location, boundary, Address, contactNumber, imageName, numLorries) {
        if (title === undefined) { title = "No Title"; }

        var infoContent = helper.createEl('div', 'municipalityMarker', { id: 'content' });
		
		var infoContainer = helper.createEl('div','infoContainer'),
			imgDiv = helper.createEl('div','img float-left'),
			informationDiv = helper.createEl('div','info-div float-left');
		
		imgDiv.appendChild(helper.createEl('img',null,{src:'/Content/SiteImages/municipality/'+imageName}));
		
        informationDiv.appendChild(helper.createEl('h4', 'firstHeading', { id: 'firstHeading' }, title));
		informationDiv.appendChild(helper.createEl('p', 'lorries', null, (numLorries == null ? 'No': numLorries) + ' Waste Lorries' ));
		informationDiv.appendChild(helper.createEl('p', 'address', null, Address));
        informationDiv.appendChild(helper.createEl('p', 'contact-number', null, contactNumber));
		
		infoContainer.appendChild(imgDiv);
		infoContainer.appendChild(informationDiv);
		
		infoContent.appendChild(infoContainer);
		
        var btn_div = helper.createEl('div','popup');
        btn_div.appendChild(helper.createEl('button', 'btn btn-secondary', { 'data-mid': id }, 'Change location', function () { btnfuncs.updateMunicipalityLocation($(this).data('mid')); }));
		infoContent.appendChild(btn_div);

        var infowindow = new google.maps.InfoWindow({
            content: infoContent
        });

        var tempmarker = new google.maps.Marker({
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            //icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=M|FE6256|000000',
            //label: 'M',
            position: location,
            title: title,
            map: map
        });

        tempmarker.set('id', id);

        tempmarker.addListener('click', function () {
            if (lastToggled.infowindow != null) {
                lastToggled.infowindow.close();
            }

            infowindow.open(map, tempmarker);

            lastToggled.infowindow = infowindow;
            lastToggled.marker = tempmarker;
        });
        municipalityMarkers.push(tempmarker);
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
					
                    btnfuncs.updateRouteForm(AssignedDriverID, AssignedTruckID, RouteID, DayID);
                }));
                div.appendChild(helper.createEl('button', 'btn btn-secondary', { 'data-routeID': data.routeID, 'data-driverID': data.driverID, 'data-truckID': data.truckID }, 'Delete Route', function () {
                    var RouteID = $(this).data('routeid');
                    btnfuncs.deleteRouteForm(RouteID);
                }));

                div.appendChild(helper.createEl('button', 'btn btn-secondary', { 'data-routeID': data.routeID, 'data-driverID': data.driverID, 'data-truckID': data.truckID }, 'Assign Users', function () {
                    var RouteID = $(this).data('routeid');
                    btnfuncs.routeAddUsersStart(RouteID);
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

            if (lastToggled.route != null && lastToggled.route != this) {
				
                lastToggled.route.setOptions({ strokeColor: '#000000' });
                // var foo = lastToggled.route;
                // foo.addListener('mouseover', function () {
                    // foo.setOptions({ strokeColor: '#00FF00' });
					// console.log(this);
					// for(var x= 0, length = userMarkers.length ; x< length; x++ ) {
						// if(userMarkers[x].routeid == this.RouteID) {
							// userMarkers[x].setIcon('http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
						// }
					// }					
                // });
                // foo.addListener('mouseout', function () {
                    // foo.setOptions({ strokeColor: '#000000' });
					// for(var x= 0, length = userMarkers.length ; x< length; x++ ) {
						// if(userMarkers[x].routeid == this.RouteID) {
							// userMarkers[x].setIcon('http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png');
						// }
					// }
                // });

                if (lastToggled.infowindow != null) {
                    lastToggled.infowindow.close();
                }
            }

            infowindow.open(map, route);

            lastToggled.infowindow = infowindow;
            lastToggled.route = this;
			
            this.setOptions({ strokeColor: '#FF0000' });

            // google.maps.event.clearListeners(this, 'mouseover');
            // google.maps.event.clearListeners(this, 'mouseout');
        });


        route.addListener('mouseover', function () {
            this.setOptions({ strokeColor: '#00FF00' });
			for(var x= 0, length = userMarkers.length ; x< length; x++ ) {
				if(userMarkers[x].routeid == this.RouteID) {
					userMarkers[x].setIcon('http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
				}
			}
			// if(routeid != null) { // User Account is assigned a route
				// tempmarker.set('icon', lightblueMarker);
			// } else if (status == 'For Verification' && status != 'Verified') { // user account is not verified
				// tempmarker.set('icon', greenMarker);
			// } else { // user is verified but not assigned to a route
				// tempmarker.set('icon', pinkMarker);
			// }
			
			
        });
        route.addListener('mouseout', function () {
            this.setOptions({ strokeColor: '#000000' });
			for(var x= 0, length = userMarkers.length ; x< length; x++ ) {
				if(userMarkers[x].routeid == this.RouteID) {
					userMarkers[x].setIcon('http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png');
				}
			}
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
            searchMarkers.forEach(function (marker) {
                marker.setMap(null);
            });
            searchMarkers = [];

            // For each place, get the icon, name and location.
            var flag = true;
            var bounds = new google.maps.LatLngBounds();
            console.log('polygon on map is ');
            console.log(polygonOnMap);
            console.log('bounds are ');
            console.log(bounds);
            places.forEach(function (place) {
                if (!place.geometry || !google.maps.geometry.poly.containsLocation(place.geometry.location, polygonOnMap[0])) {
                    return;
                }
                console.log(place);
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };
                //
                // Create a marker for each place.
                searchMarkers.push(new google.maps.Marker({
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
        userlist: function () {
            var options = {
                url: '/ajax/GetUsers',
                type: 'POST',
                data: { districtID: districtID }
            };

            $.ajax(options).done(function (data) {

            });
        },
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

            $('#routeslist').html('<div class="loading-gif margin-auto"></div>');

            $.ajax(options).done(function (data) {
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
                        var latlng = new google.maps.LatLng(
                            parseFloat(coordinate[0]),
                            parseFloat(coordinate[1]));

                        temproute.push(latlng);
                        //temproute.push({ lat: parseFloat(coordinate[0]), lng: parseFloat(coordinate[1]) });
                        //console.log(coordinate[0] + ' , ' + coordinate[1]);
                    }
                    //var latlng = new google.maps.LatLng(
                    //    data.snappedPoints[i].location.latitude,
                    //    data.snappedPoints[i].location.longitude);
                    //snappedCoordinates.push(latlng);


                    var routeObject = new google.maps.Polyline({
                        path: temproute,
                        strokeColor: 'black',
                        strokeWeight: 5
                    });
                    routeObject.set('lat', temproute[0].lat());
                    routeObject.set('lng', temproute[0].lng());
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
        google.maps.event.addListener(map, 'click', function (event) {
            displayCoordinates(event.latLng);
        });

        //disableMovement(true);

        setDistrictBoundaries(districtName);
        
        //drawPolygon();
        //setDistrictMarkers();

        //getDistrictBoundaries();
        enableAddRoute();

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

            var municipalities = data.Municipalities.Data,
                x_coor,
                y_coor;
			
            for (var x = 0, length = municipalities.length ; x < length; x++) {
                
                x_coor = (municipalities[x].x_coor == null) ? zoomed_x_coor : parseFloat(municipalities[x].x_coor); 
                y_coor = (municipalities[x].y_coor == null) ? zoomed_y_coor : parseFloat(municipalities[x].y_coor);

                //function placeMunicipalityMarker(title, id, location, boundary, Address, contactNumber) {
                placeMunicipalityMarker(municipalities[x].name,
                                        municipalities[x].MunicipalityID,
                                        { lat: x_coor, lng: y_coor },
                                        municipalities[x].boundary,
                                        municipalities[x].Address,
                                        municipalities[x].ContactNumber,
                                        municipalities[x].ImageSrc,
                                        municipalities[x].numLorries);


            }

            var users = data.UserProfiles.Data,
                userlist = document.getElementById('userlist');

            console.log(users);
            for (var x = 0, length = users.length; x < length; x++) {
                if (users[x].x != null) {
                    //function placeUserMarker(location, firstName, lastName, Address, id, status) {
                    placeUserMarker({ lat: parseFloat(users[x].x), lng: parseFloat(users[x].y) },
                                     users[x].FirstName,
                                     users[x].LastName,
                                     users[x].Address,
                                     users[x].UserId,
                                     users[x].RouteID,
                                     users[x].AccountStatus);

                    var label = helper.createEl('label', null);
                    label.appendChild(helper.createEl('input', null, { type: 'checkbox', value: users[x].UserId, checked: 'checked' }, null, function () {
                        var user,
                            userID = $(this).val();
                        for (var x = 0, length = userMarkers.length ; x < length; x++) {
                            if (userMarkers[x].id == userID) {
                                user = userMarkers[x];
                                break;
                            }
                        }


                        if (this.checked == false) {
                            user.setMap(null);
                        } else if (this.checked == true) {
                            user.setMap(map);
                        }
                    }));
                    label.appendChild(document.createTextNode(users[x].FirstName + ' ' + users[x].LastName));

                    userlist.appendChild(label);

                } else {
                    console.log('this is null '+null);
                }
            }


        });


        refresh.driverlist();
        refresh.trucklist();
        refresh.daylist();

        refresh.routelist('all');
        //enableDrawing();
        //setMarkerOnMapClick();

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
        document.getElementById('chkbox-showlorries').onclick = btnfuncs.toggleLorryVisibility;
        document.getElementById('chkbox-showmunicipalities').onclick = btnfuncs.toggleMunicipalityVisibility;
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
                //console.log(data.snappedPoint[i].location);

                var latlng = new google.maps.LatLng(
                    data.snappedPoints[i].location.latitude,
                    data.snappedPoints[i].location.longitude);
                snappedCoordinates.push(latlng);
                tempArray.push([data.snappedPoints[i].location.latitude, data.snappedPoints[i].location.longitude]);

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

        $('#navbar-category > li').click(function () {
            $(this).parent().children().removeClass('active');
            $(this).addClass('active');

            switch ($(this).text()) {
                case 'Users':
                    $('#routes-container').css({display:'none'});
                    $('#users-container').css({ display: 'block' });

                    break;
                case 'Routes':
                    $('#users-container').css({ display: 'none' });
                    $('#routes-container').css({ display: 'block' });
                    break;
            }
        });

    });

    var btnfuncs = {
		unassignUser: function(btnEl, userID) {
			 var options = {
                url: '/ajax/RemoveRouteFromUser',
                type: 'POST',
				data: {
					UserID: userID
				}
            };
			// console.log($(btnEl));
			// console.log('asdas');
			loading.fadeIn();
            $.ajax(options).done(function (data) {
				loading.fadeOut();
				$(btnEl).remove();
				lastToggled.marker.routeid = null;
				lastToggled.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/pink-dot.png');
			});
		},
		verifyUser: function(btnEl, userID) {
			 var options = {
                url: '/ajax/VerifyUser',
                type: 'POST',
				data: {
					UserID: userID
				}
            };
			// console.log($(btnEl));
			// console.log('asdas');
			loading.fadeIn();
            $.ajax(options).done(function (data) {
				loading.fadeOut();
				$(btnEl).remove();
				lastToggled.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/pink-dot.png');
			});
		},
        updateMunicipalityLocation: function (municipalityID) {
			var marker;
			
			for(var x = 0, length = municipalityMarkers.length ; x < length; x++) {
				if(municipalityMarkers[x].id == municipalityID) {
					marker = municipalityMarkers[x];
					break;
				}
			}
			
			marker.setMap(null);		
			infobox.setData(helper.createEl('p',null,null,'Please click on any place in the district to move the municipality.'));
			google.maps.event.addListener(polygonOnMap[0], 'click', function (event) {
				
				var options = {
					url: '/ajax/UpdateMunicipalityLocation',
					type: 'POST',
					data: {
						MunicipalityID : marker.id,
						x: event.latLng.lat().toFixed(4),
						y: event.latLng.lng().toFixed(4)
					}
				};
				
				console.log(options);

				google.maps.event.clearListeners(polygonOnMap[0], 'click');

				loading.fadeIn();
				$.ajax(options).done(function (data) {
					infobox.setData(helper.createEl('p', null, null, 'Municipality updated to new position.'));
					marker.setPosition(event.latLng);
					marker.setMap(map);
					
					loading.fadeOut();

				});

			});
			
			
        },
        toggleLorryVisibility: function () {
            var bool = this.checked == true ? map : null;
            for (var x = 0, length = markers.length; x < length; x++) {
                markers[x].setMap(bool)
            }
        },
        toggleMunicipalityVisibility: function() {
            var bool = this.checked == true ? map : null;

            for (var x = 0, length = municipalityMarkers.length; x < length; x++) {
                municipalityMarkers[x].setMap(bool);
            }
        },
        manageDrivers: function () {
            var options = {
                url: '/ajax/getDrivers',
                type: 'POST'
            };

            loading.fadeIn();
            $.ajax(options).done(function (data) {
                var table = helper.createEl('table', 'table'),
                    thead = helper.createEl('thead'),
                    tbody = helper.createEl('tbody');

                thead.appendChild(helper.createEl('th', null, null, 'Driver ID'));
                thead.appendChild(helper.createEl('th', null, null, 'First Name'));
                thead.appendChild(helper.createEl('th', null, null, 'Last Name'));

                function addDriverButton() {
                    modal.hide();

                    $('#addDriverModal').modal('show');
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

            loading.fadeIn();
            $.ajax(options).done(function (data) {

                infobox.setData(helper.createEl('p', null, null, 'Driver details have been updated'));
                refresh.driverlist();
                loading.fadeOut();
                modal.hide();
            });
        },
        deleteDriverForm: function (driverID) {
            $('#btn-delete-driver').data('driverid', driverID);
            $('#deleteDriverModal').modal('show');
        },
        deleteDriver: function (driverID) {

            var options = {
                url: '/ajax/DeleteDriver',
                type: 'POST',
                data: { DriverID: driverID }
            };
            loading.fadeIn();

            $.ajax(options).done(function (data) {
                refresh.driverlist();
                refresh.routelist();
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
            function addTruckButton() {
                modal.hide();
                $('#addTruckModal').modal('show');
            }

            loading.fadeIn();
            $.ajax(options).done(function (data) {
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
                modal.setFooter(helper.createEl('button', 'btn btn-secondary', {type:'button'}, 'Add new truck', function () { addTruckButton(); }));
                loading.fadeOut();
                modal.show();
            });            
        },
        deleteTruckForm: function (truckID) {
            $('#btn-delete-truck').data('truckid', truckID);
            $('#deleteTruckModal').modal('show');
        },
        deleteTruck: function (truckID) {
            var options = {
                url: '/ajax/DeleteTruck',
                type: 'POST',
                data: { TruckID: truckID}
            };
            loading.fadeIn();

            $.ajax(options).done(function (data) {
                btnfuncs.manageTrucks();
                refresh.trucklist();
                refresh.routelist();
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
            var newName = $('#updateTruckName').val();

            var options = {
                url: '/ajax/UpdateTruck',
                type: 'POST',
                data: {
                    truckID: truckID,
                    name: newName
                }
            };

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
                infobox.setData(helper.createEl('p', null, null, 'Route has been saved. You can click on the route to assign a designated person.'));
                polylines[polylines.length - 1].setMap(null);
                tempArray = [];
                refresh.routelist();
                loading.fadeOut();
            });
        },
        routeAddUsersStart: function(routeID) {
			
			lastToggled.infowindow.close();
			lastToggled.infowindow = null;
			
			// tempUserMarkers = userMarkers;
			
			var sidebar = helper.createEl('div','sidebar width-auto');
			var div = helper.createEl('div', 'sidebar-list');
			div.appendChild(helper.createEl('p',null,null,'To assign users to this route, click on the unassigned markers(orange) to add them then click on save when finished.'));
			console.log('Route id is ' + routeID);
			var ul = helper.createEl('ul');
			var liSave = helper.createEl('li', null, {'data-routeid' : routeID }, 'Save assigned users', function () { var routeID = $(this).data('routeid'); btnfuncs.routeAddUsers(routeID); });
			ul.appendChild(liSave);
			
			var liCancel = helper.createEl('li', null, {'data-routeid' : routeID }, 'Cancel', function () { btnfuncs.cancelRouteAddUsers(); });
			ul.appendChild(liCancel);
			
			div.appendChild(ul);
			sidebar.appendChild(div);
			infobox.setData(sidebar);
			var greenMarker = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
				orangeMarker = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
				yellowMarker = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
			
			for(var x = 0, length = userMarkers.length ;x < length; x++) {
				if(userMarkers[x].routeid != null || userMarkers[x].icon == greenMarker) {
					userMarkers[x].setMap(null);
				} else {
					userMarkers[x].setIcon(orangeMarker);

					google.maps.event.clearListeners(userMarkers[x], 'click');
					userMarkers[x].addListener('click', function () {
						this.setIcon(this.icon == yellowMarker ? orangeMarker : yellowMarker);
					});
				}
			}
		},
		cancelRouteAddUsers: function() {
			for(var x = 0, length = userMarkers.length ;x < length; x++) {
				google.maps.event.clearListeners(userMarkers[x], 'click');
				userMarkers[x].addListener('click', function () {
					if (lastToggled.infowindow != null) {
						lastToggled.infowindow.close();
					}
					this['infowindow'].open(map, this);
					
					lastToggled.infowindow = this['infowindow'];
					lastToggled.marker = this;
				});
				userMarkers[x].setMap(map);
			}
			infobox.setData(helper.createEl('p',null,null,'Action has been canceled.'));
		},
		routeAddUsers: function(routeID) {
			var userIDs = [];
			var yellowMarker = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
			var lightblueMarker = 'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';
			
			for(var x = 0, length = userMarkers.length ;x < length; x++) {
				if(userMarkers[x].getIcon() == yellowMarker) {
					userIDs.push(userMarkers[x].id);
				}
			}
			var options = {
                url: '/ajax/UpdateUserRoutes',
                type: 'POST',
                traditional: true,
                dataType: "json",
				data: {
					routeID : routeID,
					userIDs : userIDs
				}
            };
			console.log(options);
            loading.fadeIn();	
            $.ajax(options).done(function (data) {
                console.log(data);
				// for(var x = 0, length = userMarkers.length ;x < length; x++) {
					// userMarkers[x].setMap(null);
				// }
				
				// userMarkers = tempUserMarkers;
				for(var x = 0, length = userMarkers.length ;x < length; x++) {
					for(var y = 0 ; y < userIDs.length; y++) {
						if(userMarkers[x].id == userIDs[y]) {
							var foo = $(userMarkers[x]['infowindow'].content).find('.popup');
							foo.append(helper.createEl('button', 
														'btn btn-secondary', 
														{'data-userid':userMarkers[x].id}, 
														'Remove Assigned Route', 
														function () {  
															var userID = $(this).data('userid')
															btnfuncs.unassignUser(this, userID); 
														}));
							userMarkers[x].routeid = routeID;
							userMarkers[x].setIcon(lightblueMarker);
							google.maps.event.clearListeners(userMarkers[x], 'click');
							userMarkers[x].addListener('click', function () {
								if (lastToggled.infowindow != null) {
									lastToggled.infowindow.close();
								}
								this['infowindow'].open(map, this);
								
								lastToggled.infowindow = this['infowindow'];
								lastToggled.marker = this;
							});
						}
					}
					userMarkers[x].setMap(map);
				}
				
				infobox.setData(helper.createEl('p',null,null,'Users have been added to route.'));
				loading.fadeOut();
			});
		},
		toggleUnassignedUsers: function(flag) {
			
			for(var x = 0, length = userMarkers.length ; x < length; x++) {
				
			}
			if(flag == true) {
				
			}
		},
		toggleAssignedUsers: function(flag) {
			
		},
		updateRouteForm: function (assignedDriverID, assignedTruckID, RouteID) {
			var options = {
				url: '/ajax/GetDriversAndTrucksAndDays',
				type: 'POST',
				data: {
				}
			};

			loading.fadeIn();
			$.ajax(options).done(function (data) {
			    loading.fadeOut();
				
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

				var table = helper.createEl('table','form-edit-table');
				var tr1 = helper.createEl('tr');
				tr1.appendChild(helper.createEl('td', null,null, 'Assigned Driver: '));
				tr1.appendChild((helper.createEl('td','text-align-left')).appendChild(driverselect));
				table.appendChild(tr1);

				var tr2 = helper.createEl('tr');
				tr2.appendChild(helper.createEl('td', null, null, 'Assigned Truck: '));
				tr2.appendChild((helper.createEl('td')).appendChild(truckselect));
				table.appendChild(tr2);

				var tr3 = helper.createEl('tr');
				tr3.appendChild(helper.createEl('td', null, null, 'Assigned Truck: '));
				tr3.appendChild((helper.createEl('td')).appendChild(dayselect));
				table.appendChild(tr3);
				
				modal.setTitle('<h3>Update Route:</h3>');
				modal.setBody(table);
				modal.setFooter(helper.createEl('button', 'btn btn-secondary', {'data-routeid' : RouteID}, 'Update Route', function () { btnfuncs.updateRoute($(this).data('routeid')); }));
				modal.show();
			});
			

        },
        updateRoute: function (routeID) {
            var truckID = $('#routetruck-select').val(),
				truckName = $('#routetruck-select option:selected').text(),
                driverID = $('#routedriver-select').val(),
                driverName = $('#routedriver-select option:selected').text(),
                dayID = $('#routeday-select').val(),
                dayName = $('#routeday-select option:selected').text();

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

            loading.fadeIn();
            $.ajax(options).done(function (data) {
                refresh.routelist();
				loading.fadeOut();
				modal.hide();
            });

        },
        addLorryForm: function () {
			 var options = {
                url: '/ajax/GetMunicipalities',
                type: 'POST',
                data: {
                    DistrictID: districtID,
                }
            };

            loading.fadeIn();
            $.ajax(options).done(function (data) {
                modal.setTitle(helper.createEl('h3', null, null, 'Add a lorry'));

                var table = helper.createEl('table', 'form-edit-table');
                var tr1 = helper.createEl('tr');
                tr1.appendChild(helper.createEl('td', null, null, 'Lorry Name: '));
                tr1.appendChild(helper.createEl('input', 'form-control', { id: 'lorryName', placeholder: 'Lorry Name here' }));

                table.appendChild(tr1);

                var tr2 = helper.createEl('tr');
                tr2.appendChild(helper.createEl('td', null, null, 'Assigned Municipality: '));

                var select = helper.createEl('select', 'form-control', { id: 'addFormMunicipalityID' });
                for (var x = 0, length = data.length; x < length; x++) {
                    select.appendChild(helper.createEl('option', null, { 'value': data[x].MunicipalityID }, data[x].name));
                }

                var td = helper.createEl('td');
                tr2.appendChild(td.appendChild(select));
                table.appendChild(tr2);
				
				modal.setBody(table);
				modal.setFooter(helper.createEl('button', 'btn btn-secondary', null, 'Add Lorry', function () { 
					btnfuncs.enableAddLorryonDistrictClick(); 
				}));
				
				loading.fadeOut();
				modal.show();
				
            });
			
        },
        enableAddLorryonDistrictClick: function (flag) {

            modal.hide();
            if (polygonOnMap.length > 0) {
                infobox.setData(helper.createEl('p',null,null,'Please click on the shaded district to add the lorry.'));
                google.maps.event.addListener(polygonOnMap[0], 'click', function (event) {
                    var newLorryName = $('#lorryName').val();
					var MunicipalityID = $('#addFormMunicipalityID').val();
					
                    var options = {
                        url: '/ajax/addLorry',
                        type: 'POST',
                        data: {
							municipalityID: MunicipalityID,
                            districtID: districtID,
                            x: event.latLng.lat().toFixed(4),
                            y: event.latLng.lng().toFixed(4),
                            name: newLorryName
                        }
                    };


                    google.maps.event.clearListeners(polygonOnMap[0], 'click');

                    loading.fadeIn();
                    $.ajax(options).done(function (data) {
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
            modal.setBody(helper.createEl('input', 'form-control', { value: name ,id: 'lorryName', placeholder: 'Lorry Name here' }));
            modal.setFooter(helper.createEl('button', 'btn btn-secondary', null, 'Update Lorry', function () {
                btnfuncs.updateLorry(lorryID, $('#lorryName').val());
            }));
            modal.show();
        },
        updateLorry: function (lorryID, name) {
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