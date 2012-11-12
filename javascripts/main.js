function init() {
	if (window.DeviceMotionEvent) {
		console.log("DeviceMotionEvent supported");
	} else if ('listenForDeviceMovement' in window) {
		console.log("DeviceMotionEvent supported [listenForDeviceMovement]");
	}
}

var Orientation = function() {
	this.initialOrientation = [0, 0, 0];
	this.lastOrientationValue = [0, 0, 0];
	this.positionValue = [0, 0, 0];
	this.lowFilterAlpha = 0.8;
	this._data = {
		x: 0,
		y: 0
	};

	this.initOrientation = function() {
		this.initialOrientation[0] = this.lastOrientationValue[0];
		this.initialOrientation[1] = this.lastOrientationValue[1];
		this.initialOrientation[2] = this.lastOrientationValue[2];
		return this;
	}

	this.setOrientation = function(alpha, beta, gamma) {
		if (alpha > 180) {
			alpha = - 360 + alpha;
		}
		if (gamma > 180) {
			gamma = - 360 + gamma;
		}
		this.lastOrientationValue[0] = alpha * Math.PI / 180;
		this.lastOrientationValue[1] = beta * Math.PI / 180;
		this.lastOrientationValue[2] = gamma * Math.PI / 180;
		return this;
	}

	this.calculate = function() {
		var angleX = this.lastOrientationValue[1];
		var angleY = this.lastOrientationValue[2];
		var angleZ = this.lastOrientationValue[0] - this.initialOrientation[0];
		if (Math.abs(angleZ) > Math.PI) {
			if (this.lastOrientationValue[0] > 0) {
				angleZ -= 2 * Math.PI;
			} else {
				angleZ += 2 * Math.PI;
			}
		}

		var x = 0.0;
		var y = 100.0;
		var z = 0.0;

		var zz = z * Math.cos(angleY) - x * Math.sin(angleY);
		var xx = z * Math.sin(angleY) + x * Math.cos(angleY);
		var yy = y;

		x = xx;
		y = yy;
		z = zz;

		yy = y * Math.cos(angleX) - z * Math.sin(angleX);
		zz = y * Math.sin(angleX) + z * Math.cos(angleX);
		xx = x;

		x = xx;
		y = yy;
		z = zz;

		xx = x * Math.cos(angleZ) - y * Math.sin(angleZ);
		yy = x * Math.sin(angleZ) + y * Math.cos(angleZ);
		zz = z;

		x = xx;
		y = yy;
		z = zz;
		this.positionValue[0] = this.lowFilterAlpha * this.positionValue[0] + (1 - this.lowFilterAlpha) * x;
		this.positionValue[1] = this.lowFilterAlpha * this.positionValue[1] + (1 - this.lowFilterAlpha) * y;
		this.positionValue[2] = this.lowFilterAlpha * this.positionValue[2] + (1 - this.lowFilterAlpha) * z;

		var ex = this.positionValue[0];
		var ey = this.positionValue[1];

		this._data.x = ex;
		this._data.y = ey;
		return this._data;
	}
}

var ori = new Orientation();

init2();

function btnInitializeClick() {
	ori.initOrientation();
	//document.body.webkitRequestFullScreen(); 可惜chrome移动版暂时不支持全屏
	setTimeout(timeoutCallback, 100);
}


function timeoutCallback() {
	changeColor();
	setTimeout(timeoutCallback, 100);
}



/**
 * 计算角度
 */
var getAngle = function(x1, y1, x2, y2) {
	var x2 = x2 || 0;
	var y2 = y2 || 0;
	var y = x1 - x2;
	var x = y1 - y2;
	var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	var cos = y / z;
	var radina = Math.acos(cos);
	var angle = 0;
	var quadrant = 0; //象限 其实象限在这个地方没用
	if (y == 0 || x == 0) {
		if(x>=0){
			if(y>=0){
				angle=0;
			}else{
				angle=180;
			}
		}else if(y>=0){
			if(x>=0){
				angle=90;
			}else{
				angle=270;
			}
		}
	} else {
		var flag = (y > 0 ? "+": "-") + (x > 0 ? "+": '-');

		switch (flag) {
		case "++":
			quadrant = 1;
			angle = 180 / (Math.PI / radina);
			break;
		case "-+":
			quadrant = 2;
			angle = 180 / (Math.PI / radina);
			break;
		case "--":
			quadrant = 3;
			angle = 360-180 / (Math.PI / radina);
			break;
		case "+-":
			quadrant = 4;
			angle = 360 - 180 / (Math.PI / radina);
			break;
		default:
			quadrant = 0;
			angle = 0;
		}
	}
	return {
		quadrant: quadrant,
		angle: parseInt(angle)
	};
}

/**
 * 获取颜色
 * 这个地方是最痛苦的地方
 */
var getColor = function(angle, quadrant) {
	var color = "ffffff";
	var colors = {
		front: 'ffff00',
		back: '0000ff',
		left: 'ff000',
		right: '00ff00'
	}
	if (!quadrant) {
		quadrant = 0;
		if(angle>0){
			quadrant=1;
		}
		if (angle > 90) {
			quadrant = 2
		}
		if (angle > 180) {
			quadrant = 3
		}
		if (angle > 270) {
			quadrant = 4
		}
	}
	switch (quadrant) {
	case 0:
		switch (angle){
			case 0:
				color="00ff00";
				break;
			case 90:
				color="ffff00";
				break;
			case 180:
				color="ff0000";
				break;
			case 270:
				color="0000ff";
				break;
		}
		break;
	case 1:
		color = parseInt(angle / 90 * 255).toString(16) + "ff00";
		break;
	case 2:
		color = "ff" + (255 - parseInt((angle - 90) / 90 * 255)).toString(16) + "00";
		break;
	case 3:
		if (angle - 180 <= 45) {
			color = "ff00" + parseInt((angle - 180) / 45 * 255).toString(16);
		} else {
			color = (255 - parseInt((angle - 225) / 45 * 255)).toString(16) + "00ff"
		}
		break;

	case 4:
		if (angle - 270 <= 45) {
			color = "00" + parseInt((angle - 270) / 45 * 255).toString(16) + "ff";
		} else {
			color = "00ff" + (255 - parseInt((angle - 315) / 45 * 255)).toString(16);
		}
		break;
	}
	return "#"+color;
}

/**
 * 改变屏幕颜色
 */
var changeColor=function(vx,vy){
	var data = ori.calculate();
	var x = typeof vx == "number"?vx:parseInt(data.x);
	var y = typeof vy == "number"?vy:parseInt(data.y);

	var angle=getAngle(x,y).angle;
	var color=getColor(angle);
	var power=parseInt(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
	var opacity=(power/100).toFixed(2);// 这样直接取值效果非常不好
	//var opacity=(power == 0?0:Math.atan(100/power)*Math.PI/180)/90;
	var body = document.body;
	body.style.background=color;
	body.style.opacity=opacity;
	if(location.hash == "#debug"){
		document.getElementById('btn').innerHTML=["<h1>",opacity,"</h1>","<h1>",x.toString(),":",y.toString(),"</h1><h1>",angle,":",color,"</h1>"].join("");
	}
}




function init2() {
	document.getElementById("btn").addEventListener("click", btnInitializeClick, true);

	window.addEventListener("deviceorientation", function(event) {
		var alpha = event.alpha;
		var beta = event.beta;
		var gamma = event.gamma;
		ori.setOrientation(alpha, beta, gamma);
	},
	true);
}
function deviceMotionHandler3(eventData) {
	var acceleration = eventData.accelerationIncludingGravity;
	var rawAcceleration = "[" + Math.round(acceleration.x) + ", " + Math.round(acceleration.y) + ", " + Math.round(acceleration.z) + "]";
	var facingUp = - 1;
	if (acceleration.z > 0) {
		facingUp = + 1;
	}
}




