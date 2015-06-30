var stage=null,
    ctrlframe=null,
    needToUpdate=true,

    renderer=null,
    scene=null,
    camera=null,
    texture=null,
    picture=null,
    threshold=0,
    sign=1,

    stats=null;

$(function(){
	
    initScreen();

    initStats();

    initScene();

    initStage();

    onUpdate();

});

function initScreen(){
	
		var winW=window.innerWidth;
    var winH=window.innerHeight;

    $(window).on("resize",onResize);
	
		//$(window).on("mousedown",onMouseDown);

 		$("canvas").attr("width",winW).attr("height",winH);

	
		$("img").on("load",onImgLoaded);
	
		$("input").on("change", onInputChange);
	
}

function initScene(){
	
		var winW=window.innerWidth;
    var winH=window.innerHeight;
	
		renderer=new THREE.WebGLRenderer({canvas:$('canvas')[0],antialias:true});
    renderer.setClearColor(0xEEEEEE, 1.0);
    renderer.setSize(winW, winH);

    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera(-winW/2,winW/2,winH/2,-winH/2);
    camera.position.set( 0, 0, 200 );
    scene.add( camera );

    texture=new THREE.Texture($("img")[0]);
    texture.magFilter=THREE.NearestFilter;
    texture.minFilter=THREE.NearestFilter;

    var geometry=new THREE.PlaneGeometry(256,256,1,1);
    var material=new THREE.ShaderMaterial({
        side:THREE.DoubleSide,
        uniforms:{
            map:{type:"t",value:texture},
            threshold:{type:"f",value:1.0}
        },
        vertexShader:[
            "varying vec2 vUV;",
            "void main(){",
                "vUV=uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join("\n"),
        fragmentShader:[
            "varying vec2 vUV;",
            "uniform sampler2D map;",
            "uniform float threshold;",
            "void main(void) {",
                "highp vec4 texColor = texture2D( map, vUV );",
                "if(vUV.s+vUV.t<threshold){",
                    "gl_FragColor = vec4( texColor.rgb, 1.0 );",
                "}else{",
                    "gl_FragColor=vec4(vec3(1.0,1.0,1.0)-texColor.rgb,1.0);",
                "}",
            "}"
        ].join("\n")
    });

    var mesh=new THREE.Mesh(geometry,material);
    scene.add(mesh);
	
		picture=mesh;
    threshold=material.uniforms.threshold;
	
}

function initStage(){
	
		stage=new createjs.Stage($('canvas')[1]);

    var bindObject=new enjolras.BindObject(picture,new createjs.Rectangle(0,0,256,256));

    ctrlframe=new createjs.CtrlFrame(bindObject);

    stage.addChild(ctrlframe);
	
		createjs.Touch.enable(stage);
	
		ctrlframe.on("mousedown",onMouseDown);
	
}

function onUpdate(){

    threshold.value+=sign*0.01;

    if(threshold.value>2){
        sign=-1.0;
        threshold.value=2;
    }else if(threshold.value<0){
        sign=1.0;
        threshold.value=0;
    }

    renderer.render(scene,camera);

    if(needToUpdate){
        stage.update();
        needToUpdate=false;
    }

    stats.update();

    requestAnimationFrame(onUpdate);

}
function onMouseDown(evt){

    //var state=ctrlframe.checkState(evt.clientX,evt.clientY);
		var state=ctrlframe.checkState(evt.stageX,evt.stageY);

    if(state!="still"){
       // $(window).on("mouseup",onMouseUp);
       // $(window).on("mousemove",onMouseMove);
			ctrlframe.on("pressup",onMouseUp);
			ctrlframe.on("pressmove",onMouseMove);
    }

    console.log("state:"+state);
	
		$("#coord").text("("+evt.stageX+","+evt.stageY+")");

}

function onMouseUp(evt){

    //$(window).off("mouseup",onMouseUp);
    //$(window).off("mousemove",onMouseMove);
	
		ctrlframe.off("pressup",onMouseUp);
    ctrlframe.off("pressmove",onMouseMove);

    ctrlframe.checkState();

}

function onMouseMove(evt){

    //ctrlframe.update(evt.clientX,evt.clientY);
		ctrlframe.update(evt.stageX,evt.stageY);

    needToUpdate=true;
	
		$("#coord").text("("+evt.stageX+","+evt.stageY+")");

}

function onResize(evt){

    var winW=window.innerWidth;
    var winH=window.innerHeight;

    $("canvas").attr("width",winW).attr("height",winH);

    renderer.setSize(winW, winH);
    camera.left=-winW/2;
    camera.right=winW/2;
    camera.top=winH/2;
    camera.bottom=-winH/2;
    camera.updateProjectionMatrix();

    ctrlframe.update();
    needToUpdate=true;

    stats.domElement.style.left = (winW-100)+'px';
}

function onImgLoaded(evt){

	if(picture){
		
		texture.needsUpdate=true;
		
	}
	
}

function onInputChange(evt){
	
	var input=evt.target;
	
	if (input.files && input.files[0]) {
		
		var reader = new FileReader();
		
		reader.onload = function (e) {
			
			$("img").attr("src", e.target.result);
			
		}
			
		reader.readAsDataURL(input.files[0]);
		
	}
	
}

function initStats() {

    stats = new Stats();

    stats.setMode(0); // 0: fps, 1: ms

    // Align top-right
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.right = '5px';
    stats.domElement.style.bottom = '20px';

    $("body").append(stats.domElement);
	
}


createjs.CtrlFrame=function(bindObject){

	createjs.Shape.call(this);

	this.sx=1;
	this.sy=1;

	this.dx=0;
	this.dy=0;

	this.state="still";
	this.activeIndex=-1;

	this.circles=null;

	this.bindedObject=null;

	if(bindObject){
		
		this.bind(bindObject);
		
	}

}

createjs.CtrlFrame.prototype=Object.create(createjs.Shape.prototype);

createjs.CtrlFrame.prototype.constructor=createjs.CtrlFrame;

createjs.CtrlFrame.prototype.bind=function(bindObject){

	this.bindedObject=bindObject;

	var bounds=bindObject.getBounds();

	this.setBounds(bounds.x,bounds.y,bounds.width,bounds.height);

	this.x=bindObject.x;
	this.y=bindObject.y;
	this.sx=bindObject.scaleX;
	this.sy=bindObject.scaleY;
	this.rotation=bindObject.rotation;

	this.updateCircles();
	this.drawCircles();

};

createjs.CtrlFrame.prototype.updateBindedOject=function(){

	var bindedObject=this.bindedObject;

	bindedObject.x=this.x;
	bindedObject.y=this.y;
	bindedObject.scaleX=this.sx;
	bindedObject.scaleY=this.sy;
	bindedObject.rotation=this.rotation;

};

createjs.CtrlFrame.prototype.drawCircles=function(){

	var i=0,circle=null;
	var circles=this.circles;
	var colors=["red","orange","yellow","green","cyan","blue","purple","pink","lime"];

	var graphics=this.graphics;

	graphics.clear().setStrokeStyle(2).beginStroke("#0af");//beginStroke("#444");

	graphics.beginFill("rgba(0,0,0,0.01)").drawRect(circles[0].x,circles[0].y,circles[8].x<<1,circles[8].y<<1);
	
	for(i=0;i<this.circles.length;i++){
		/*if(i==4){
			continue;
		}*/
		circle=circles[i];
		graphics.beginFill(colors[i]).drawCircle(circle.x,circle.y,10).endFill();

	}
	
	graphics.endStroke();
	
	if(this.activeIndex>=0){
		circle=circles[this.activeIndex];
		graphics.beginFill("#0af").drawCircle(circle.x,circle.y,5).endFill();
	}

};

createjs.CtrlFrame.prototype.updateCircles=function(){

	var row,col,halfW,halfH;
	var circles=[];
	var bounds=this.getBounds();

	halfW=(bounds.width>>1)*this.sx;
	halfH=(bounds.height>>1)*this.sy;

	for(var i=0;i<9;i++){

		row=Math.floor(i/3);
		col=Math.floor(i%3);

		circles[i]=new createjs.Point((col-1)*halfW,(row-1)*halfH);

	}

	if(this.circles){

		this.circles.splice(0);

	}

	this.circles=circles;

};

createjs.CtrlFrame.prototype.decideActiveIndex=function(){

	var circles=this.circles;

	var bounds=this.getBounds();
	var theta=this.rotation*Math.PI/180;

	var dx=this.dx*Math.cos(-theta)-this.dy*Math.sin(-theta);
	var dy=this.dx*Math.sin(-theta)+this.dy*Math.cos(-theta);

	if(Math.abs(dx)>(bounds.width>>1)*Math.abs(this.sx)+20
		||Math.abs(dy)>(bounds.height>>1)*Math.abs(this.sy)+20){

		this.activeIndex=-1;

	}
	else{

		this.activeIndex=4;

		for(var i=0;i<9;i++){

			if(i==4){

				continue;

			}
			if(Math.abs(dx-circles[i].x)<20&&Math.abs(dy-circles[i].y)<20){

				this.activeIndex=i;

				break;

			}

		}
	}
	
};

createjs.CtrlFrame.prototype.checkState=function(x,y){
	
	if(x==undefined){
		
		this.activeIndex=-1;
		this.state="still";

		return;
		
	}

	this.dx=x-this.x;
	this.dy=y-this.y;

	this.decideActiveIndex();	

	switch(this.activeIndex){

		case 4:
			this.state="translate";
			break;
		case 0:
		case 2:
		case 6:
		case 8:
		case 5:
		case 7:
			this.state="scale";
			break;

		case 1:
		case 3:
			this.state="rotate";	
			break;

		default:
			this.state="still";

	}
	
	this.drawCircles();

	return this.state;

};

createjs.CtrlFrame.prototype.update=function(x,y){

	if(x==undefined || this.state=="still"){

		this.updateBindedOject();

		return;
	}

	if(this.state=="translate"){

		this.x=x-this.dx;
		this.y=y-this.dy;

	}else{

		this.dx=x-this.x;
		this.dy=y-this.y;

		if(this.state=="scale"){

			this.scale();

		}else{

			this.rotate();

		}

	}

	this.updateBindedOject();

};

createjs.CtrlFrame.prototype.scale=function(){

	var row=Math.floor(this.activeIndex/3);
	var col=Math.floor(this.activeIndex%3);
	//console.log("0,2,6,8");
	var theta=this.rotation*Math.PI/180;
	var cos=Math.cos(-theta);
	var sin=Math.sin(-theta);

	var bounds=this.getBounds();

	var dx=this.dx*cos-this.dy*sin;
	var dy=this.dx*sin+this.dy*cos;

	if(col!=1){

		this.sx=dx*(col-1)/(bounds.width>>1);

	}
	if(row!=1){

		this.sy=dy*(row-1)/(bounds.height>>1);

	}
	
	this.updateCircles();
	this.drawCircles();

};

createjs.CtrlFrame.prototype.rotate=function(){

	var delta=0;

	if(this.activeIndex==1){

		delta=Math.PI*0.5*(this.sy<0?-1:1);

	}else{

		delta=Math.PI*(this.sx<0?0:1);

	}

	var theta=Math.atan2(this.dy,this.dx)+delta;

	this.rotation=theta*180/Math.PI;

};

var enjolras = enjolras || { };

enjolras.BindObject=function(picture,bounds){
	
	this._bounds=bounds;
	this._position=picture.position;
	this._rotation=picture.rotation;
	this._scale=picture.scale;

	console.log("Enjolras: Create a binding between CreateJS and ThreeJS");
	
};

enjolras.BindObject.prototype={
	
	getBounds:function(){
		return this._bounds;
	},
	get x(){
		return this._position.x+(window.innerWidth>>1);
	},
	set x(value){
		this._position.x=(value-(window.innerWidth>>1));
	},
	get y(){
		return this._position.y+(window.innerHeight>>1);
	},
	set y(value){
		this._position.y=-(value-(window.innerHeight>>1));
	},
	get rotation(){
		return -this._rotation.z*180/Math.PI;
	},
	set rotation(value){
		this._rotation.z=-value*Math.PI/180;
	},
	get scaleX(){
		return this._scale.x;
	},
	set scaleX(value){
		this._scale.x=value;
	},
	get scaleY(){
		return this._scale.y;
	},
	set scaleY(value){
		this._scale.y=value;
	}
	
};