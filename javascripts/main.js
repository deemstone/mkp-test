//download chrome installer standalone: https://www.google.com/intl/zh-CN/chrome/browser/thankyou.html?standalone=1&installdataindex=defaultbrowser
//var INITED = false;
var ori;
var DEBUG = location.hash == "#debug";
var tag = document.createElement('div');
document.body.appendChild(tag);

var Orientation = function() {
	var self = this;
	this.initialOrientation = [0, 0, 0];
	this.lastOrientationValue = [90, 90, 90];
	this.positionValue = [0, 0, 0];
	this.lowFilterAlpha = 0; //.8;  //这个数值控制颜色渐变速度
	this._data = {
		x: 100,
		y: 100,
		z: 100,
		alpha: 90,
		beta: 90,
		gamma: 90,
		horizontal: false
	};
	window.addEventListener("deviceorientation", function(event) {
		var alpha = event.alpha;
		var beta = event.beta;
		var gamma = event.gamma;
		self.setOrientation(alpha, beta, gamma);
		if(DEBUG){
			tag.innerHTML = [parseInt(alpha), parseInt(beta), parseInt(gamma)].join();
		}
		//chrome 数值解释
		//iPad:
		//alpha around Z : 0 ~ 360
		//beta around X : -90 ~ 0 ~ 90 positive means top up 
		//gamma around Y : -180 ~ 180 positive means left up
		//Android Browser & Chrome
		//gamma around Y : -90 ~ 270 left down to -90 right to 270
	},
	true);
	
	this.initOrientation = function() {
		this.initialOrientation[0] = this.lastOrientationValue[0];
		this.initialOrientation[1] = this.lastOrientationValue[1];
		this.initialOrientation[2] = this.lastOrientationValue[2];
		return this;
	};
	
	//just hold values for calculate use. no process.
	this.setOrientation = function(alpha, beta, gamma) {
		this.lastOrientationValue[0] = alpha;
		this.lastOrientationValue[1] = beta;
		this.lastOrientationValue[2] = gamma;
		return this;
	};

	//this method assume deviceorientation gives value in 0 - 360 degree
	this.calculate = function() {
		var angleX = this.lastOrientationValue[1];
		var angleY = this.lastOrientationValue[2];
		var angleZ = this.lastOrientationValue[0] - this.initialOrientation[0];
		//统一取值范围
		if (Math.abs(angleZ) > 180) {
			if (this.lastOrientationValue[0] > 0) {
				angleZ -= 360;
			} else {
				angleZ += 360;
			}
		}
		if (angleY > 180) {
			angleY -= 360;
		}
		//transform to radian
		angleX = angleX * Math.PI / 180;
		angleY = angleY * Math.PI / 180;
		angleZ = angleZ * Math.PI / 180;
		

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
		var ez = this.positionValue[2];

		this._data.x = ex;
		this._data.y = ey;
		this._data.z = ez;
		
		//
		if(DEBUG){
			tag.innerHTML = tag.innerHTML + ' || ' +[ex,ey,ez].join();
		}
		
		this._data.alpha = angleX * 180 / Math.PI;
		this._data.beta = angleY * 180 / Math.PI;
		this._data.gamma = angleZ * 180 / Math.PI;
		if (Math.abs(this._data.alpha) <= 10 && Math.abs(this._data.beta) <= 10) {
			this._data.horizontal = true;
		} else {
			this._data.horizontal = false;
		}
		return this._data;
	};
};


//start motion color picker
var btnInitializeClick = function(){
	ori.initOrientation();
	//_pn = 0;
	//_pt = new Date();
	
	(function() {
		var _recall = arguments.callee;
		changeColor();
		setTimeout(_recall, 50);
		
		//测试帧数
		//_pn++;
		//if((new Date() - _pt) >= 1000){
		//	document.title = _pn;
		//	_pn = 0;
		//	_pt = new Date();
		//	
		//}
	})();
};

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
	if (x * y === 0) {
		if (x === 0) {
			if (y >= 0) {
				angle = 0;
			} else {
				angle = 180;
			}

		} else {
			if (x > 0) {
				angle = 90;
			} else {
				angle = 270;
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
			angle = 360 - 180 / (Math.PI / radina);
			break;
		case "+-":
			quadrant = 4;
			angle = 360 - 180 / (Math.PI / radina);
			break;
		default:
			quadrant = 0;
			angle = 0;
			break;
		}
	}
	return {
		quadrant: quadrant,
		angle: parseInt(angle)
	};
};

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
		if (angle > 0) {
			quadrant = 1;
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
		if (angle === 0 || angle === 90 || angle === 270) {
			quadrant = 0;
		}
	}
	switch (quadrant) {
	case 0:
		switch (angle) {
		case 0:
			color = "00ff00";
			break;
		case 90:
			color = "ffff00";
			break;
		case 180:
			color = "ff0000";
			break;
		case 270:
			color = "0000ff";
			break;
		default:
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
	default:
		break;
	}
	return "#" + color;
}

/**
 * 改变屏幕颜色
 */
var changeColor = function(vx, vy) {
	var data = ori.calculate();
	var x = typeof vx == "number" ? vx: parseInt(data.x);
	var y = typeof vy == "number" ? vy: parseInt(data.y);

	var angle = getAngle(x, y).angle;
	var color = getColor(angle);
	var power = parseInt(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));

	/**
	 * 下面是颜色也表示亮度
	 * 第二种方式
	 *
	var RGB=[color.charAt(1)+""+color.charAt(2),color.charAt(3)+""+color.charAt(4),color.charAt(5)+""+color.charAt(6)];
	for(var i=0,l=3;i<l;i++){
		var c=parseInt(RGB[i],16)-parseInt((100-power)*55/100);
		if(c<=0){
			c="00";
		}else{
			c=parseInt(c).toString(16);
		}
		RGB[i]=c;
	}
	var color="#"+RGB.join("");
	body.style.background=color;
	/**/

	/**
	 * 之前的代码 颜色表示方位,透明度表示力度
	 * 但是颜色和亮度配合起来有问题
	 */

	/**
	 * 颜色的调节 
	 */
	var body = document.body;
	body.style.background = color;
	/**
	 * 亮度调节
	 */
	var opacity = (power / 100).toFixed(2); // 这样直接取值效果非常不好
	body.style.opacity = opacity;
	/**/
	if (DEBUG) {
		document.getElementById('btn').innerHTML = ["<h1>", power, "</h1>", "<h1>", x.toString(), ":", y.toString(), "</h1><h1>", angle, ":", color, "</h1>"].join("");
	}
}

//function deviceMotionHandler3(eventData) {
//	var acceleration = eventData.accelerationIncludingGravity;
//	var rawAcceleration = "[" + Math.round(acceleration.x) + ", " + Math.round(acceleration.y) + ", " + Math.round(acceleration.z) + "]";
//	var facingUp = - 1;
//	if (acceleration.z > 0) {
//		facingUp = + 1;
//	}
//}

/**
 * 检测是否在水平状态
 */
//TODO: make the ball move smoothly.
var checkHo = (function(){

	var checkHoTimer;
	var ball = document.getElementById("ball");
	var btn = document.getElementById("btn");
	var hoCount = 0;
	
	var _current_step = 0;
	//different behavior every step
	var changeStep = window.changeStep = function(n){
		if(n == _current_step) return;

		if(n == 1){
			//control the ball stay in center
			btn.style.display = 'none';
			ball.style.display = 'block';
			document.getElementById("tips").innerHTML = "Step 1: 手机水平向前放置";
		}else if(n == 2){
			//click the chrome icon
			ball.style.display = 'none';
			btn.style.display = 'block';
			btn.style.background = 'url(images/chrome.png) no-repeat center center';
			document.getElementById("tips").innerHTML = "Step 2: 点击chrome图标";
		}else{
			//disable chrome click
			ball.style.display = 'none';
			document.getElementById('tips').style.display = 'none';
			document.documentElement.style.background = 'none';
			//stop checkHo
			clearTimeout(checkHoTimer);
		}
		_current_step = n;
	};
	
	/**
	 * 改变小球位置
	 */
	var changeBall = function(pos) {
		ball.style.left = pos.left + "%";
		ball.style.top = pos.top + '%';
		if (location.hash == "#debug") {
			document.getElementById('ball').innerHTML = [pos.px, pos.py].join("");
		}
	};
	
	//when chrome icon clicked, start main function
	btn.addEventListener("click", function(){
		changeStep(3);
		btnInitializeClick();
	}, true);
	
	//construct interface of check-
	return function() {
		var data = ori.calculate();
		var alpha = data.alpha;
		var beta = data.beta;
		if (window.orientation !== 0) {
			alpha = data.beta;
			beta = data.alpha;
		}

		var horizontal = data.horizontal;
		console.log(JSON.stringify(data));
		if (horizontal) {
			// 已经是水平
			if (hoCount < 6) {
				hoCount++;
			} else {
				changeBall({
					top: 45,
					left: 45
				});

				changeStep(2);
			}
		} else {
			hoCount=0;
			changeStep(1);
			var px = alpha > 0 ? parseInt(45 - alpha / 90 * 45) : parseInt( - alpha / 90 * 45 + 45);
			var py = beta > 0 ? parseInt(45 - beta / 90 * 45) : parseInt( - beta / 90 * 45 + 45);
			changeBall({
				top: px,
				left: py
			});
		}
		
		checkHoTimer = setTimeout(arguments.callee, 50);
		//changeStep(3);
		//(function(){
		//	var _recall = arguments.callee;
		//	var t = new Date();
		//	var i = 100;
		//	
		//	function loop(){
		//		i -= 5;
		//		changeColor(i, 100);
		//		if(i <= 100) {
		//			setTimeout(_recall, 3000);
		//		}else{
		//			setTimeout(loop, 50);
		//		}
		//	}
		//	setTimeout(loop, 50);
		//})();
		
	};
})();

//program entry
window.onload = function() {
	ori = new Orientation();

	if (window.DeviceMotionEvent) {
		//console.log("DeviceMotionEvent supported");
	} else if ('listenForDeviceMovement' in window) {
		//console.log("DeviceMotionEvent supported [listenForDeviceMovement]");
	}
	var c = document.location.search.match(/^\?c=(\d)/);
	//判断url是否带参数，并取出参数
	if( c && c[1] ){
		c = c[1];
		changeStep(2);
		changeStep(3);
		var socket = io.connect();
		socket.on('color', function (data) {
			console.log(data);
			document.body.style.backgroundColor = data[c-1];
			//socket.emit('my other event', { my: 'data' });
		});
	}else{
		//没有参数默认摇摆模式
		checkHo();
	}
}

