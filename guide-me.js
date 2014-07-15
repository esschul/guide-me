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
var directionsChanged = false;
var origin;
var destination;
var pos;
var lastPos;

 var startedOnARoute = false; // session specific thing this
 var routeStatus;

if (Meteor.isClient) {


  Template.menu.events({
    'click #show-me-on-the-map' : function (event) {
        console.log("Show me on the map.");
        showPositionOnMap();
    },
    'click #draw-directions-on-the-map' : function (event) {
        origin = undefined;
        destination = undefined;
        directionsDisplay.setMap(null);
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
      console.log("Directions changed");
      directionsChanged = true;
    });

    google.maps.event.addListener(map, 'click', function(event) {
      if(origin === undefined && destination === undefined) {
        origin = event.latLng;
      } else if(origin !== undefined && destination === undefined){
        destination = event.latLng;
      }
    
      if(origin !== undefined && destination !== undefined){
        drawDirectionsOnMap();
      }

    });

  });

  var showPositionOnMap = function(){
   if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        pos = new google.maps.LatLng(position.coords.latitude,
                                         position.coords.longitude);

        console.log("Current position is latitude:" +position.coords.latitude + " and longitude" + position.coords.longitude);

        var infowindow = new google.maps.InfoWindow({
          map: map,
          position: pos,
          content: 'Du er her.'
        });
        map.setCenter(pos);
        map.setZoom(15);
        
      });
    } else {
      console.log("No position!");
    }
  }


  var drawDirectionsOnMap = function(){
      if(directionsDisplay.getMap() === null){
        directionsDisplay.setMap(map);      
      }

      var request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.WALKING
      };

      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        } else {
          console.log(response)
        }
      });
  }



var checkPositionProximity = function(){
  if((lastPos !== pos && pos !== undefined && origin !== undefined && destination !== undefined ) || directionsChanged === true)  {
    lastPos = pos;
    directionsChanged = false;

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [pos],
        destinations: [origin, destination],
        travelMode: google.maps.TravelMode.WALKING
      }, callback);

    function callback(response, status) {
      if(status === "OK"){
        var metersAway = 100000000;
        for (var i = 0; i < response.rows.length; i++) {
          response.rows[i].elements.forEach(function(element){
            if(element.distance.value < metersAway){
              metersAway = element.distance.value
            }
            
          });

          if(metersAway !== undefined && metersAway < 50){
              console.log("Is close to route. Meters away : " + metersAway);
          } else {
              console.log("Is far from route. Meters away : " + metersAway);
          }        
      }     
    }
  }
  }
}


Meteor.setInterval(checkPositionProximity, 5000); 


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
