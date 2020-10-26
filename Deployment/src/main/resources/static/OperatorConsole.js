var stompClient = null;

const entrystands = new Map()
const exitstands = new Map()

var vm = new Vue({
	el: '#main-content',
	data: {
	    DateTime: "",
	    Capacity: "",
	    Occupancy: "",
	    Availability: ""
    }
})

const EntryStand = {
  template: '#entry-console-display',
  data: function () {
    return {
      location: 'North',
      activated: false,
      ticketStatus: 'not requested',
      barrier: 'closed',
      delayed: false
    }
  },
  methods: {
    setLocation: function(location) {
      this.location = location;
    },
    setActive(activated) {
      this.activated = activated;
    },
    setTicketStatus(ticketStatus) {
      this.ticketStatus = ticketStatus;
    },
    setBarrier(barrier) {
      this.barrier = barrier;
    },
    setDelayed(delayed) {
      this.delayed = delayed;
    }
  }
}

const ExitStand = {
  template: '#exit-console-display',
  data: function () {
    return {
      location: 'wayout',
      activated: false,
      ticketStatus: 'none',
      exitDeadline: 'None',
      barrier: 'stuck',
      ticketNumber: '',
      additionalCharge: '',
      overstay: '',
      charge: '',
      duration: '', 
      tardyExit: false,
      unpaidStayExit: false
    }
  },
  methods: {
    setLocation: function(location) {
      this.location = location;
    },
    setActive(activated) {
      this.activated = activated;
    },
    setTicketStatus(ticketStatus) {
      this.ticketStatus = ticketStatus;
    },
    setExitDeadline(deadline) {
      this.exitDeadline = deadline;
    },
    setBarrier(barrier) {
      this.barrier = barrier;
    },
    setTicketNumber(number) {
      this.ticketNumber = number;
    },
    setAdditionalCharge(amount) {
      this.additionalCharge = amount;
    },
    setOverstay(amount) {
      this.overstay = amount;
    },
    setCharge(amount) {
      this.charge = amount;
    },
    setDuration(amount) {
      this.duration = amount;
    },
    setTardyExit(condition) {
      this.tardyExit = condition;
    },
    setUnpaidStayExit(condition) {
      this.unpaidStayExit = condition;
    }
  }
}

function initialize() {
	vm.DateTime = "";
	vm.Capacity = "";
	vm.Occupancy = "";
	vm.Availability = "";
}

function makeEntry(location) {
    const entryClass = Vue.extend(EntryStand);
    var theEntry = new entryClass;
    entry = theEntry.$mount();
    document.getElementById('entry-consoles').appendChild(theEntry.$el);
    entry.setLocation(location);
    entrystands.set( entry.location, entry )
}

function makeExit(location) {
    const exitClass = Vue.extend(ExitStand);
    var theExit= new exitClass;
    exit = theExit.$mount();
    document.getElementById('exit-consoles').appendChild(theExit.$el);
    exit.setLocation(location)
    exitstands.set( exit.location, exit )
}

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    }
    else {
        $("#conversation").hide();
        initialize();
    }
    $("#replies").html("");
}

// When connecting, subscribe to a location-specific topic to receive
// messages sent from the server.
function connect() {
    var socket = new SockJS('/Carpark-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/OperatorConsole', function (reply) {
            handleReply(reply);
        });
    });
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

// Client-to-server messages.
function sendToServer( messageName, paramName, paramValue ) {
	var messageBody = {};
	messageBody[paramName] = paramValue;
    stompClient.send("/app/" + messageName, {}, JSON.stringify( messageBody ));
}

// Display a message received from the server and
// update data as necessary.
function handleReply(reply) {
    var location ="";
    var barrier = "";
    var ticketStatus = "";
    var visible = false;
    var ticketNumber = "";
    var exitDeadline = "";
    var amount = "";
    var duration = "";
    var peripheral = "";
   
    var messageName = JSON.parse( reply.body ).messageName;
    if ( messageName !== "DateTimeUpdate" ) {
        $("#replies").append("<tr><td>" + JSON.stringify( JSON.parse( reply.body ) ) + "</td></tr>");
    }

    if ( messageName == "Register" ) {
    	location = JSON.parse( reply.body ).location;
    	peripheral = JSON.parse( reply.body ).peripheral;
    	if ( peripheral == "Entry" ) {
    	  if ( ! entrystands.has( location ) ) {
    	      makeEntry(location);
    	  }
    	} else if ( peripheral == "Exit" ) {
    	  if ( ! exitstands.has( location ) ) {
    	      makeExit(location);
    	  }
    	}
    }
    
    // Instance-specific messages.
    if ( messageName == "ActivateEntryStand" ) {
    	location = JSON.parse( reply.body ).location;
    	barrier = JSON.parse( reply.body ).barrier;
    	ticketStatus = JSON.parse( reply.body ).ticket;
    	entry = entrystands.get(location);
    	if ( entry ) {
    	  entry.setTicketStatus(ticketStatus);
    	  entry.setBarrier(barrier);
    	  entry.setActive(true);
    	}
    } else if ( messageName == "ActivateExitStand" ) {
    	location = JSON.parse( reply.body ).location;
    	barrier = JSON.parse( reply.body ).barrier;
    	exitDeadline = JSON.parse( reply.body ).exitDeadline;
    	exit = exitstands.get(location);
    	if ( exit ) {
    	  exit.setTicketStatus(ticketStatus);
    	  exit.setBarrier(barrier);
    	  exit.setExitDeadline(exitDeadline);
    	  exit.setActive(true);
    	}
    } else if ( messageName == "DeactivateEntryStand" ) {
    	location = JSON.parse( reply.body ).location;
    	entry = entrystands.get(location);
    	if ( entry ) {
    	  entry.setActive(false);
    	  entry.setDelayed(false);
    	}
    } else if ( messageName == "DeactivateExitStand" ) {
    	location = JSON.parse( reply.body ).location;
    	exit = exitstands.get(location);
    	if ( exit ) {
    	  exit.setActive(false);
    	  exit.setTardyExit(false);
    	  exit.setUnpaidStayExit(false);
    	}
    } else if ( messageName == "DelayedEntry" ) {
    	location = JSON.parse( reply.body ).location;
    	entry = entrystands.get(location);
    	if ( entry ) {
    	  entry.setDelayed(true);
    	}
    } else if ( messageName == "TardyExit" ) {
    	location = JSON.parse( reply.body ).location;
    	ticketNumber = JSON.parse( reply.body ).ticketNumber;
    	amount = Number( JSON.parse( reply.body ).additionalCharge ).toFixed(2);
    	duration = Number( JSON.parse( reply.body ).overstay ).toFixed(2);
     	exit = exitstands.get(location);
    	if ( exit ) {
    	  exit.setTicketNumber(ticketNumber);
    	  exit.setAdditionalCharge(amount);
    	  exit.setOverstay(duration);
    	  exit.setTardyExit(true);
    	}
    } else if ( messageName == "UnpaidStayExit" ) {
    	location = JSON.parse( reply.body ).location;
    	ticketNumber = JSON.parse( reply.body ).ticketNumber;
    	amount = Number( JSON.parse( reply.body ).charge ).toFixed(2);
    	duration = Number( JSON.parse( reply.body ).duration ).toFixed(2);
     	exit = exitstands.get(location);
    	if ( exit ) {
    	  exit.setTicketNumber(ticketNumber);
    	  exit.setCharge(amount);
    	  exit.setDuration(duration);
    	  exit.setUnpaidStayExit(true);
    	}
    // Non-instance-specific.
    } else if ( messageName == "OccupancyUpdate" ) {
    	vm.Occupancy = JSON.parse( reply.body ).occupancy;
    	vm.Capacity = JSON.parse( reply.body ).capacity;
    	vm.Availability = JSON.parse( reply.body ).availability;
    } else if ( messageName == "DateTimeUpdate" ) {
    	vm.DateTime = JSON.parse( reply.body ).dateTime;
    }
}


// Act on instance button clicks
function OpenEntry( element ) {
  parent = element.parentNode;  // Seek to identify which instance owns the button that was clicked.
  for ( entry of entrystands.values() ) {
    if ( entry.$el == parent ) {
      sendToServer( "OpenEntryBarrier", "location", entry.location );
      break;
    }
  }
}

function IssueTicket( element ) {
  parent = element.parentNode;
  for ( entry of entrystands.values() ) {
    if ( entry.$el == parent ) {
      sendToServer( "OperatorIssueTicket", "location", entry.location );
      break;
    }
  }
}

function OpenExit( element ) {
  parent = element.parentNode;
  for ( exit of exitstands.values() ) {
    if ( exit.$el == parent ) {
      sendToServer( "OpenExitBarrier", "location", exit.location );
      break;
    }
  }
}

function FeeWaived( element ) {
  parent = element.parentNode.parentNode;
  for ( exit of exitstands.values() ) {
    if ( exit.$el == parent ) {
      sendToServer( "FeeWaived", "ticketNumber", exit.ticketNumber );
      break;
    }
  }
}

function FeeCollected( element ) {
  parent = element.parentNode.parentNode;
  for ( exit of exitstands.values() ) {
    if ( exit.$el == parent ) {
      sendToServer( "FeeCollected", "ticketNumber", exit.ticketNumber );
      break;
    }
  }
}

// Map non-instance buttons to functions.
$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#connect" ).click(function() { connect(); });
    $( "#disconnect" ).click(function() { disconnect(); });
});