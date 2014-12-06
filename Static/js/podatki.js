$(document).ready(function() {
	
	var baseUrl = 'https://rest.ehrscape.com/rest/v1';
	var queryUrl = baseUrl + '/query';

	var username = "ois.seminar";
	var password = "ois4fri";

	var ehrId = null;

	function getSessionId() {
	    var response = $.ajax({
	        type: "POST",
	        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
	                "&password=" + encodeURIComponent(password),
	        async: false
	    });
    	return response.responseJSON.sessionId;
	}

	function getParameterByName(name) {
	    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function kreirajEHRzaBolnika(ime, priimek, datumRojstva, spol) {
	sessionId = getSessionId();

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    async: false,
		    success: function (data) {
		        ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            gender: spol,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            async: false,
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#kreirajSporocilo").html("<span class='obvestilo label label-success fade-in'>Uspešno kreiran EHR '" + ehrId + "'.</span>");
		                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
		                    $("#preberiEHRid").val(ehrId);
		                }
		            },
		            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
	}
}

function preberiEHRodBolnika() {
	sessionId = getSessionId();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				$("#imePacienta").text(data.party.firstNames + " " + data.party.lastNames);
				$("#datumRojstva").text(moment(data.party.dateOfBirth).format("D.M.YYYY"));
				$("#starost").text(Math.floor(moment.duration(moment().diff(data.party.dateOfBirth)).asYears()));
				$("#spol").text(data.party.gender === "FEMALE" ? "Ženski" : "Moški");
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}	
}

function dodajMeritveVitalnihZnakov(datumInUra, telesnaVisina, telesnaTeza, telesnaTemperatura, sistolicniKrvniTlak, diastolicniKrvniTlak, nasicenostKrviSKisikom, merilec) {
	sessionId = getSessionId();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    "ehrId": ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: merilec
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    async: false,
		    success: function (res) {
		    	console.log(res.meta.href);
		        $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
		    }
		});
	}
}

function preberiMeritveVitalnihZnakov(tip) {
	sessionId = getSessionId();	

	if (!ehrId || ehrId.trim().length == 0 || !tip || tip.trim().length == 0) {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;	
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + tip,
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (tip == "height" && res.length > 0) {
				    			var data = [];
				    			for (var i = 0; i < res.length; i++) {
				    				data.unshift({x: res[i].time, y: res[i].height});
				    			}
						          nv.addGraph(function() {
								    var chart = nv.models.multiBarChart()
								      .height(250)
								      .transitionDuration(350)
								      .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
								      .rotateLabels(0)      //Angle to rotate x-axis labels.
								      .showControls(false)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
								      .groupSpacing(0.1)    //Distance between each group of bars.
								      .showLegend(false)
								      .margin({top: 30, right: 25, bottom: 50, left: 100})
								    ;

								    chart.xAxis
								        .tickFormat(function (t) { return moment(new Date(t)).format("D.M.YYYY"); });

								    chart.yAxis
								        .tickFormat(d3.format(',.1f'))
								        .axisLabel("Telesna višina (cm)");

								    d3.select('#' + tip)
								        .datum([{key: "Višina", values: data}])
								        .call(chart);

								    nv.utils.windowResize(chart.update);

								    return chart;
									});
						    } else if (tip == "weight" && res.length > 0) {
						    	var data = [];
				    			for (var i = 0; i < res.length; i++) {
				    				data.unshift({x: res[i].time, y: res[i].weight});
				    			}
						          nv.addGraph(function() {
								    var chart = nv.models.multiBarChart()
								      .height(250)
								      .transitionDuration(350)
								      .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
								      .rotateLabels(0)      //Angle to rotate x-axis labels.
								      .showControls(false)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
								      .groupSpacing(0.1)    //Distance between each group of bars.
								      .showLegend(false)
								      .margin({top: 30, right: 25, bottom: 50, left: 100})
								    ;

								    chart.xAxis
								        .tickFormat(function (t) { return moment(new Date(t)).format("D.M.YYYY"); });

								    chart.yAxis
								        .tickFormat(d3.format(',.1f'))
								        .axisLabel("Telesna teža (kg)");

								    d3.select('#' + tip)
								        .datum([{key: "Teža", values: data}])
								        .call(chart);

								    nv.utils.windowResize(chart.update);

								    return chart;
									});
						    } else if (tip == "blood_pressure" && res.length > 0) {
						    	var data1 = []; //sPressure
						    	var data2 = []; //dPressure
				    			for (var i = 0; i < res.length; i++) {
				    				data1.push({x: moment(res[i].time).format("D.M.YYYY"), y: res[i].systolic});
				    				data2.push({x: moment(res[i].time).format("D.M.YYYY"), y: res[i].diastolic});
				    			}

								  nv.addGraph(function() {
								    var chart = nv.models.multiBarHorizontalChart()
								        .x(function(d) { return d.x })
								        .y(function(d) { return d.y })
								        .margin({top: 30, right: 25, bottom: 50, left: 65})
								        .showValues(false)           //Show bar value next to each bar.
								        .tooltips(true)             //Show tooltips on hover.
								        .transitionDuration(350)
								        .showControls(false);        //Allow user to switch between "Grouped" and "Stacked" mode.

								    chart.yAxis
								         .tickFormat(d3.format(',.2f'))

								    d3.select('#' + tip)
								        .datum([{key: "Sistolični tlak", values: data1}, {key: "Diastolični tlak", values: data2}])
								        .call(chart);

								    nv.utils.windowResize(chart.update);

								    return chart;
								  });
						    } else if (tip == "body_temperature" && res.length > 0) {
						    	var data = [];
						    	for (var i = 0; i < res.length; i++) {
				    				data.unshift({x: new Date(res[i].time), y: res[i].temperature});
				    			}

								nv.addGraph(function() {
								    var chart = nv.models.lineChart()
								                  .x(function(d) { return d.x })
								                  .y(function(d) { return d.y }) //adjusting, 100% is 1.00, not 100 as it is in the data
								                  .color(d3.scale.category10().range())
								                  .useInteractiveGuideline(true)
								                  .margin({top: 30, right: 25, bottom: 50, left: 40})
								                  ;

								    chart.xAxis
								        .tickFormat(function (t) { return moment(t).format("D.M.YYYY"); });

								    //chart.yAxis
								        //.tickFormat(d3.format(',.1%'));

								    d3.select('#' + tip)
								        .datum([{key: "Temperatura", values: data}])
								        .call(chart);

								    nv.utils.windowResize(chart.update);

								    return chart;
							  	});
						    } else if (tip == "spO2" && res.length > 0) {
						    	var data = [];
						    	for (var i = 0; i < res.length; i++) {
				    				data.unshift({x: new Date(res[i].time), y: res[i].spO2});
				    			}

				    			nv.addGraph(function() {
								    var chart = nv.models.stackedAreaChart()
								                  .margin({right: 100})
								                  .x(function(d) { return d.x })   //We can modify the data accessor functions...
								                  .y(function(d) { return d.y })   //...in case your data is formatted differently.
								                  .useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
								                  .rightAlignYAxis(false)      //Let's move the y-axis to the right side.
								                  .transitionDuration(500)
								                  .showControls(false)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
								                  .clipEdge(true)
								                  .margin({top: 30, right: 25, bottom: 50, left: 40});

								    //Format x-axis labels with custom function.
								    chart.xAxis
								    	.tickFormat(function (t) { return moment(t).format("D.M.YYYY"); });

								    chart.yAxis
								        .tickFormat(d3.format(',.2f'));

								    d3.select('#' + tip)
								      .datum([{key: "Nasičenost krvi s kisikom", values: data}])
								      .call(chart);

								    nv.utils.windowResize(chart.update);

								    return chart;
								  });
						    }
					    },
					    error: function(err) {
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
	    	},
	    	error: function(err) {
	    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}
		});
	}
}

	var urlID = getParameterByName("id");
	
	function narediBolnika(urlID) {
		if (localStorage.getItem("test1") != null) {
			ehrId = localStorage.getItem("test1");
			return ;
		}

		if (localStorage.getItem("test2") != null) {
			ehrId = localStorage.getItem("test2");
			return ;
		}

		if (localStorage.getItem("test3") != null) {
			ehrId = localStorage.getItem("test3");
			return ;
		}

		if (urlID === "test1") {
			var t1 = {teza: [46.1, 49, 48.1, 49.8, 46.8, 47.6, 48.5, 49.8, 50.5, 51.2],
							visina: [160.2, 160.6, 161, 161.8, 162.3, 163, 164.2, 164.1, 164.2, 164],
							sTlak: [96, 98, 100, 97, 110, 98, 99, 88, 105, 111],
							dTlak: [70, 65, 55, 80, 66, 56, 71, 50, 66, 68],
							datum: [new Date(1985, 6, 2, 15, 33, 4), new Date(1989, 4, 11, 12, 11, 3), new Date(1993, 2, 3, 11, 10, 43), new Date(1995, 5, 12, 13, 23, 34), new Date(1998, 9, 23, 14, 35, 35), new Date(2003, 10, 14, 10, 24, 51), new Date(2005, 5, 11, 11, 16, 28), new Date(2008, 10, 24, 13, 5, 45), new Date(2011, 9, 3, 14, 23, 3), new Date(2013, 2, 4, 9, 15, 22)],
							temperatura: [36.6, 36.7, 37.8, 36.6, 38.9, 36.7, 36.6, 38.5, 38.7, 36.6],
							nasicenostKrvi: [96.8, 98.2, 95.7, 99.3, 94.7, 98.4, 97.8, 96.1, 96.9, 99.7],
							merilec: ["Tanja Recek", "Marjeta Gorišek", "Tanja Recek", "Tanja Recek", "Marjeta Gorišek", "Tanja Recek", "Tanja Recek", "Tanja Recek", "Marjeta Gorišek", "Tanja Recek"]
						};

			kreirajEHRzaBolnika("Ana", "Novak", new Date(1972, 10, 6), "FEMALE");
			localStorage.setItem("test1", ehrId);

			for (var i = 0; i < t1.teza.length; i++) {
				dodajMeritveVitalnihZnakov(t1.datum[i], t1.visina[i], t1.teza[i], t1.temperatura[i], t1.sTlak[i], t1.dTlak[i], t1.nasicenostKrvi[i], t1.merilec[i]);
			}

	
		}
		else if (urlID === "test2") {
			kreirajEHRzaBolnika("Janez", "Novak", new Date(1956, 6, 23), "MALE");
			localStorage.setItem("test2", ehrId);
		}
		else if (urlID === "test3") {
			kreirajEHRzaBolnika("Jan", "Medved", new Date(2007, 5, 18), "MALE");
			localStorage.setItem("test3", ehrId);
		}
	}
	
	narediBolnika(urlID);
	preberiEHRodBolnika();
	preberiMeritveVitalnihZnakov("height");
	preberiMeritveVitalnihZnakov("weight");
	preberiMeritveVitalnihZnakov("blood_pressure");
	preberiMeritveVitalnihZnakov("spO2");
	preberiMeritveVitalnihZnakov("body_temperature");

}); 