class Bus{
	constructor(busNumber, timeToStation) {
		this.busNumber = busNumber;
		this.timeToStation = timeToStation;
	}

	showBusData() {
		return "Bus " + this.busNumber + " will arrive in " + this.timeToStation + " minutes."; 
	};


};

module.exports = Bus;
