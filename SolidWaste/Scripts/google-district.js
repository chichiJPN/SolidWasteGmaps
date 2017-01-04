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
    lastToggled = {
        infowindow: null,
        marker: null,
        route: null
    },
    searchMarkers = [],
    municipalityMarkers = [],
    accountStatus = null;

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

function placeMarker(location, title, id, searchFlag) {

    var tempmarker;

    if (searchFlag == true) {
        tempmarker = new google.maps.Marker({
            position: location,
            icon : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            map: map,
        });
    } else {
        if (title === undefined) { title = "No Title"; }

        var infoContent = helper.createEl('h3', null, { id: 'content' });
        infoContent.appendChild(helper.createEl('h3', 'firstHeading', { id: 'firstHeading' }, 'Lorry ' + title));

        var infowindow = new google.maps.InfoWindow({
            content: infoContent
        });

        tempmarker = new google.maps.Marker({
            position: location,
            title: title,
            map: map,
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

    }

    markers.push(tempmarker);
}

function placeMunicipalityMarker(title, id, location, boundary, Address, contactNumber, imageName, numLorries) {
    if (title === undefined) { title = "No Title"; }

    var infoContent = helper.createEl('div', 'municipalityMarker', { id: 'content' });

    var infoContainer = helper.createEl('div', 'infoContainer'),
        imgDiv = helper.createEl('div', 'img float-left'),
        informationDiv = helper.createEl('div', 'info-div float-left');

    imgDiv.appendChild(helper.createEl('img', null, { src: '/Content/SiteImages/municipality/' + imageName }));
    informationDiv.appendChild(helper.createEl('h4', 'firstHeading', { id: 'firstHeading' }, title));

    informationDiv.appendChild(helper.createEl('p', 'lorries', null, (numLorries == null ? 'No' : numLorries) + ' Waste Lorries'));
    informationDiv.appendChild(helper.createEl('p', 'address', null, Address));
    informationDiv.appendChild(helper.createEl('p', 'contact-number', null, contactNumber));

    infoContainer.appendChild(imgDiv);
    infoContainer.appendChild(informationDiv);

    infoContent.appendChild(infoContainer);

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

function createInfoWindow(type, data) {
    var infowindow;

    switch (type) {
        case 'route':
            var infoContent = helper.createEl('div', null, { id: 'content' });
            infoContent.appendChild(helper.createEl('h3', 'firstHeading', { id: 'firstHeading' }, 'Route ' + data.routeName));
            infoContent.appendChild(helper.createEl('h5', null, null, 'Schedule: ' + (data.dayName == null ? 'None' : data.dayName)));


            var infowindow = new google.maps.InfoWindow({
                content: infoContent
            });
            infowindow.setPosition({ lat: parseFloat(data.lat), lng: parseFloat(data.lng) });
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


    route.setOptions({ zIndex: 25 });

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
        places.forEach(function (place) {
            if (!place.geometry || !google.maps.geometry.poly.containsLocation(place.geometry.location, polygonOnMap[0])) {
                flag = false;
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            if (search_flag == true) {
                markers[markers.length - 1].setMap(null);
                markers = markers.splice(markers.length - 1, 1);
                search_flag = false;
            }

            markers.push(new google.maps.Marker({
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }

            $('#home-address').val($('#pac-input').val());
            $('#home_x').val(place.geometry.location.lat());
            $('#home_y').val(place.geometry.location.lng());
            return;
        });
        if (flag == true) {
            map.fitBounds(bounds);
            document.getElementById('home-details').style.display = 'block';
            search_flag = true;
        }
    });
}


var refresh = {
    routelist: function (search) {
        var truckID, driverID, dayID;

        if (search == 'all') {
            truckID = 'All';
            driverID = 'All';
            dayID = 'All';
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

            if (lastToggled.infowindow != null) {
                lastToggled.infowindow.close();
                lastToggled.infowindow = null;
            }


            for (var x = 0, length = routes.length ; x < length; x++) {
                routes[x].setMap(null);
            }

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

$(document).ready(function() {
	$('#btn-collection button').click(function() {
		var flag = $(this).val();
		var options = {
			url: '/ajax/UpdateCollectionFlag',
			type: 'POST',
			data: { flag: flag },
			dataType: 'json'
		};
		console.log(flag);
		// if flag = 1 then enable button was clicked
		var btn = $(this);
		
		
		loading.fadeIn();
		$.ajax(options).done(function (data) {
			
			btn.prop('disabled',true);
			var status = $('#collectionStatus');
			status.removeClass('color-green');
			status.removeClass('color-red');
			
			if(flag == 1) { //  disable 2nd button
				btn.parent().children().eq(1).prop('disabled',false);
				status.addClass('color-green');
				status.html('Will be collected');
				
			} else {
				btn.parent().children().eq(0).prop('disabled',false);
				status.addClass('color-red');
				status.html('Will not be collected');
				
			}
			loading.fadeOut();
			
		});
	});
	
});

function initAutocomplete() {

    var data = $('#dataDiv'),
        zoomed_x_coor = parseFloat(data.data('x_coor')),
        zoomed_y_coor = parseFloat(data.data('y_coor')),
        districtName = data.data('district_name');

    accountStatus = data.data('account-status');


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
    });

    refresh.routelist('all');

    //zoomed_x_coor
    switch (accountStatus) {
        case 'Not Verified':
            document.getElementById('btn-placemarker').onclick = btnfuncs.placemarker;
            document.getElementById('form_home_account').onsubmit = btnfuncs.form_home_submit;
            break;
        case 'For Verification':
            console.log('for verification');
            break;
        case 'Verified':
            console.log('i am verified');
            var x = data.data('userx'),
                y = data.data('usery'),
                routeid = data.data('route-id'),
                firstName = data.data('firstname'),
                lastName = data.data('lastname');
            
            var coordinates = { lat: parseFloat(x), lng: parseFloat(y) }
            var name = firstName + ' ' + lastName;
    
            var infoContent = helper.createEl('h3', null, { id: 'content' });
            infoContent.appendChild(helper.createEl('h3', 'firstHeading', { id: 'firstHeading' }, name));

            var infowindow = new google.maps.InfoWindow({
                content: infoContent
            });

            tempmarker = new google.maps.Marker({
                icon:'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                position: coordinates,
                title: name,
                map: map,
            });

            tempmarker.addListener('click', function () {
                if (lastToggled.infowindow != null) {
                    lastToggled.infowindow.close();
                }
                infowindow.open(map, tempmarker);
                lastToggled.infowindow = infowindow;
                lastToggled.marker = tempmarker;
            });

            var messageDiv = document.getElementById('message');

            if (routeid == null || routeid == 'null') {
                messageDiv.appendChild(helper.createEl('label',null,null,'Your home has not been assigned a collection route yet. Please be patient with us.'));
            } else {
				var options = {
					url: '/ajax/GetRouteData',
					type: 'POST',
					data: { RouteID: routeid }
				};

				$.ajax(options).done(function (data) {
					console.log(data);
					var day = data[0].DayName,
						RouteID = data[0].RouteID,
						RouteName = data[0].RouteName,
						message = 'You have been assigned to <b>route '+ RouteName + '</b>'+ (day == null 
																					? '. Route has not been assigned a day yet.' 
																					: ' which will be on every <b>' + day + '</b>.');
						
					messageDiv.appendChild(helper.createEl('label',null,null,message));
					
				});
            }

            break;
    }

    //enableDrawing();
    //setMarkerOnMapClick();

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    addSearch();
    document.getElementById('chkbox-showlorries').onclick = btnfuncs.toggleLorryVisibility;
    document.getElementById('chkbox-showmunicipalities').onclick = btnfuncs.toggleMunicipalityVisibility;
}

var search_flag = false;
var btnfuncs = {
    form_home_submit: function () {
        var x = $('#home_x').val(),
            y = $('#home_y').val(),
            homeAddress = $('#home-address').val(),
            errmessage = document.getElementById('err_message');

        if(homeAddress == '' ) {
            errmessage.innerHTML ='Address not specified';
            return false;
        }

        if (x == '' || y == '') {
            errmessage.innerHTML = 'Please specify coordinates';
            return false;
        }

        console.log(x);
        console.log(y);
        console.log(homeAddress);

        var options = {
            url: '/ajax/UpdateAccountMember',
            type: 'POST',
            data: {
                x: x,
                y: y,
                address: homeAddress
            }
        };

        loading.fadeIn();
        $.ajax(options).done(function (data) {
            console.log('i am in here');
            location.reload();
            loading.fadeOut();
        });
        return false;
    },
    placemarker: function (e) {
        e.preventDefault();

        google.maps.event.addListener(polygonOnMap[0], 'mousemove', function (event) {
            $('#home_x').val(event.latLng.lat());
            $('#home_y').val(event.latLng.lng());
        });

        google.maps.event.addListener(polygonOnMap[0], 'click', function (event) {
            if (search_flag == true) {
                markers[markers.length - 1].setMap(null);
                markers = markers.splice(markers.length - 1, 1);
            }
            search_flag = true;
            placeMarker(event.latLng,null,null, true);
            google.maps.event.clearListeners(polygonOnMap[0], 'click');
            google.maps.event.clearListeners(polygonOnMap[0], 'mousemove');
            console.log(event.latLng);

            $('#home_x').val(event.latLng.lat());
            $('#home_y').val(event.latLng.lng());
            document.getElementById('markermessage').innerHTML = 'Marker position not on top of your home? Click <a id="btn-placemarker">here </a>to put it yourself.';
            document.getElementById('btn-placemarker').onclick = btnfuncs.placemarker;
        });
        if (search_flag == true) {
            markers[markers.length - 1].setMap(null);
            markers = markers.splice(markers.length - 1, 1);
            search_flag = false;
        }

        document.getElementById('markermessage').innerHTML = 'Click inside the shape to add the marker';

    },
    toggleLorryVisibility: function () {
        var bool = this.checked == true ? map : null;
        for (var x = 0, length = markers.length; x < length; x++) {
            markers[x].setMap(bool)
        }
    },
    toggleMunicipalityVisibility: function () {
        var bool = this.checked == true ? map : null;

        for (var x = 0, length = municipalityMarkers.length; x < length; x++) {
            municipalityMarkers[x].setMap(bool);
        }
    },
};

function updateLastToggled(action, data) {
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
            placeMarker(data.location, data.title, data.id);
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
    createEl: function (elementName, classes, dataAttrib, innerHTML, func) {
        var element = document.createElement(elementName);

        if (classes != undefined || classes != null) { element.className = classes; }
        if (innerHTML != undefined) { element.innerHTML = innerHTML; }

        if (dataAttrib != undefined || dataAttrib != null) {
            for (var x in dataAttrib) {
                element.setAttribute(x, dataAttrib[x]);
            }
        }

        if (func != undefined && func != null) { element.onclick = func; }

        return element;
    },
    findRoute: function (RouteID) {
        for (var x = 0, length = routes.length ; x < length; x++) {
            // if(routes[x])

        }
        return null;
    }
};