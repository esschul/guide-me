/*
 -- Concept

 By using the geoposition mobile client can add their location.
 There a two roles 
 -a guide
 -an observer

 a guide needs to be able to draw directions.
 an observer needs to be able to register on map.

 so we need to functions.

 showPositionOnMap
 drawDirectionsOnMap
 

 
 */

var map;
var rendererOptions = {draggable: true};
var directionsDisplay;
var directionsService

 var startedOnARoute = false; // session specific thing this
 var routeStatus;

if (Meteor.isClient) {


  Template.menu.events({
    'click #show-me-on-the-map' : function (event) {
        console.log("Show me on the map.");
        showPositionOnMap();
    },
    'click #draw-directions-on-the-map' : function (event) {
        console.log("Draw directions on the map.");        
        drawDirectionsOnMap();
    }
  });

  Meteor.startup(function () {
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);;
    directionsService = new google.maps.DirectionsService();

     var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(59.8, 10.6),
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL
        } 
      }
      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      directionsDisplay.setMap(map);


    google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
      console.log("Directions changed")
    });


  });

  var showPositionOnMap = function(){
   if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude,
                                         position.coords.longitude);


        console.log("Current position is latitude:" +position.coords.latitude + " and longitude" + position.coords.longitude);

        var infowindow = new google.maps.InfoWindow({
          map: map,
          position: pos,
          content: 'Du er her.'
        });

        map.setCenter(pos);
      });
    } else {
      console.log("No position!");
    }
  }

  var playSound = function(sound){
  }

  var deviatingFromRoute = function(){
    playSound("sjekk-kart");
    border("red");
  }

  var startWalking = function(){
    startedOnARoute = true;
    playSound("start");
    border("green");
  }


  var drawDirectionsOnMap = function(){
      var request = {
        origin: 'OSLO, NOR',
        destination: 'FROGNER, NOR',
        travelMode: google.maps.TravelMode.WALKING
      };

      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        }
      });
  }



}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
