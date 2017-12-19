import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';

declare var google: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  map: any;

  latOri  = -14.5931473;
  longOri = -56.1224024;

  latDest = -15.5931473;
  longDest = -56.1224024;

  constructor(public navCtrl: NavController, public geolocation: Geolocation, public platform:Platform) {
    this.platform.ready().then(() => {
      this.geolocation.getCurrentPosition().then(result => {
        console.log('1'+result.coords.latitude)
        this.latOri = result.coords.latitude;
        this.longOri = result.coords.longitude;
      }).catch(function(e) {
        console.log('2-error')
        alert('GPS desativado. Verifique!')
      });
    });
  }

  calcRota(latDest, lngDest) {
    console.log(this.latOri)
    this.loadMap(this.latOri, this.longOri, parseFloat(latDest), parseFloat(lngDest));
  }

  private loadMap(latOri, lngOri, latDest, lngDest) {
      var directionsService = new google.maps.DirectionsService;
      var directionsDisplay = new google.maps.DirectionsRenderer;
     directionsDisplay = new google.maps.DirectionsRenderer();
     var bounds = new google.maps.LatLngBounds;
     var markersArray = [];

     var origin1 = {lat: parseFloat(latOri), lng: parseFloat(lngOri)};
     var destinationA = {lat: latDest, lng: lngDest};

     var destinationIcon = 'https://chart.googleapis.com/chart?' +
         'chst=d_map_pin_letter&chld=D|FF0000|000000';
     var originIcon = 'https://chart.googleapis.com/chart?' +
         'chst=d_map_pin_letter&chld=O|FFFF00|000000';
     var map = new google.maps.Map(document.getElementById('map'), {
       center: {lat: latOri, lng: lngOri},
       zoom: 100
     });
     directionsDisplay.setMap(map);
     var geocoder = new google.maps.Geocoder;

     var service = new google.maps.DistanceMatrixService;
     service.getDistanceMatrix({
       origins: [origin1],
       destinations: [destinationA],
       travelMode: 'DRIVING',
       unitSystem: google.maps.UnitSystem.METRIC,
       avoidHighways: false,
       avoidTolls: false
     }, function(response, status) {
       if (status !== 'OK') {
         alert('Error was: ' + status);
       } else {
         var originList = response.originAddresses;
         var destinationList = response.destinationAddresses;
         var outputDiv = document.getElementById('output');
         outputDiv.innerHTML = '';
         deleteMarkers(markersArray);

         var showGeocodedAddressOnMap = function(asDestination) {
           var icon = asDestination ? destinationIcon : originIcon;
           return function(results, status) {
             if (status === 'OK') {
               map.fitBounds(bounds.extend(results[0].geometry.location));
               /*markersArray.push(new google.maps.Marker({
                 map: map,
                 position: results[0].geometry.location,
                 icon: icon
               }));*/
             } else {
               alert('Geocode was not successful due to: ' + status);
             }
           };
         };

         directionsService.route({
           origin: origin1,
           destination: destinationA,
           travelMode: 'DRIVING'
         }, function(response, status) {
           if (status === 'OK') {
             directionsDisplay.setDirections(response);
           } else {
             window.alert('Directions request failed due to ' + status);
           }
         });


         for (var i = 0; i < originList.length; i++) {
           var results = response.rows[i].elements;
           geocoder.geocode({'address': originList[i]},
               showGeocodedAddressOnMap(false));
           for (var j = 0; j < results.length; j++) {
             geocoder.geocode({'address': destinationList[j]},
                 showGeocodedAddressOnMap(true));
             outputDiv.innerHTML += 'DE: ' + originList[i] + ' || PARA: ' + destinationList[j] +
                 '|| DISTÂNCIA: ' + results[j].distance.text + ' EM ' +
                 results[j].duration.text + '<br>';
           }
         }
       }
     });

     function deleteMarkers(markersArray) {
       for (var i = 0; i < markersArray.length; i++) {
         markersArray[i].setMap(null);
       }
       markersArray = [];
     }
   }
}
