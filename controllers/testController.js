const Bus = require('../models/Test');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

exports.getBusData = (req, res) => {
  
  let postCode = req.params.postcode
  validatePostCode(postCode);
  function validatePostCode (postCode) {
   var request = new XMLHttpRequest()
   request.open('GET', `https://api.postcodes.io/postcodes/${postCode}/validate`, true)
   request.onload = function () {
  
    var postCodeCheck = JSON.parse(request.responseText)
    var validPostCode = postCodeCheck.result
    console.log(validPostCode)
   
   correctPostCode(validPostCode)
 
    }
    request.send()
 
  } 
 
 function correctPostCode (validPostCode) {
   if (validPostCode == true) {
     getLongitudeLatitude(postCode)
   } else if (validPostCode == false) {
     res.render('errorView') //change to errorView so it's clearer
 }
}
 ;
  
 

  function getLongitudeLatitude(postCode) 
  {
    var request = new XMLHttpRequest()
    //console.log(postCode);
    request.open('GET', `https://api.postcodes.io/postcodes/${postCode}` , true)
    request.onload = function () 
    {
      var postCodeData = JSON.parse(request.responseText);
    
      var longitude = postCodeData.result.longitude
    
      var latitude = postCodeData.result.latitude

      //console.log('Longitude:',longitude,'and latitude', latitude)
      getStopCode(longitude, latitude)
    } 
    request.send()
  }


  function getStopCode (longitude, latitude) 
  {//console.log('Check:  Longitude:',longitude,'and latitude', latitude) //i added this in to check they were being called correctly
    var request = new XMLHttpRequest()
    request.open('GET', `https://api.tfl.gov.uk/Stoppoint?lat=${latitude}&lon=${longitude}&stoptypes=NaptanPublicBusCoachTram`, true)
    
    
    request.onload = function () 
    {
      var stopCodeData = JSON.parse(request.responseText);
    
      //console.log(stopCodeData)
    
      var stopCode = stopCodeData['stopPoints'][0]['naptanId']
      

      //console.log('This is is the stop code for the nearest bus stop ' + stopCode + '.')

      getBuses(stopCode)
      
    }
    
    request.send()
  }

  // function busFilter (busData) {
  //   let busDataFilter = [];
  //     for (let i = 0; i < busData.length; i++) {
  //     //converts time to station in seconds to minutes
  //       let minsToStation = Math.round(busData[i].timeToStation/60)
  //     //console.log(busData[i].lineId)
  //       busDataFilter.push({'Bus Number': busData[i].lineId ,  
  //                       'Time to station in minutes': minsToStation})
  //     };
  //   return busDataFilter;
  // }

  function getBuses (stopCode) { 
    var request = new XMLHttpRequest()
    request.open('GET', `https://api.tfl.gov.uk/StopPoint/${stopCode}/Arrivals` , true)
    request.onload = function () {
      //the request is returned as a string JSON.parse converts it into an array of objects
      let busData = JSON.parse(request.responseText);

      busData.sort(function (a, b) {
        return a.timeToStation - b.timeToStation;
      })
    
      printTime = (item) => {    
        console.log('Minutes to Station: '  + Math.round(item.timeToStation/60) + ', Bus Number: ' + item.lineId);
      }
      busData.forEach(printTime)

      //console.log(busData)
          
      // const nextBuses = busFilter(busData)
      // //ensures that the array is no longer than 5 elements i.e. only prints next 5 buses
      // nextBuses.length = 5;
      // nextBuses.sort(function(a, b){return a['Time to station in minutes'] - b['Time to station in minutes']});
      // // at this point nextBuses are what we want to pass to the ejs file
      // // console.log(nextBuses);

      // change from list of tfl objects to list of objects that i've defined
      let busArray = busData.map(bus => {
        return new Bus(bus.lineId, Math.round(bus.timeToStation/60))
      })
      //console.log(busArray)

      res.render('testView', {
        busArray: busArray,
      });

      // const nextBuses is an array of objects, each object containing the values of the 2 properties
      // which we filtered using the busFilter function defined above.        
    }
    
    request.send()
  }
};


    
//     let buses = getBusArrivals.map(bus => {
//       return new Test(bus.lineId, bus.timeToStation)
//      })
    
//       res.render('testView', {
//         buses: buses,
//       });

//       // const nextBuses is an array of objects, each object containing the values of the 2 properties
//       // which we filtered using the busFilter function defined above.        
//     }
  
    
//     request.send()
  
// }
//   }
