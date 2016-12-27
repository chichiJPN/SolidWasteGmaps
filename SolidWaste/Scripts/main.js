$(document).ready(function () {

    // loads slider
    if ($("#owl-demo").length > 0) {
        $("#owl-demo").owlCarousel({
            loop: true,
            navigation: true, // Show next and prev buttons
            slideSpeed: 300,
            paginationSpeed: 400,
            singleItem: true,
            items: 1,
            autoplay: true
        });
    }

    if ($("#viewDiv").length > 0) {
        //var map;
        //require(["esri/map", "dojo/domReady!"], function (Map) {
        //    map = new Map("viewDiv", {
        //        basemap: "topo",
        //        center: [-122.45, 37.75],
        //        zoom: 13
        //    });
        //});
    }


});