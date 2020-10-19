// common 
function $(str) {
	return document.getElementById(str);
}

function $tag(str,target) {
	target = target || document;
	return target.getElementsByTagName(str);
}

function addEventHandler(obj,eType,fuc){
	if(obj.addEventListener){ 
		obj.addEventListener(eType,fuc,false); 
	}else if(obj.attachEvent){ 
		obj.attachEvent("on" + eType,fuc); 
	}else{ 
		obj["on" + eType] = fuc; 
	} 
} 

function removeEventHandler(obj,eType,fuc){
	if(obj.removeEventListener){ 
		obj.removeEventListener(eType,fuc,false); 
	}else if(obj.attachEvent){ 
		obj.detachEvent("on" + eType,fuc); 
	} 
}

function randowNum(start,end) {
	return Math.floor(Math.random()*(end - start)) + start;
}

Array.prototype.remove=function(dx) {
	if(isNaN(dx)||dx>this.length){return false;}
	for(var i=0,n=0;i<this.length;i++)
	{
		if(this[i]!=this[dx])
		{
			this[n++]=this[i]
		}
	}
	this.length-=1
}

//const
var TOTALR = 15, //??İ뾶(?????Ӱ)
	N=0,
	R = 12, //??ʵ?뾶
	POKER = 20,
	W = 736, //????
	H = 480, //????
	THICKNESS =  32, //?????
	RATE = 60, //ˢ?Ƶ?
	F = 0.01, //Ħ????
	LOSS = 0.1; // ?ײ?????
var table, //???
	cueBall, //ĸ?
	guideBall, //?ο??
	speed = 12,
	rollUp = 0,
	rollRight = 0,
	timer,
	forceTimer,
	balls = [],
	movingBalls = [],
	pokes = [[0,0],[W/2,-5],[W,0],[0,H],[W/2,H+5],[W,H]],
	hasShot = false;
	shots = 0; //???????
	
window.onload = function() {
	initTable();
	startGame();
}

function startGame() {
	initBall();
	addEventHandler(table,"mousemove",dragCueBall);
	addEventHandler(table,"mouseup",setCueBall);
}

function initTable() {
	table = $("table");
	var guideBallDiv = document.createElement("div");
	guideBallDiv.className = "guide ball";
	setStyle(guideBallDiv,"display","none");
	guideBall = table.appendChild(guideBallDiv);
}

function initBall() {

	//?????
	cueBall = new Ball("cue",170,H/2);
	balls.push(cueBall);
	
	//???????
	for(var i = 0; i < 5; i++) {
		for(var j = 0; j <= i; j++)	{
			var ball = new Ball("target",520 + i*2*R, H/2 - R*i + j*2*R);//??????ʼ?????  good!
			balls.push(ball);
		}
	}
}



function getElemPos(target,reference) {
	reference = reference || document;
	var left = 0,top = 0;
	return getPos(target);
	function getPos(target) {
		if(target != reference) {
			left += target.offsetLeft;
			top += target.offsetTop;
			return getPos(target.parentNode);
		} else {
			return [left,top];
		}
	}
}

// ball class
function Ball(type,x,y) {
	var div = document.createElement("div");
	div.className = type + " ball";
	this.elem = table.appendChild(div);
	this.type = type;
	this.x = x; //λ?
	this.y = y;
	this.angle = 0; //?Ƕ?
	this.v = 0; //????????????)
	setBallPos(this.elem,x,y);
	return this;
}

function setCueBall() {
	removeEventHandler(table,"mousemove",dragCueBall);
	removeEventHandler(table,"mouseup",setCueBall);
	startShot();
}

function startShot() {
	show(cueBall.elem);
	addEventHandler(table,"mousemove",showGuide);
	addEventHandler(table,"mousedown",updateForce);
	addEventHandler(table,"mouseup",shotCueBall);
	
}

function dragCueBall(e) {
	var toX,toY;
	e = e || event;
	toX = e.clientX - table.offsetLeft - THICKNESS,
	toY = e.clientY - table.offsetTop - THICKNESS;
	toX = toX >= R ? toX : R;
	toX = toX <= 170 ? toX : 170;
	toY = toY >= R ? toY : R;
	toY = toY <= H - R ? toY : H - R;	
	setBallPos(cueBall,toX,toY);
}

function shotCueBall() {
	removeEventHandler(table,"mousemove",showGuide);
	removeEventHandler(table,"mousedown",updateForce);
	removeEventHandler(table,"mouseup",shotCueBall);
	window.clearInterval(forceTimer);
	speed = $("force").offsetWidth * 0.15;
	var dotDis = 0,
		dotAngle = 0;
	rollRight = 0;
	rollUp = 0;

	var formPos = getBallPos(cueBall.elem),
		toPos = getBallPos(guideBall),
		angle = Math.atan2(toPos[0] - formPos[0],toPos[1] - formPos[1]);
	hide(guideBall);
	cueBall.v = speed;
	cueBall.angle = angle;
	movingBalls.push(cueBall);
	if(N>=15) {
		alert('Congratulation!!!!!');
		location.reload();
	}

	timer = window.setInterval(roll,1000 / RATE);
}

function showGuide(e) {
	var fromX,fromY,toX,toY;
	e = e || event;
	toX = e.clientX - table.offsetLeft - THICKNESS,
	toY = e.clientY - table.offsetTop - THICKNESS;
	setBallPos(guideBall,toX,toY);
	show(guideBall);
}

function roll() {//								??ע?????????????????????
	if(movingBalls.length <= 0) {
		hasShot = false;
		setStyle($("force"),"width",80+"px");
		// setPos($("dot"),22,22);		
		window.clearInterval(timer);
		
		startShot();
	}
	for(var i = 0; i < movingBalls.length; i++) {
		var ball = movingBalls[i],
			sin = Math.sin(ball.angle),
			cos = Math.cos(ball.angle);
		ball.v -= F;
		//?????ֹ????
		if(Math.round(ball.v) == 0) {
			ball.v = 0;
			movingBalls.remove(i);
			continue;	
		}
		var vx = ball.v * sin,
			vy = ball.v * cos;
		ball.x += vx;
		ball.y += vy;
				
		//???
		if(isPocket(ball.x,ball.y)) {
			hide(ball.elem);
			
			if(ball.type == "cue") {
					if(!hasShot) shots = 0;
					hasShot = false;

				window.setTimeout(function(){
				
					ball.v = 0;	
					setBallPos(ball,170,250);
					
				},500);

			}else {
				//??????С?
				hasShot = true;
				ball.v = 0;	
				for(var k = 0, l =0; k < balls.length; k++) {
					if(balls[k] != ball) {
						balls[l++] = balls[k];
					}
				}
				balls.length -= 1;
				N++;// 																			??????
			}
			return;
		}
		
		//????ײ
		if(ball.x < R || ball.x > W - R) {
			ball.angle *= -1;
			ball.angle %= Math.PI;
			ball.v = ball.v * (1 - LOSS);
			vx = ball.v*Math.sin(ball.angle);
			vy = ball.v*Math.cos(ball.angle);
			if(ball.x < R) ball.x = R;
			if(ball.x > W - R) ball.x = W - R;
			//ĸ????
			if(ball.type == "cue")	{
				if(ball.angle > 0) vy -= rollRight;
				else vy += rollRight;
				vx += rollUp;
				rollUp *= 0.2;
				rollRight *= 0.2;
				ball.v = Math.sqrt(vx*vx + vy*vy);
				ball.angle = Math.atan2(vx,vy);
			}				
		}
		if(ball.y < R || ball.y > H - R) {
			ball.angle = ball.angle > 0 ? Math.PI - ball.angle : - Math.PI - ball.angle ;
			ball.angle %= Math.PI;
			ball.v = ball.v * (1 - LOSS);
			vx = ball.v*Math.sin(ball.angle);
			vy = ball.v*Math.cos(ball.angle);
			if(ball.y < R) ball.y = R;
			if(ball.y > H - R) ball.y = H - R;	
			//ĸ????
			if(ball.type == "cue")	{
				if(Math.abs(ball.angle) < Math.PI/2) vx += rollRight;
				else vx -= rollRight;
				vy += rollUp;
				rollUp *= 0.2;
				rollRight *= 0.2;
				ball.v = Math.sqrt(vx*vx + vy*vy);
				ball.angle = Math.atan2(vx,vy);
			}					
		}
		
		//С??ײ
		for(var j = 0; j < balls.length; j++) {
			var obj = balls[j];
			if(obj == ball) continue;
			var disX = obj.x - ball.x,
				disY = obj.y - ball.y,
				gap = 2 * R;
			if(disX <= gap && disY <= gap) {
				var dis = Math.sqrt(Math.pow(disX,2)+Math.pow(disY,2));
				if(dis <= gap) {

					//??????ֹ?ģ????ӵ???movingBalls
					if(Math.round(obj.v) == 0)	
					movingBalls.push(obj);
					
					//??????ת??x?????ײ???
					
					// ????Ⱥ????ֵ - ??ȷֵ
					//var c = (obj.x*ball.y - obj.y*ball.x)/(2*R),
					//	d = Math.sqrt(ball.x*ball.x + ball.y*ball.y),
					//	angle = Math.asin(ball.y/d) - Math.asin(c/d) - ball.angle%(Math.PI/2),
						//angle =  Math.asin(oy / (2 * R)),
					
					//??ԭ?????״̬ - ???ֵ
					ball.x -= (gap - dis)*sin;
					ball.y -= (gap - dis)*cos;
					disX = obj.x - ball.x;
					disY = obj.y - ball.y;
					
					// ????Ⱥ????ֵ
					var angle = Math.atan2(disY, disX),
						hitsin = Math.sin(angle),
						hitcos = Math.cos(angle),
						objVx = obj.v * Math.sin(obj.angle),
						objVy = obj.v * Math.cos(obj.angle);
			
						
					// ?ת???
					var x1 = 0,
						y1 = 0,
						x2 = disX * hitcos + disY * hitsin,
						y2 = disY * hitcos - disX * hitsin,
						vx1 = vx * hitcos + vy * hitsin,
						vy1 = vy * hitcos - vx * hitsin,
						vx2 = objVx * hitcos + objVy * hitsin,
						vy2 = objVy * hitcos - objVx * hitsin;
					
					// ?ײ????Ⱥ???
					var plusVx = vx1 - vx2;
					vx1 = vx2;
					vx2 = plusVx + vx1;
					
					//ĸ????
					if(ball.type == "cue")	{
						vx1 += rollUp;
						rollUp *= 0.2;
					}				
					
					x1 += vx1;
					x2 += vx2;
					
					// ??λ??ת???
					var x1Final = x1 * hitcos - y1 * hitsin,
						y1Final = y1 * hitcos + x1 * hitsin,
						x2Final = x2 * hitcos - y2 * hitsin,
						y2Final = y2 * hitcos + x2 * hitsin;
					obj.x = ball.x + x2Final;
					obj.y = ball.y + y2Final;
					ball.x = ball.x + x1Final;
					ball.y = ball.y + y1Final;
					
					// ??????ת???
					vx = vx1 * hitcos - vy1 * hitsin;
					vy = vy1 * hitcos + vx1 * hitsin;
					objVx = vx2 * hitcos - vy2 * hitsin;
					objVy = vy2 * hitcos + vx2 * hitsin; 
					
					//?????
					ball.v = Math.sqrt(vx*vx + vy*vy) * (1 - 0);
					obj.v = Math.sqrt(objVx*objVx + objVy*objVy) * (1 - 0);
					
					// ?????
					ball.angle = Math.atan2(vx , vy);
					obj.angle = Math.atan2(objVx , objVy);	
															
					//break;
				}
			}
		}
				
		setBallPos(ball,ball.x,ball.y);	
	}
}

function isPocket(x,y) {
	if(y < POKER) return check(0,2);
	else if (y > H - POKER) return check(3,5);
	else return false;
	
	function check(m,n) {
		for(var i=m; i<=n; i++) {
			if(x >= pokes[i][0] - POKER && x <= pokes[i][0] + POKER) {
				var dis = Math.sqrt(Math.pow(x - pokes[i][0],2) + Math.pow(y - pokes[i][1],2));
				if(dis <= POKER) return true;
				else return false;
			}
		}	
	} 
	
}

function getBallPos(obj) {
	var pos = [];
	pos.push(obj.offsetLeft - THICKNESS + TOTALR);
	pos.push(obj.offsetTop - THICKNESS + TOTALR);
	return pos;
}

function setPos(obj,x,y) {
	obj.style.left = x + "px";
	obj.style.top = y + "px";
}

function setBallPos(ball,x,y) {
	if(ball.constructor == Ball) {
		ball.x = x;
		ball.y = y;
		ball = ball.elem;
	}
	setPos(ball,x + THICKNESS - TOTALR,y + THICKNESS - TOTALR);
}


function updateForce() {
	var obj = $("force"),
		len = 80,
		up = true;
	forceTimer = window.setInterval(update,10);
	
	function update() {
		 if(up) setStyle(obj,"width",len+++"px");
		 else setStyle(obj,"width",len--+"px");
		 if(len > 136) up = false;
		 if(len <= 0) up = true;
	}
	
}

function setStyle() {

	if(arguments.length == 2 &&  typeof arguments[1] == "object") {
		for(var key in arguments[1]) {
			arguments[0].style[key] = arguments[1][key];
		}
	} else if (arguments.length > 2) {
		arguments[0].style[arguments[1]] = arguments[2];
	}
}

function hide(obj) {
	setStyle(obj,"display","none");
}

function show(obj) {
	setStyle(obj,"display","block");
}

