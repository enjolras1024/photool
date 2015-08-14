var stage=null,
    ctrlframe=null,
    needToUpdate=true,

    renderer=null,
    scene=null,
    camera=null,
    texture=null,
    picture=null,
    threshold=null,
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

    ctrlframe=new enjolras.CtrlFrame(bindObject);

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
			
		};
			
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