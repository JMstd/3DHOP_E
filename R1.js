
var start=0;
var name="";
var myurl="";
var mdI="";
var stMinD=0;
var stMaxD=0;
var stMinT=0;
var stMaxT=0;
var _PanX = 0.0;
var ANNOTATIONDATA ={};
var tipo_hs="Sphere";
var url_hs="models/singleres/sphere.ply";
// prate rilevante da prendere da json --> HOTSPOTDATA
//var radius_hs=0;
//var position_hs=[];
var HOTSPOTSDATA ={};

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    var myObj = JSON.parse(this.responseText);
    ANNOTATIONDATA= myObj;
  }
};
xmlhttp.open("GET", "test.json", false);
xmlhttp.send();

//*********************************************************************************************************************
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    var myObj = JSON.parse(this.responseText);
    HOTSPOTSDATA= myObj;
  }
};
xmlhttp.open("GET", "hotspots.json", false);
xmlhttp.send();

/********************************Set data from JSON*************************************/
//eventualmente può avere senso settare dei valori di default, per rendere visibile il modello, in modo che se , l'utente non inserisce nulla, vengano presi quelli. Altrimenti qui sotto si reinseriscono i valor scelti dall'utente.
name= ANNOTATIONDATA.name;
mdI= ANNOTATIONDATA.mdI;
myurl= ANNOTATIONDATA.url;
start= ANNOTATIONDATA.start;
stMinT= ANNOTATIONDATA.minMaxTheta[0];
stMaxT= ANNOTATIONDATA.minMaxTheta[1];
stMinD= ANNOTATIONDATA.minMaxDist[0];
stMaxD= ANNOTATIONDATA.minMaxDist[1];
_PanX= ANNOTATIONDATA.PanX;

// hotspotdata 
//radius_hs = HOTSPOTSDATA.annotations[0].radius;
//position_hs = HOTSPOTSDATA.annotations[0].position;
var cont={};
//	if(!presenter._scene) return;
//	presenter._scene.spots = {};
//	presenter._spotsProgressiveID = 10;	// reset to avoid accumulation
	for (var ii = 0; ii < HOTSPOTSDATA.annotations.length; ii++)
	{
		var pos = HOTSPOTSDATA.annotations[ii].position
		var radius = HOTSPOTSDATA.annotations[ii].radius;
		var newSpot = {
			mesh      : tipo_hs,
			color     : [ 0.0, 0.25, 1.0 ],
			transform : { 
				matrix:
					SglMat4.mul(SglMat4.translation(pos), 
					SglMat4.scaling([radius, radius, radius]))
				},
		};
		cont[HOTSPOTSDATA.annotations[ii].name] = newSpot;
	}
//	presenter._scenePrepare();
//	presenter.repaint();

// fine hotspotdata

/*
$.getJSON('test.json', function (data, textStatus, jqXHR){
    ANNOTATIONDATA=data;
});

/*    
    $.get("test.json", function(data, status){
      alert("Data: " + data + "\nStatus: " + status);
      ANNOTATIONDATA = data;
    });
/*
const Url = "test.json";
$('#toolbar').ready(function(){
	$.get(Url, function(data, status){
		ANNOTATIONDATA = data;
	});
});*/
// ATT /_\ l'errore json è dato dal fatto che l'estensione del file è json e non txt

function actionsToolbar(action) {
	if(action=='home') presenter.resetTrackball();
		else if(action=='zoomin') presenter.zoomIn();
		else if(action=='zoomout') presenter.zoomOut();
		else if(action=='lighting' || action=='lighting_off') {
			if (action=='lighting'){
				lightSwitchL('light_off');
			}
			presenter.enableSceneLighting(!presenter.isSceneLightingEnabled()); lightingSwitch();
		}
		else if(action=='light') lightSwitchL('light');
		else if(action=='light_off') lightSwitchL('light_off');		
		//--COLOR--	
			else if(action=='color' || action=='color_on') { presenter.toggleInstanceSolidColor(HOP_ALL, true); colorSwitch(); } 
		//--COLOR--	
		else if(action=='perspective' || action=='orthographic') { presenter.toggleCameraType(); cameraSwitch(); }
		else if(action=='hotspot'|| action=='hotspot_on') { presenter.toggleSpotVisibility(HOP_ALL, true); presenter.enableOnHover(!presenter.isOnHoverEnabled()); hotspotSwitch(); }
		else if(action=='measure' || action=='measure_on') { presenter.enableMeasurementTool(!presenter.isMeasurementToolEnabled()); measureSwitch(); } 
		else if(action=='full' || action=='full_on') fullscreenSwitch();
		else if(action=='move_up' || 'move_dawn' || 'move_right' || 'move_left') step(action);
	}
// start menager of arrows movement
function step(action){
	var my_pos = [];
	my_pos = presenter.getTrackballPosition();

	switch(action) {
		case 'move_up'   : 	
			my_pos[3]-=0.1;
			presenter.animateToTrackballPosition(my_pos);
			break;
		case 'move_dawn' :
			my_pos[3]+=0.1;
			presenter.animateToTrackballPosition(my_pos);
			break;
/*		case 'move_right' : 
			my_pos[2]-=0.1;
			presenter.animateToTrackballPosition(my_pos);
			break;
		case 'move_left' :	
			my_pos[2]+=0.1;
			presenter.animateToTrackballPosition(my_pos);
			break;
*/	
	}
}
// end menager of arrows movement

function log(msg) {
	document.getElementById("log-text").innerHTML += msg + "\n";
	document.getElementById("log-text").scrollTop = document.getElementById("log-text").scrollHeight; 
}

function lightSwitchL(status) {

	if(status == 'light'){
		$('#light').css("visibility", "hidden");
	    $('#light_off').css("visibility", "visible");
	    $('#lighting_off').css("visibility", "hidden");	//manage lighting combined interface
	    $('#lighting').css("visibility", "visible");	//manage lighting combined interface

		$('#lightcontroller').css('left', ($('#light').position().left + $('#light').width() + $('#toolbar').position().left + 25));
		$('#lightcontroller').css('top', ($('#light').position().top + $('#toolbar').position().top - 25));

		presenter.enableSceneLighting('lighting_off');
		lightingSwitch('lighting_off');
	}
	else{
    	$('#light_off').css("visibility", "hidden");
    	$('#light').css("visibility", "visible");
    	
    	$('#lightcontroller').css('left', ($('#lightcontroller').position().left - 250));
   }
}

// start lightController functions ---------------------------------------------------------------------------------------------
function click_lightcontroller(event) {
	var XX=0, YY=0;
	var midpoint = [63,63];
	var radius = 60;

	var lightControllerCanvas = document.getElementById("lightcontroller_canvas");
	var coords = lightControllerCanvas.relMouseCoords(event);

	XX = coords.x - midpoint[0];
	YY = coords.y - midpoint[1];

	// check inside circle
	if((XX*XX + YY*YY) < ((radius-5)*(radius-5))) {
		var lx = (XX / radius)/2.0;
		var ly = (YY / radius)/2.0;

		presenter.rotateLight(lx,-1.0*ly); 		// inverted ly
		update_lightcontroller(lx,ly);

		(event.touches) ? lightControllerCanvas.addEventListener("touchmove", drag_lightcontroller, false) : lightControllerCanvas.addEventListener("mousemove", drag_lightcontroller, false);
	}
}

function drag_lightcontroller(event) {
	var XX=0, YY=0;
	var midpoint = [63,63];
	var radius = 60;

	var lightControllerCanvas = document.getElementById("lightcontroller_canvas");
	var coords = lightControllerCanvas.relMouseCoords(event);

	XX = coords.x - midpoint[0];
	YY = coords.y - midpoint[1];

	// check inside circle
	if((XX*XX + YY*YY) < ((radius-5)*(radius-5))) {
		var lx = (XX / radius)/2.0;
		var ly = (YY / radius)/2.0;

		presenter.rotateLight(lx,-1.0*ly); 		// inverted ly 
		update_lightcontroller(lx,ly);
	}
}

function update_lightcontroller(xx,yy) {

	var midpoint = [63,63];
	var radius = 60;

	var lightControllerCanvas = document.getElementById("lightcontroller_canvas");
	var context = lightControllerCanvas.getContext("2d");
	context.clearRect(0, 0, lightControllerCanvas.width, lightControllerCanvas.height);

	context.beginPath();
	context.arc(midpoint[0], midpoint[1], radius, 0, 2 * Math.PI, false);
	var grd=context.createRadialGradient(midpoint[0]+(xx*radius*2),midpoint[1]+(yy*radius*2),5,midpoint[0], midpoint[1],radius);
	grd.addColorStop(0,"yellow");
	grd.addColorStop(1,"black");
	context.fillStyle = grd;
	context.fill();
	context.lineWidth = 3;
	context.strokeStyle = 'black';
	context.stroke();

	context.beginPath();
	context.rect(midpoint[0]+(xx*radius*2)-3,midpoint[1]+(yy*radius*2)-3,5,5);
	context.lineWidth = 2;
	context.strokeStyle = 'yellow';
	context.stroke();

	//presenter.ui.postDrawEvent(); 
}

function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var pageX = 0;
    var pageY = 0;
    var currentElement = this;

    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    (event.touches) ? (pageX = event.touches[0].pageX) : (pageX = event.pageX);
    (event.touches) ? (pageY = event.touches[0].pageY) : (pageY = event.pageY);

    canvasX = pageX - totalOffsetX;
    canvasY = pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;
// end lightControler functions ************************************************************************************************************
// ****************************** convertTOGlobal/Local prese da SPOTMAKER, per trasformare le coordinate da locali a globali. Da usare per muovere il modello 
// ****************************** quando si clicca sul hotspot  
function convertToGlobal(state)
{
	var newstate=[];
	// angles
	newstate[0] = state[0];
	newstate[1] = state[1];
	// pan
	newstate[2] = (state[2] / presenter.sceneRadiusInv) + presenter.sceneCenter[0];
	newstate[3] = (state[3] / presenter.sceneRadiusInv) + presenter.sceneCenter[1];
	newstate[4] = (state[4] / presenter.sceneRadiusInv) + presenter.sceneCenter[2];
	//distance
	newstate[5] = state[5] / presenter.sceneRadiusInv;
	return newstate;
}
function convertToLocal(state)
{
	var newstate=[];
	// angles
	newstate[0] = state[0];
	newstate[1] = state[1];
	// pan
	newstate[2] = (state[2] - presenter.sceneCenter[0]) * presenter.sceneRadiusInv;
	newstate[3] = (state[3] - presenter.sceneCenter[1]) * presenter.sceneRadiusInv;
	newstate[4] = (state[4] - presenter.sceneCenter[2]) * presenter.sceneRadiusInv;
	//distance
	newstate[5] = state[5] * presenter.sceneRadiusInv;
	return newstate;
}
//********************************** 

//start hotspots f()
function onPickedSpot(id) {
//mi permette di prendere ed usare la posizione del json, una volta cliccato l'hotspot.
	for (var ii = 0; ii < HOTSPOTSDATA.annotations.length; ii++){
		var view = HOTSPOTSDATA.annotations[ii].view
		if (HOTSPOTSDATA.annotations[ii].name == id){
			presenter.animateToTrackballPosition(convertToLocal(view));
		};
	}
}
//end hotspots f

function onEndMeasure(measure) {
	// measure.toFixed(2) sets the number of decimals when displaying the measure
	// depending on the model measure units, use "mm","m","km" or whatever you have
	$('#measure-output').html(measure.toFixed(2) + " mm");
}

var presenter = null;

function setup3dhop() { 
presenter = new Presenter("draw-canvas");

var myScene;
    myscene = {
		meshes: {},
		modelInstances : {},
		spots : {},
		trackball: {},
		space: {}
	};

//*******************************************************inizio passaggio da xml *************************
    //	myscene.meshes[name[0]] = { url : "models"+myurl };
	myscene.meshes[name] = { url : myurl };
	myscene.meshes[tipo_hs] = {url : url_hs}; // mi dichiara la Sphere 
	myscene.modelInstances[mdI] = { mesh : name,
									color: [-2.0, -2.0, -2.0]
								};
	myscene.spots =cont;
	//myscene.modelInstances[mdI].transform = {translation : [0.0, 0.0, 0.0] };
 	myscene.trackball = { type : TurntablePanTrackball };
	myscene.trackball.trackOptions = {
										startPhi: 0.0,
								        startTheta: 0.0,
        								startDistance : start,
								        minMaxPhi: [-180, 180],
							 			minMaxTheta   : "["+stMinT+", "+stMaxT+"]",
							 			minMaxDist    : "["+stMinD+", "+stMaxD+"]",
										startPanX     : _PanX,
										startPanY     : 0.0,
										startPanZ     : 0.0,
										minMaxPanX    : [-0.5, 0.5],
										minMaxPanY    : [-0.6, 0.6],
										minMaxPanZ    : [-0.3, 0.3]
									};
	myscene.space = {// tutta questa parte si puo mettere in xml, almeno la patrte con i parametri della camera secondo me vanno messi in xml
						centerMode       : "scene",
						radiusMode       : "scene",
						cameraFOV        : 60.0,
						cameraNearFar    : [0.01, 10.0],
						cameraType       : "perspective",
						sceneLighting    : true
					};
//******************************************************fine passaggio da xml**************************

//assegna i valori di myscene a presenter
	presenter.setScene(myscene);

/*inizio hotspots (il resto del codice aggiunto e' spots sopra)*/
	presenter.setSpotVisibility(HOP_ALL, false, true);

	presenter._onPickedSpot = onPickedSpot;
/*	
	presenter._onPickedInstance = onPickedInstance;
*/
/*fine hotspots*/

	presenter._onEndMeasurement = onEndMeasure;
}




//*********************************************************************************************************************
/*
function updateScene(){
	if(!presenter._scene) return;
	presenter._scene.spots = {};
	presenter._spotsProgressiveID = 10;	// reset to avoid accumulation
	for (var ii = 0; ii < HOTSPOTSDATA.annotations.length; ii++)
	{
		var pos = HOTSPOTSDATA.annotations[ii].position
		var radius = HOTSPOTSDATA.annotations[ii].radius;
		var newSpot = {
			mesh            : "sphere",
			color           : [ 0.0, 0.25, 1.0 ],
			transform : { 
				translation : pos,
				scale : [radius, radius, radius],
				},
			//visible         : true,
		};
		presenter._scene.spots[HOTSPOTSDATA.annotations[ii].name] = presenter._parseSpot(newSpot);
	}
	presenter._scenePrepare();
	presenter.repaint();	
}*/

$(document).ready(function(){
/*  STESSO PROBLEMA DI XML, PASSA I DATI MA NON CARICA IL MODELLO 'NON LI PASSA NEL MOMENTO GIUSTO'
	$.ajax({
		url: "uri_test.json",
		dataType: 'json',
		success: function(data) {
		  ANNOTATIONDATA= data.uri;
		  myurl = ANNOTATIONDATA;
		},
		error: function() {
		  alert("error");
		}
	  });      
*/  
	//---------------------------------------------------------------------------------------------
	var lightControllerCanvas = document.getElementById("lightcontroller_canvas");
	lightControllerCanvas.addEventListener("touchstart", click_lightcontroller, false);
	lightControllerCanvas.addEventListener("mousedown", click_lightcontroller, false);
	
	var canvas = document.getElementById("draw-canvas");
	canvas.addEventListener("mouseup", function () { 
		lightControllerCanvas.removeEventListener("mousemove", drag_lightcontroller, false); 
		lightControllerCanvas.removeEventListener("touchmove", drag_lightcontroller, false);
	}, false);
	document.addEventListener("mouseup", function () { 
		lightControllerCanvas.removeEventListener("mousemove", drag_lightcontroller, false);
		lightControllerCanvas.removeEventListener("touchmove", drag_lightcontroller, false);
	}, false);
//*******************************************************************
	update_lightcontroller(-0.17,-0.17);	
//---------------------------------------------------------------------------------------------
	
	init3dhop();
	setup3dhop();

		$('#move_right').css("opacity", "0.2");
		$('#move_left').css("opacity", "0.2");

});
// onload occurs when all content has been loaded 
//window.onload = setup3dhop;
