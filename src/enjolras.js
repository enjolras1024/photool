var enjolras = enjolras || { };

enjolras.CtrlFrame=function(bindObject){

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

enjolras.CtrlFrame.prototype=Object.create(createjs.Shape.prototype);

enjolras.CtrlFrame.prototype.constructor=createjs.CtrlFrame;

enjolras.CtrlFrame.prototype.bind=function(bindObject){

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

enjolras.CtrlFrame.prototype.updateBindedOject=function(){

  var bindedObject=this.bindedObject;

  bindedObject.x=this.x;
  bindedObject.y=this.y;
  bindedObject.scaleX=this.sx;
  bindedObject.scaleY=this.sy;
  bindedObject.rotation=this.rotation;

};

enjolras.CtrlFrame.prototype.drawCircles=function(){

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

enjolras.CtrlFrame.prototype.updateCircles=function(){

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

enjolras.CtrlFrame.prototype.decideActiveIndex=function(){

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

enjolras.CtrlFrame.prototype.checkState=function(x,y){

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

enjolras.CtrlFrame.prototype.update=function(x,y){

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

enjolras.CtrlFrame.prototype.scale=function(){

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

enjolras.CtrlFrame.prototype.rotate=function(){

  var delta=0;

  if(this.activeIndex==1){

    delta=Math.PI*0.5*(this.sy<0?-1:1);

  }else{

    delta=Math.PI*(this.sx<0?0:1);

  }

  var theta=Math.atan2(this.dy,this.dx)+delta;

  this.rotation=theta*180/Math.PI;

};

// Create a binding between CreateJS and ThreeJS
enjolras.BindObject=function(picture,bounds){

  this._bounds=bounds;
  this._position=picture.position;
  this._rotation=picture.rotation;
  this._scale=picture.scale;

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