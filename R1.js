
var start="1.10";
var name="bewcastle.nxz";
var myurl="/multires/bewcastle.nxz";
var mdI="BWC";
var stMin0="1.5";
var stMin1="3.0";
var stMax0="1.0";
var stMax1="1.0";

/***************************** start function that generates XMLDOM *******************************************/
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
   if (this.readyState == 4 && this.status == 200) {
       myFunction(this);
   }
};
xhttp.open("GET", "R1.xml", true);
xhttp.send();
/****************************** end function that generates XMLDOM ******************************************/

function actionsToolbar(action) {
	//if(action=='home') presenter.setTrackballPosition([ w0, w1, w2]);
	if(action=='home') presenter.resetTrackball();
		else if(action=='zoomin') presenter.zoomIn();
		else if(action=='zoomout') presenter.zoomOut();
		else if(action=='lighting' || action=='lighting_off') { presenter.enableSceneLighting(!presenter.isSceneLightingEnabled()); lightingSwitch(); }
		//else if(action=='light' || action=='light_on') { presenter.enableLightTrackball(!presenter.isLightTrackballEnabled()); lightSwitch(); }
		else if(action=='light') {
			var elem = document.getElementById("lightcontroller");
			var pos = 110;
			elem.style.left = pos + "px"; 
			lightSwitchL('light');
		}
		else if (action=='light_on'){
			var elem = document.getElementById("lightcontroller");   
			var pos = -250;
			elem.style.left = pos + "px"; 
			lightSwitchL('light_on');
		}		
		else if(action=='perspective' || action=='orthographic') { presenter.toggleCameraType(); cameraSwitch(); }
		else if(action=='hotspot'|| action=='hotspot_on') { presenter.toggleSpotVisibility(HOP_ALL, true); presenter.enableOnHover(!presenter.isOnHoverEnabled()); hotspotSwitch(); }
		else if(action=='measure' || action=='measure_on') { presenter.enableMeasurementTool(!presenter.isMeasurementToolEnabled()); measureSwitch(); } 
		else if(action=='full' || action=='full_on') fullscreenSwitch();
}

function log(msg) {
	document.getElementById("log-text").innerHTML += msg + "\n";
	document.getElementById("log-text").scrollTop = document.getElementById("log-text").scrollHeight;
}

function lightSwitchL(on) {

	if(on == 'light'){
		$('#light').css("visibility", "hidden");
	    $('#light_on').css("visibility", "visible");
	    $('#lighting_off').css("visibility", "hidden");	//manage lighting combined interface
	    $('#lighting').css("visibility", "visible");	//manage lighting combined interface
	}
	else{
    	$('#light_on').css("visibility", "hidden");
    	$('#light').css("visibility", "visible");
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


/************************************************************************/
//start menagement of XML nodes 
function myFunction(xml) {
    var xmlDoc = xml.responseXML;
    
    var x = xmlDoc.getElementsByTagName("NAME")[0];
    var y = x.childNodes[0];
    name = y.nodeValue;
} 
//end menagement of XML nodes 
/************************************************************************/

//start hotspots f(richiamato sopra)
function onPickedSpot(id) {
  switch(id) {
     case 'Select'   : alert("Select Hotspot Clicked"); break;
     case 'Sphere' : alert("Basis Hotspot Clicked"); break;
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
/*
    myscene.meshes[name] = { url : "models/multires/"+myurl };
    myscene.meshes[name1] = { url : "models/singleres/"+myurl1 };
    myscene.meshes[name2] = { url : "models"+myurl2 };
*/
    //	myscene.meshes[name[0]] = { url : "models"+myurl };
	myscene.meshes[name] = { url : "models"+myurl };
	myscene.modelInstances[mdI] = { mesh : name };
	myscene.modelInstances[mdI].transform = {translation : [0.0, 0.0, 0.0] };
	myscene.trackball = { type : TurnTableTrackball };
	myscene.trackball.trackOptions = {
        								startDistance : start,
							 			minMaxDist    : "["+stMin0+", "+stMin1+"]",
							 			minMaxTheta   : "["+stMax0+", "+stMax1+"]"
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

// da usare soloquando i parametri sono passati da xml; assegna i valori di myscene a presenter
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

$(document).ready(function(){
	//resizeCanvas(800,600); 
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
});
// onload occurs when all content has been loaded 
window.onload = setup3dhop;
