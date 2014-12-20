function uspesno() {
	var datum = $("#datetimepicker1 input").val();
	var vrednost = $("#vrednost").val();
 
	if (datum == "" || vrednost == "") {
		$("#label").html("");
		$("#label").append('<span class="label label-danger" id="izpis" style="padding: 5px"></span>');
		$("#izpis").text("Izpolnite obvezna polja.");
		return;
	}

 	if(isNaN(vrednost) == true) {
 		$("#label").html("");
		$("#label").append('<span class="label label-warning" id="izpis" style="padding: 5px"></span>');
		$("#izpis").text("V polje za meritev vnesite samo število opravljene meritve.");
		return;
 	}

 	var datumReg = datum.match(/([0-9][0-9]\/)+[0-9]{4} [0-9]:[0-9]{2} ((PM)|(AM))/g);

 	if (datumReg != datum) {
 		$("#label").html("");
		$("#label").append('<span class="label label-warning" id="izpis" style="padding: 5px"></span>');
		$("#izpis").text("Datum izberite iz izbirnega polja.");
 		return;
 	}

	$("#label").html("");
	$("#label").append('<span class="label label-success" id="izpis" style="padding: 5px"></span>');
	$("#izpis").text("Uspešno ste vnesli vrednost " + vrednost + " za dan " + datum.toString());
	
}

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
	    		if (data.party.gender === "FEMALE"){
	    			$("#ime").html("");
	    			$("#ime").append('<p style="font-size:20px; color: #b7337a" id="imePacienta"></p>');
	    			$("#imePacienta").text(data.party.firstNames + " " + data.party.lastNames);
	    		} else {
	    			$("#ime").html("");
	    			$("#ime").append('<p style="font-size:20px; color: #339bb7" id="imePacienta"></p>');
					$("#imePacienta").text(data.party.firstNames + " " + data.party.lastNames);
	    		}
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
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom,
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

				    			var AQL = 
									"select "+
									    "bp/data[at0001]/events[at0006]/time/value as time, "+
									    "bp/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude as Systolic_magnitude, "+
									    "bp/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/magnitude as Diastolic_magnitude, "+
									    "bp/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/units as Systolic_units "+
									"from EHR e[e/ehr_id/value='" + ehrId + "']"+
									"contains OBSERVATION bp[openEHR-EHR-OBSERVATION.blood_pressure.v1] "+
									"where bp/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude>140 and bp/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/magnitude>85"
									"limit 10";
						    	$.ajax({
								    url: baseUrl + "/query?" + $.param({"aql": AQL}),
								    type: 'GET',
								    headers: {"Ehr-Session": sessionId},
								    success: function (res) {
							    	var rows = res.resultSet;
							    	if (rows.length != 0) {
								    	$("#tlak").html("");
								    	$("#tlak").append('<span class="label label-danger" id="tlak_text" style = "border-radius: 10px" ></span>');
								    	$("#tlak_text").text("Povišan tlak");
								    }
								    },
								    error: function() {
								    	$("#tlak").html("");
								    	$("#tlak").append('<span class="label label-default" id="tlak_text"></span>');
								    	$("#tlak_text").text("error");
								    }
								});

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
	$(".link2").each(function() {
		$(this).attr("href", $(this).attr("href") + "?id=" + urlID); 
	});
	
	localStorage.removeItem("test1");
	localStorage.removeItem("test2");
	localStorage.removeItem("test3");
	
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
							merilec: ["Tanja Recek", "Marjeta Gorišek", "Tanja Recek", "Tanja Recek", "Marjeta Gorišek", "Tanja Recek", "Tanja Recek", "Tanja Recek", "Marjeta Gorišek", "Tanja Recek"],
						};

			kreirajEHRzaBolnika("Ana", "Novak", new Date(1972, 10, 6), "FEMALE");
			$("#ks").text("A");
			$("#allergy").text("Cvetni prah, Dišave");
			$("#b1").text("Sladkorna bolezen (diabetes)");
			$("#b2").text("Norice");
			$("#b3").text("Rdečke");
			$("#b4").text("Mononukleoza");
			$("#z1").text("Lekadol");
			$("#z2").text("Naprosyn");
			$("#z3").text("Septolete");
			$("#navodila1").text("Če imate sladkorno bolezen tipa 1, vam lahko zdravnik priporoča merjenje glukoze 3-krat dnevno pred obroki in po določenih obrokih, pred telesno dejavnostjo in po njej ter pred spanjem. Morda pa potrebujete izvajanje meritev še pogosteje, če ste npr. bolni ali če spremenite dnevni ritem zdravljenja ali jemanja zdravil.");
			$("#navodila2").text("Če vodite vašo sladkorno bolezen tipa 2 samo z dieto in s telesno dejavnostjo, lahko potrebujete meritev glukoze v krvi le enkrat dnevno. Če prejemate tablete, torej če se zdravite z inzulinom ali s čim drugim za vodenje sladkorne bolezni tipa 2, vam lahko zdravnik priporoča še pogostejša merjenja glukoze.");
			$("#navodila0").text("Pravilna izvedba meritve glukoze v krvi");
			var besedilo = ["1. Temeljito umijemo roke", "2. Roke dobro osušimo", "3. S prožilno napravo se zbodemo in oblikujemo kapljico krvi", " 4. Prvo kapljico krvi obrišemo s čistim zložencem", "5. Ponovno oblikujemo kapljico krvi", "6. V kapljico pomočimo konico testnega lističa in počakamo, da merilnik zapiska", "7. Kapljico krvi obrišemo z zložencem in počakamo na rezultat meritve"]
			for (var i = 0; i < besedilo.length; i++) {
				$("#navodila3").append(besedilo[i] + "<br/>");
			}


			localStorage.setItem("test1", ehrId);

			for (var i = 0; i < t1.teza.length; i++) {
				dodajMeritveVitalnihZnakov(t1.datum[i], t1.visina[i], t1.teza[i], t1.temperatura[i], t1.sTlak[i], t1.dTlak[i], t1.nasicenostKrvi[i], t1.merilec[i]);
			}

	
		}
		else if (urlID === "test2") {
			var t2 = {teza: [80.3, 85.6, 87.9, 85.4, 86.3, 82.2, 77.8, 76.9, 76.2, 74.1],
					visina: [181, 181, 180, 181, 181, 180, 180, 181, 180, 180],
					sTlak: [120, 122, 130, 135, 140, 140, 150, 145, 144, 142],
					dTlak: [70, 72, 68, 70, 75, 82, 80, 90, 75, 78],
					datum: [new Date(2000, 4, 7, 9, 0, 2), new Date(2001, 7, 7, 11, 30, 14), new Date(2002, 7, 12, 9, 15, 35), new Date(2003, 7, 17, 9, 6, 22), new Date(2004, 3, 2, 15, 25, 7), new Date(2004, 9, 5, 9, 4, 58), new Date(2005, 1, 11, 10, 1, 42), new Date(2005, 4, 5, 10, 30, 27), new Date(2005, 9, 3, 9, 30, 51), new Date(2006, 1, 8, 9, 45, 37)],
					temperatura: [36.8, 36.6, 38.0, 36.9, 36.7, 37.1, 37.3, 37.4, 37.0, 36.9],
					nasicenostKrvi: [99.6, 98.5, 98.3, 99.3, 99.0, 98.5, 97.9, 97.7, 98.7, 98.0],
					merilec: ["Barbara Vidic", "Barbara Vidic", "Barbara Vidic", "Monika Zalokar", "Barbara Vidic", "Barbara Vidic", "Monika Zalokar", "Barbara Vidic", "Barbara Vidic", "Barbara Vidic"]
			};

			kreirajEHRzaBolnika("Janez", "Novak", new Date(1956, 6, 23), "MALE");
			$("#ks").text("B");
			$("#allergy").text("Penicilin, oreščki");
			$("#b1").text("Hipertenzija");
			$("#b2").text("Norice");
			$("#b3").text("Angina");
			$("#b4").text("Viroza");
			$("#z1").text("Lekadol");
			$("#z2").text("Septolete");
			$("#z3").text("Aspirin");
			$("#navodila1").text("Običajno krvni tlak merimo sede. Vsaj prvič ga je treba izmeriti na obeh rokah. Manjše razlike v krvnem tlaku med obema rokama so povsem normalen pojav. Ponavadi je pri desničarjih krvni tlak rahlo višji na desni roki, pri levičarjih pa na levi roki. Običajno ga merimo na tisti roki, kjer je krvni tlak višji.");
			$("#navodila2").text("V zdravnikovi ordinaciji je normalen krvni tlak pod 140/90 mmHg. Optimalen je krvni tlak pod 120/80 mmHg, sistolične vrednosti med 130 do 139 mmHg ter diastolične vrednosti med 85 in 89 mmHg pa sodijo v kategorijo visoko normalnega krvnega tlaka. Pri meritvah krvnega tlaka doma je meja med normalnim in zvišanim krvnim tlakom nekoliko nižja, 135/85 mmHg.");
			$("#navodila0").text("");
			localStorage.setItem("test2", ehrId);

			for (var i = 0; i < t2.teza.length; i++) {
				dodajMeritveVitalnihZnakov(t2.datum[i], t2.visina[i], t2.teza[i], t2.temperatura[i], t2.sTlak[i], t2.dTlak[i], t2.nasicenostKrvi[i], t2.merilec[i]);
			}
		}
		else if (urlID === "test3") {
			var t3 = {teza: [6, 8, 10, 13, 16, 17, 20, 22, 25, 28],
					visina: [51.5, 52.2, 53.5, 56.5, 58.4, 59.4, 59.6, 60.0, 62.2, 66.5],
					sTlak: [80, 81, 85, 88, 91, 94, 95, 94, 96, 99],
					dTlak: [34, 35, 38, 40, 42, 46, 46, 48, 48, 48],
					datum: [new Date(2007, 1, 6, 15, 1, 24), new Date(2007, 7, 8, 14, 30, 31), new Date(2007, 9, 2, 14, 15, 11), new Date(2008, 4, 17, 15, 24, 44), new Date(2008, 7, 12, 14, 18, 47), new Date(2008, 9, 29, 15, 37, 59), new Date(2009, 10, 20, 14, 22, 38), new Date(2009, 12, 15, 14, 33, 17), new Date(2010, 9, 6, 10, 31, 25), new Date(2012, 4, 8, 9, 45, 37)],
					temperatura: [37.5, 38.3, 38.5, 38.0, 37.3, 36.8, 36.9, 36.6, 36.9, 37.0],
					nasicenostKrvi: [99.5, 99.3, 97.5, 98.2, 97.5, 98.6, 99.2, 99.0, 98.6, 97.9],
					merilec: ["Breda Ravnikar", "Breda Ravnikar", "Breda Ravnikar", "Breda Ravnikar", "Breda Ravnikar", "Breda Ravnikar", "Breda Ravnikar", "Breda Ravnikar", "Breda Ravnikar", "Breda Ravnikar"]
			};

			kreirajEHRzaBolnika("Jan", "Medved", new Date(2007, 5, 18), "MALE");
			$("#ks").text("AB");
			$("#allergy").text("Mleko");
			$("#b1").text("Norice");
			$("#b2").text("Angina");
			$("#b3").text("Viroza");
			$("#b4").text("Slabovidnost");
			$("#b5").text("Prekomerna telesna teža");
			$("#z1").text("Lekadol");
			$("#z2").text("Ospen");
			$("#z3").text("Aspirin");
			$("#navodila1").text("Pred vsako fizično vadbo se je treba primerno ogreti. Od glave do gležnjev nekajkrat upognite vsak sklep (ali pa tudi zakrožite v vsako smer v njih). Dobro je ogreti tudi mišice. Priporočljivo je kakšno minuto ali dve teči (lahko tudi na mestu), počasi narediti nekaj počepov in nekaj sklec. Tako telo pripravite na prihajajoč napor in močno zmanjšate možnost poškodb.");
			$("#navodila2").text("Vaje je treba delati v primerni obutvi in na primerni podlagi. Mehkejša podlaga je boljša, da pri skokih kolena manj trpijo in pri trebušnjakih ni toliko pritiska na trtico. Gibov ne izvajajte sunkovito ampak zvezno. Pri prednjih izpadnih korakih pazite, da ne boste šli s kolenom čez ravnino prstov na nogi, ker tako prihaja do močne obremenitve kolenskih sklepov.");
			$("#navodila0").text("");
			localStorage.setItem("test3", ehrId);

			for (var i = 0; i < t3.teza.length; i++) {
				dodajMeritveVitalnihZnakov(t3.datum[i], t3.visina[i], t3.teza[i], t3.temperatura[i], t3.sTlak[i], t3.dTlak[i], t3.nasicenostKrvi[i], t3.merilec[i]);
			}
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