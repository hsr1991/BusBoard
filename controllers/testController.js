const Test = require('../models/Test');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

exports.getBusData = (req, res) => {
  
  let postCode = req.params.postcode


  getLongitudeLatitude(postCode);

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

  function busFilter (busData) {
    let busDataFilter = [];
      for (let i = 0; i < busData.length; i++) {
      //converts time to station in seconds to minutes
        let minsToStation = Math.round(busData[i].timeToStation/60)
      //console.log(busData[i].lineId)
        busDataFilter.push({'Bus Number': busData[i].lineId ,  
                        'Time to station in minutes': minsToStation})
      };
    return busDataFilter;
  }

  function getBuses (stopCode) { 
    var request = new XMLHttpRequest()
    request.open('GET', `https://api.tfl.gov.uk/StopPoint/${stopCode}/Arrivals` , true)
    request.onload = function () {
      //the request is returned as a string JSON.parse converts it into an array of objects
      const busData = JSON.parse(request.responseText);

      //console.log(busData)
          
      const nextBuses = busFilter(busData)
      //ensures that the array is no longer than 5 elements i.e. only prints next 5 buses
      nextBuses.length = 5;
      nextBuses.sort(function(a, b){return a['Time to station in minutes'] - b['Time to station in minutes']});
      // at this point nextBuses are what we want to pass to the ejs file
      console.log(nextBuses);

      let busArray = nextBuses.map(bus => {
        return new Bus(Bus.busNumber, Bus.timeToStation)
      });
    
      res.render('testView', {
        nextBuses : busArray,
      });
      // const nextBuses is an array of objects, each object containing the values of the 2 properties
      // which we filtered using the busFilter function defined above.        
    }
    
    request.send()
  }
};
