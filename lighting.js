// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV; 
  attribute vec3 a_Normal;
  varying vec2 v_UV; 
  varying vec3 v_Normal; 
  varying vec4 v_vertPos; 
  varying vec4 v_vertPos2; 
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix; 
  uniform mat4 u_ViewMatrix;

  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix; 
  void main() {
   gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
   v_UV = a_UV;
  
  // v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
   v_Normal = a_Normal; 
   v_vertPos = u_ModelMatrix * a_Position; 
   v_vertPos2 = u_ModelMatrix * a_Position;
  
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV; 
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform vec3 u_lightPos; 
  uniform vec3 u_lightPos2; 
  uniform vec3 u_cameraPos; 
  varying vec4 v_vertPos; 
  varying vec4 v_vertPos2; 
  uniform sampler2D u_Sampler0;
  uniform bool u_lightOn; 
  uniform bool u_spotLight; 
  uniform int u_shiny; 
  uniform float u_red;
  uniform float u_green;
  uniform float u_blue;
  uniform int u_whichTexture; 

  void main() {
    if(u_whichTexture == -3){
      gl_FragColor = vec4((v_Normal + 1.0)/2.0,1.0);
    }
   else if(u_whichTexture == -2){
      gl_FragColor = u_FragColor; 
    }
    else if(u_whichTexture == -1){
      gl_FragColor = vec4(v_UV, 02.0,1.0);
    }
   else if(u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
   else if (u_whichTexture == 1) {
      // Gradient from top (lighter) to bottom (darker)
      vec3 topColor = vec3(0.678, 0.847, 0.902);  // Light blue (sky color)
      vec3 bottomColor = vec3(0.2, 0.4, 0.8);     // Deep blue (horizon)
      float mixFactor = v_UV.y; // Use the y-coordinate for blending
      gl_FragColor = vec4(mix(bottomColor, topColor, mixFactor), 1.0);
    }
   else if(u_whichTexture == 5){
      gl_FragColor = vec4(0.0,0.1,0.9,1.0);
    }


  vec3 lightVector = u_lightPos -  vec3(v_vertPos); 
  vec3 lightVector2 = u_lightPos2 - vec3(v_vertPos2);
  float r = length(lightVector); 
  float r2 = length(lightVector2); 
  vec3 L = normalize(lightVector);
  vec3 L2 = normalize(lightVector2);
  vec3 N = normalize(v_Normal);

  float nDotL = max(dot(N,L) , 0.0);
  float nDotL2 = max(dot(N,L2),0.0);

  vec3 R = reflect(-L,N); 
  vec3 R2 = reflect(-L2, N);

  vec3 E = normalize(u_cameraPos-vec3(v_vertPos));
  vec3 E2 = normalize(u_cameraPos-vec3(v_vertPos2));

  float spec = pow(max(dot(E,R), 0.0), 50.0);
  float spec2 = pow(max(dot(E2,R2), 0.0), 10.0);

  vec3 spotDiffuse = vec3(gl_FragColor) * nDotL2 * 0.7;
 
  vec3 lightToFragment = normalize(vec3(v_vertPos2) - u_lightPos2);
  vec3 spotDirection = vec3(-0.4, -1.0, 0.0);
  float spotCosAngle = dot(normalize(spotDirection), lightToFragment);
    

float spotCutOff = 0.866; 

float spotIntensity = spotCosAngle;


vec3 diffuse = vec3(gl_FragColor) * nDotL *0.7; 

vec3 diffuse2 = vec3(gl_FragColor) * nDotL2 *0.7 *spotIntensity; 
vec3 specular2 = vec3(1.0, 1.0, 1.0) * spec2 * spotIntensity;

vec3 ambient = vec3(gl_FragColor) * 0.3; 
 
vec4 specColor = spec2 * vec4(u_red, u_green, u_blue,1.0);

 if(spotCosAngle > spotCutOff && u_spotLight) {
    
    spotIntensity = spotCosAngle;

 if(u_spotLight && u_lightOn && u_shiny == 0){

  gl_FragColor = vec4(spec + spec2 +  diffuse + diffuse2 + ambient, 1.0) * vec4(u_red,u_green, u_blue,1.0);

}

else if(u_spotLight && !(u_lightOn) && u_shiny == 0){
  
gl_FragColor = vec4(specular2 + diffuse2 + ambient, 1.0);
}
}
else if(!(u_spotLight) && u_lightOn && u_shiny == 0){
  gl_FragColor = vec4(spec + diffuse + ambient, 1.0)  * vec4(u_red, u_green, u_blue,1.0);
}

else if(!u_spotLight && u_lightOn && u_shiny == 1){
gl_FragColor = vec4(diffuse + ambient, 1.0)  * vec4(u_red, u_green, u_blue,1.0);

}
else{
 
  gl_FragColor = vec4(ambient, 1.0); 
}
}`

let canvas;

let gl;
let a_Position;
let u_FragColor;
let a_UV; 
let a_Normal;
let u_Size;
let u_lightPos; 
let u_lightPos2; 
let u_lightOn; 
let u_spotLight; 
let u_spotCutOff;
let u_spotDirection;
let u_cameraPos; 
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_NormalMatrix;
let u_ViewMatrix; 
let u_ProjectionMatrix; 
let u_Sampler0; 
let u_whichTexture; 
let u_shiny; 
let u_red;
let u_blue; 
let u_green;  



function setupWebGL(){
  // Retrieve <canvas> element  
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  
}

function connectVariablesToGLSL(){

   // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
    // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
      //Get the storage location of a a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if(a_UV < 0){
    console.log('Failed to get storage location of a_UV');
  }
      //Get the storage location of a normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0){
    console.log('Failed to get storage location of a_Normal');
  }
     //Get the storage location of a a_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
    //Get the storage location of a a_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if(!u_ModelMatrix){
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }
       //Get the storage location of a a_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  if(!u_GlobalRotateMatrix){
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if(!u_ViewMatrix){
    console.log("Failed to get storage location of u_ViewMatrix");
    return; 
  }
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if(!u_ProjectionMatrix){
      console.log("Failed to get storage location of u_ProjectionMatrix");
  }
  u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  if(!u_ProjectionMatrix){
      console.log("Failed to get storage location of u_NormalMatrix");
  }
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
      console.error('Failed to get uniform location for u_whichTexture');
      return false;
  }
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
      console.error('Failed to get uniform location for u_lightPos');
      return false;
  }
  u_lightPos2 = gl.getUniformLocation(gl.program, 'u_lightPos2');
  if (!u_lightPos2) {
      console.error('Failed to get uniform location for u_lightPos2');
      return false;
  }
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
      console.error('Failed to get uniform location for u_cameraPos');
      return false;
  }
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
      console.error('Failed to get uniform location for u_lightOn');
      return false;
  }
  u_spotLight = gl.getUniformLocation(gl.program, 'u_spotLight');
  if (!u_spotLight) {
      console.error('Failed to get uniform location for u_spotLight');
      return false;
  }
  u_shiny = gl.getUniformLocation(gl.program, 'u_shiny');
  if (!u_shiny) {
    console.error('Failed to get uniform location for u_shiny');
    return false;
  }
  u_red = gl.getUniformLocation(gl.program, 'u_red');
  if (!u_red) {
    console.error('Failed to get uniform location for u_red');
    return false;
  }
  u_green = gl.getUniformLocation(gl.program, 'u_green');
  if (!u_green) {
    console.error('Failed to get uniform location for u_green');
    return false;
  }
  u_blue = gl.getUniformLocation(gl.program, 'u_blue');
  if (!u_blue) {
    console.error('Failed to get uniform location for u_blue');
    return false;
  }
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}


//citation to use provided by classmate Tori Cooper
//https://math.hws.edu/eck/cs424/notes2013/webgl/cube-with-rotator.html

let isDragging = false;
let lastX = 0;

//initilizing rotation with mouse control 
function initMouseControl() {
  canvas.onmousedown = (ev) => {
      isDragging = true;
      lastX = ev.clientX;
  };
  canvas.onmouseup = () => {
      isDragging = false;
  };
  canvas.onmouseleave = () => {
      isDragging = false;
  };
  canvas.onmousemove = (ev) => {
      let deltaX = ev.clientX - lastX;
      lastX = ev.clientX;

      //normalize rotation
      g_globalAngle = (g_globalAngle + deltaX * 0.5) % 360;

      requestAnimationFrame(renderAllShapes);
  };
}

function updateRotationFromSlider(sliderValue) {
  g_globalAngle = parseFloat(sliderValue) % 360;
  if (g_globalAngle < 0) g_globalAngle += 360;
  lastAngle = g_globalAngle; 
  requestAnimationFrame(renderAllShapes);
}

//tick animation function 
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime; 

function tick(){

  g_seconds = performance.now()/1000.0 - g_startTime; 
  console.log(performance.now());

  updateAnimationAngle();

  renderAllShapes();

  requestAnimationFrame(tick);

}

var g_shapesList = [];

function conversion(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return[x,y];
}

function updateAnimationAngle(){
 
  if(g_animate){
  g_lightPos[0] = Math.sin(g_seconds); 
  }
}

let camera;
let g_globalMove = 0; 
let g_globalMoveL = 0;
let g_globalTurn = 0; 
let g_lightPos2 = [3.0,2.5,1.0];
let g_lightOn = 1; 
let g_spotLight = false; 
let g_found = 0; 

function renderAllShapes() {
  
gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
gl.uniform3f(u_lightPos2, g_lightPos2[0], g_lightPos2[1], g_lightPos2[2]);
console.log("spotline on: " + g_spotLight);

var startTime = performance.now();
gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements)

var globalRotMatrix = new Matrix4().rotate(g_globalAngle,0,1,0);
gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMatrix.elements);
gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


gl.uniform1i(u_lightOn, g_lightOn);
gl.uniform1i(u_spotLight, g_spotLight);
gl.uniform1f(u_red, g_color[0]);
gl.uniform1f(u_green, g_color[1]);
gl.uniform1f(u_blue, g_color[2]);


var sky =  new Cube();
sky.color = [0.95,0.7,0.2,1.0]
if(g_normalOn == true){
   sky.textureNumber = -3;
   sky.shiny = 1; 
   
 }
 if(g_normalOn == false){
   sky.textureNumber = 1;
   sky.shiny = 1;  
 }
 sky.color = [1.0,1.0,0.0,1.0];

sky.matrix.scale(-15, -15, -15);
sky.matrix.translate(-0.5, -0.5, -0.5);
sky.render(); 

var floor =  new Cube();
floor.color = [0.95,0.7,0.2,1.0];
floor.textureNumber = -2; 
floor.shiny = 1; 
floor.matrix.translate(0.0, -0.75, 0.0);
floor.matrix.scale(15,0.02,15);
floor.matrix.translate(-0.5, 0, -0.5);
floor.render(); 

var ball =  new Sphere();
ball.color = [0.0,0.0,0.0,1.0];
 if(g_normalOn == true){
//   console.log("normal is true"); 
  this.shiny = 0; 
   ball.textureNumber = -3;
 }
if(g_normalOn == false){
  this.shiny = 0;
   ball.textureNumber = -3; 
 }

ball.matrix.scale(1, 1, 1);
ball.matrix.translate(2.7, 0.5, 0.8);
ball.render(); 

var new_cube =  new Cube();
new_cube.textureNumber=-2
new_cube.color = [0.0,1.0,0.0,1.0];
new_cube.matrix.scale(1.8, 1.8, 1.8);
new_cube.matrix.translate(-1.8, 0.5, -0.7);
new_cube.render(); 


var light_cube = new Cube();
light_cube.textureNumber = -2; 
light_cube.color = [2.0,2.0,0.0,1.0];
light_cube.matrix.translate(0.0,0.0,1.0);
light_cube.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
light_cube.matrix.scale(-0.1,-0.1,-0.1);
light_cube.render();


// === CRAB BODY ===
var body = new Cube();
if(g_normalOn == true){
  body.textureNumber = -3;
} else {
  body.textureNumber = -2; 
}
body.color = [0.8, 0.4, 0.3, 1.0]; // Tanish red color
body.matrix.translate(-.5, -0.4, 0.0);
body.matrix.translate(0, 0, g_globalMove);
body.matrix.translate(g_globalMoveL, 0, 0);
body.matrix.scale(0.95, 0.2, 0.45);
body.render();

// === CRAB TOP BODY (Extended) ===
var topBody = new Cube();
if(g_normalOn == true){
  topBody.textureNumber = -3;
} else {
  topBody.textureNumber = -2; 
}
topBody.color = [1.0, 0.0, 0.0, 1.0]; // Bright red for emphasis
topBody.matrix.translate(-0.6, -0.2, -.17); // Positioned above the body
topBody.matrix.translate(0, 0, g_globalMove);
topBody.matrix.translate(g_globalMoveL, 0, 0);
topBody.matrix.scale(1.2, 0.4, 0.8); // Slightly longer and thinner
topBody.render();

// === CRAB LEGS (Underneath) ===
let legColor = [0.7, 0.3, 0.2, 1.0]; // Slightly darker red for legs

// Use g_globalLeg in place of the missing g_legAngle1 variable
for (let i = 0; i < 3; i++) {
  let legLeft = new Cube();
  if(g_normalOn == true){
    legLeft.textureNumber = -3;
  } else {
    legLeft.textureNumber = -2; 
  }
  legLeft.color = legColor;
  legLeft.matrix.translate(-0.2 - i * 0.1, -0.3, 0.1); // Underneath the body
  legLeft.matrix.translate(0, 0, g_globalMove);
  legLeft.matrix.translate(g_globalMoveL, 0, 0);
  legLeft.matrix.rotate(-15, 0, g_globalLeg + i * 10, 1); // Using g_globalLeg instead
  legLeft.matrix.rotate(100, 1, 0, 0); // **Still pointing downward**
  legLeft.matrix.scale(0.05, 0.2, 0.35);
  legLeft.render();

  let legRight = new Cube();
  if(g_normalOn == true){
    legRight.textureNumber = -3;
  } else {
    legRight.textureNumber = -2; 
  }
  legRight.color = legColor;
  legRight.matrix.translate(0.1 + i * 0.1, -0.3, 0.1);
  legRight.matrix.translate(0, 0, g_globalMove);
  legRight.matrix.translate(g_globalMoveL, 0, 0);
  legRight.matrix.rotate(15, 0, -g_globalLeg - i * 10, 1); // Using g_globalLeg instead
  legRight.matrix.rotate(100, 1, 0, 0); // **Still pointing downward**
  legRight.matrix.scale(0.05, 0.2, 0.35);
  legRight.render();
}

// === CRAB ARMS ===
// Using g_globalHead in place of g_armAngle
var armLeft = new Cube();
if(g_normalOn == true){
  armLeft.textureNumber = -3;
} else {
  armLeft.textureNumber = -2; 
}
armLeft.color = [0.9, 0.6, 0.2, 1.0]; // Brighter red for claws
armLeft.matrix.translate(-0.8, 0.25, 0.0); // Moved higher
armLeft.matrix.translate(0, 0, g_globalMove);
armLeft.matrix.translate(g_globalMoveL, 0, 0);
armLeft.matrix.rotate(-30 + g_globalArm, 0, 0, 1); 
armLeft.matrix.scale(0.35, 0.1, 0.3);
armLeft.render();

// Save matrix for child joint
var leftArmMatrix = new Matrix4(armLeft.matrix);

// Left Forearm (Child of Upper Arm)
var forearmLeft = new Cube();
if(g_normalOn == true){
  forearmLeft.textureNumber = -3;
} else {
  forearmLeft.textureNumber = -2; 
}
forearmLeft.color = [0.9, 0.3, 0.2, 1.0];
forearmLeft.matrix = new Matrix4(leftArmMatrix);
forearmLeft.matrix.translate(-0.9, 0.2, 0.0);  // Move from the end of upper arm
forearmLeft.matrix.rotate(-30 + g_globalArm, 0, 0, 1); 
forearmLeft.matrix.scale(1.1, 1.2, 1.1);
forearmLeft.render();

// Save matrix for claw children
var leftForearmMatrix = new Matrix4(forearmLeft.matrix);

// Left Claw 1 (Child of Forearm)
// Using g_globalTail for claw angle
var clawLeft1 = new Cube();
if(g_normalOn == true){
  clawLeft1.textureNumber = -3;
} else {
  clawLeft1.textureNumber = -2; 
}
clawLeft1.color = [0.8, 0.1, 0.1, 1.0];
clawLeft1.matrix = new Matrix4(leftForearmMatrix);
clawLeft1.matrix.translate(1.1, 0.5, 0.05);  // Position at tip
clawLeft1.matrix.rotate(20 + g_globalClaw, 0, 0, 1); 
clawLeft1.matrix.scale(1.1, 1.2, 1.1);
clawLeft1.matrix.scale(-1, 1, 1);
clawLeft1.render();

// Left Claw 2 (Child of Forearm)
var clawLeft2 = new Cube();
if(g_normalOn == true){
  clawLeft2.textureNumber = -3;
} else {
  clawLeft2.textureNumber = -2; 
}
clawLeft2.color = [0.8, 0.1, 0.1, 1.0];
clawLeft2.matrix = new Matrix4(leftForearmMatrix);
clawLeft2.matrix.translate(-1.2, 0.2, -0.05);
clawLeft2.matrix.rotate(-20 - g_globalClaw, 0, 0, 1);  
clawLeft2.matrix.scale(1.1, 1.2, 1.1);
clawLeft2.render();

var armRight = new Cube();
if(g_normalOn == true){
  armRight.textureNumber = -3;
} else {
  armRight.textureNumber = -2; 
}
armRight.color = [0.9, 0.6, 0.2, 1.0];
armRight.matrix.translate(0.55, 0.05, 0.0);
armRight.matrix.translate(0, 0, g_globalMove);
armRight.matrix.translate(g_globalMoveL, 0, 0);
armRight.matrix.rotate(30 + g_globalArm, 0, 0, 1); 
armRight.matrix.scale(0.35, 0.1, 0.3);
armRight.render();

var rightArmMatrix = new Matrix4(armRight.matrix);

// Right Forearm (Child)
var forearmRight = new Cube();
if(g_normalOn == true){
  forearmRight.textureNumber = -3;
} else {
  forearmRight.textureNumber = -2; 
}
forearmRight.color = [0.9, 0.3, 0.2, 1.0];
forearmRight.matrix = new Matrix4(rightArmMatrix);
forearmRight.matrix.translate(1.1, -0.1, 0.0);
forearmRight.matrix.rotate(30 + g_globalArm, 0, 0, 1); 
forearmRight.matrix.scale(1.1, 1.2, 1.1);
forearmRight.render();

var rightForearmMatrix = new Matrix4(forearmRight.matrix);

// Right Claw 1
var clawRight1 = new Cube();
if(g_normalOn == true){
  clawRight1.textureNumber = -3;
} else {
  clawRight1.textureNumber = -2; 
}
clawRight1.color = [0.8, 0.1, 0.1, 1.0];
clawRight1.matrix = new Matrix4(rightForearmMatrix);
clawRight1.matrix.translate(0.6, -0.1, 0.05);
clawRight1.matrix.rotate(-20 + g_globalClaw, 0, 0, 1); 
clawRight1.matrix.scale(1.1, 1.2, 1.1);
clawRight1.render();

// Right Claw 2
var clawRight2 = new Cube();
if(g_normalOn == true){
  clawRight2.textureNumber = -3;
} else {
  clawRight2.textureNumber = -2; 
}
clawRight2.color = [0.8, 0.1, 0.1, 1.0];
clawRight2.matrix = new Matrix4(rightForearmMatrix);
clawRight2.matrix.translate(0.8, 0.8, -0.05);
clawRight2.matrix.rotate(20 - g_globalClaw, 0, 0, 1);
clawRight2.matrix.scale(-1.1, 1.2, 1.1);
clawRight2.render();

// === CRAB EYE STALKS ===
var eyeStalkLeft = new Cube();
if(g_normalOn == true){
  eyeStalkLeft.textureNumber = -3;
} else {
  eyeStalkLeft.textureNumber = -2; 
}
eyeStalkLeft.color = [1.0, 1.0, 1.0, 1.0];
eyeStalkLeft.matrix.translate(-0.25, 0.15, 0.1);
eyeStalkLeft.matrix.translate(0, 0, g_globalMove);
eyeStalkLeft.matrix.translate(g_globalMoveL, 0, 0);
eyeStalkLeft.matrix.scale(0.10, 0.5, 0.15);
eyeStalkLeft.render();

var eyeStalkRight = new Cube();
if(g_normalOn == true){
  eyeStalkRight.textureNumber = -3;
} else {
  eyeStalkRight.textureNumber = -2; 
}
eyeStalkRight.color = [1.0, 1.0, 1.0, 1.0];
eyeStalkRight.matrix.translate(0.15, 0.15, 0.1);
eyeStalkRight.matrix.translate(0, 0, g_globalMove);
eyeStalkRight.matrix.translate(g_globalMoveL, 0, 0);
eyeStalkRight.matrix.scale(0.10, 0.5, 0.15);
eyeStalkRight.render();

// === CRAB EYES ===
var eyeLeft = new Cube();
if(g_normalOn == true){
  eyeLeft.textureNumber = -3;
} else {
  eyeLeft.textureNumber = -2; 
}
eyeLeft.color = [0, 0, 0, 1.0]; // Black eyes
eyeLeft.matrix.translate(-0.27, 0.45, 0.0);
eyeLeft.matrix.translate(0, 0, g_globalMove);
eyeLeft.matrix.translate(g_globalMoveL, 0, 0);
eyeLeft.matrix.scale(0.1, 0.1, 0.1);
eyeLeft.render();

var eyeRight = new Cube();
if(g_normalOn == true){
  eyeRight.textureNumber = -3;
} else {
  eyeRight.textureNumber = -2; 
}
eyeRight.color = [0, 0, 0, 1.0];
eyeRight.matrix.translate(0.16, 0.45, 0.0);
eyeRight.matrix.translate(0, 0, g_globalMove);
eyeRight.matrix.translate(g_globalMoveL, 0, 0);
eyeRight.matrix.scale(0.1, 0.1, 0.1);
eyeRight.render();


var duration = performance.now() - startTime;
sendTextToHTML("ms: " + Math.floor(duration) + "  fps: " + Math.floor(10000/duration)/10, "numbd")
sendTextToHTML("moving light at x: " + g_lightPos[0].toFixed(2) + "  y: " + g_lightPos[1] + " z: " + g_lightPos[2], "lightstatus");


}

function sendTextToHTML(text, htmlId){

var HTMLelm = document.getElementById(htmlId);

if(!HTMLelm){
  console.log("Failed to get" +htmlId);
  return;
}

HTMLelm.innerHTML = text;
}

let g_globalAngle = 0;
let g_globalLeg = 0;
let g_globalClaw = 0; 
let g_globalClaw2 = 0; 
let g_globalClaw3 = 0; 
let g_globalArm = 0; 
let g_animate = true; 
let g_lightPos = [0,1,2];
let g_color = [1.0,1.0,1.0,1.0];
let g_normalOn = false; 

function userInterface(){
    document.getElementById("normal_on").onclick = function(){g_normalOn = true;};
    document.getElementById("normal_off").onclick = function(){g_normalOn = false;};
    document.getElementById("light_on").onclick = function(){g_lightOn = true;};
    document.getElementById("light_off").onclick = function(){g_lightOn = false;};
    document.getElementById("spotlight_on").onclick = function(){ g_spotLight = true; renderAllShapes(); };
    document.getElementById("spotlight_off").onclick = function(){ g_spotLight = false; renderAllShapes(); };
    document.getElementById("animate_off").onclick = function(){ g_animate = false;};
    document.getElementById("animate_on").onclick = function(){ g_animate = true;};
    document.getElementById("camera_slide").addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
    document.getElementById("x_slide").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_lightPos[0] = this.value/100; renderAllShapes();}});
    document.getElementById("y_slide").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_lightPos[1] = this.value/100; renderAllShapes();}});
    document.getElementById("z_slide").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_lightPos[2] = this.value/100; renderAllShapes();}});
    document.getElementById("red_slide").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_color[0] = this.value; renderAllShapes();}});
    document.getElementById("green_slide").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_color[1] = this.value; renderAllShapes();}});
    document.getElementById("blue_slide").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_color[2] = this.value; renderAllShapes();}});
}

//Function for awsd and arrow movement
function keydown(ev){
  if(ev.keyCode == 65){
    camera.moveLeft();
  }
  if(ev.keyCode == 68){
    camera.moveRight(); 
  }
  if(ev.keyCode == 87){
    camera.moveForward();
  }
  if(ev.keyCode == 83){
    camera.moveBackward();
  }
  if(ev.keyCode == 81){
    camera.panLeft(); 
  }
  if(ev.keyCode == 69){
    camera.panRight();
  }
  if(ev.keyCode == 38){
    g_globalMove -= 0.1; 
  }
  if(ev.keyCode == 40){
    g_globalMove += 0.1; 
  }
  if(ev.keyCode == 37){
    g_globalMoveL -= 0.1; 
  }
  if(ev.keyCode == 39){
    g_globalMoveL += 0.1; 
  }

  renderAllShapes();
  console.log(ev.keyCode);

}
function main() {
  // Initialize WebGL and shaders
  setupWebGL();
  connectVariablesToGLSL();
  userInterface();
  camera = new Camera(canvas.width/canvas.height, 0, 1000);
  document.onkeydown = keydown;
  renderAllShapes(); 

  gl.clearColor(0.0,0.0,0.0,1.0);

 requestAnimationFrame(tick);
}