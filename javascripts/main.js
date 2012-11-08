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
	setTimeout(timeoutCallback, 100);
}

function timeoutCallback() {
	var data = ori.calculate();
	var colors = {
		front: '#ff3399',
		back: '#426ab3',
		right: '#006c54',
		left: '#CCFF00'
	};
	var body = document.body;
	/**
	var color = colors[data.direction];
	var opacity = Math.floor(data.strength / 10) / 10;
	document.getElementById('moAccel').innerHTML = data.direction + opacity;
	body.style.background = color;
	body.style.opacity = opacity;
	/**/
	body.innerHTML = data.x+":"+data.y;
	setTimeout(timeoutCallback, 100);
}

function init2() {
	document.getElementById("btnInit").addEventListener("click", btnInitializeClick, true);

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
	//	var tiltLR = Math.round(((acceleration.x) / 9.81) * - 90);
	//	var tiltFB = Math.round(((acceleration.y + 9.81) / 9.81) * 90 * facingUp);
	document.getElementById("moAccel").innerHTML = rawAcceleration;
	//	var rotation = "rotate(" + tiltLR + "deg) rotate3d(1,0,0, " + (tiltFB) + "deg)";
	//	document.getElementById("imgLogo").style.webkitTransform = rotation
}
