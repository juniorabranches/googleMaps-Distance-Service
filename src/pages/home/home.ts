import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';

declare var google: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  map: any;
  latDest = -15.5931473;
  longDest = -56.1224024;
  constructor(public navCtrl: NavController, public geolocation: Geolocation) {}

  calcRota(latDest, lngDest) {
    this.geolocation.getCurrentPosition().then(result => {
      this.loadMap(result.coords.latitude, result.coords.longitude, parseFloat(latDest), parseFloat(lngDest));
    });
  }

  private loadMap(latOri, lngOri, latDest, lngDest) {
     var bounds = new google.maps.LatLngBounds;
     var markersArray = [];

     var origin1 = {lat: latOri, lng: lngOri};
     var destinationA = {lat: latDest, lng: lngDest};

     var destinationIcon = 'https://chart.googleapis.com/chart?' +
         'chst=d_map_pin_letter&chld=D|FF0000|000000';
     var originIcon = 'https://chart.googleapis.com/chart?' +
         'chst=d_map_pin_letter&chld=O|FFFF00|000000';
     var map = new google.maps.Map(document.getElementById('map'), {
       center: {lat: latOri, lng: lngOri},
       zoom: 100
     });
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
               markersArray.push(new google.maps.Marker({
                 map: map,
                 position: results[0].geometry.location,
                 icon: icon
               }));
             } else {
               alert('Geocode was not successful due to: ' + status);
             }
           };
         };

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
