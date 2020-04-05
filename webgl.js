console.log('Webgl.js loaded')

// shader source
const vsSource = document.getElementById('vsSource').innerText
const fsSource = document.getElementById('fsSource').innerText

// size
const size = 1000000
const width = Math.sqrt(size/4)
if(width%1){
	console.error('ERROR: width')
}
const height = Math.sqrt(size/4)

let time = new Date()
const fps = 60

let pairCounter = 0

// canas
const canvas = document.createElement('canvas')
canvas.width = width
canvas.height = height
document.body.append(canvas)

let gl = canvas.getContext('webgl', {antialias: false})
if(!gl){
	gl = canvas.getContext('experimental-webgl')
}
if(!gl){
	alert('ERROR: webgl not supported. Please use an updated browser')
}

// gl.viewport(0,0,canvas.width,canvas.height)
// gl.clearColor(0,0,1,1)
// gl.clear(gl.COLOR_BUFFER_BIT)

const program = buildProgram()
gl.useProgram(program)

// locations
const attribLocations = []
for(let i=0;i<gl.getProgramParameter(program,gl.ACTIVE_ATTRIBUTES);i++){
	const attribName = gl.getActiveAttrib(program,i).name
	attribLocations[attribName] = gl.getAttribLocation(program,attribName)
}

const uniformLocations = []
for(let i=0;i<gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS);i++){
	const uniformName = gl.getActiveUniform(program,i).name
	uniformLocations[uniformName] = gl.getUniformLocation(program,uniformName)
}

// data
let data = [
// x,y,texX,texY
	-1,-1,	0,0,
	1,-1,		1,0,
	-1,1,		0,1,

	-1,1,		0,1,
	1,-1,		1,0,
	1,1,		1,1
]

// buffer
const dataBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER,dataBuffer)
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW)

// pointer
gl.vertexAttribPointer(
	attribLocations.a_Position,
	2,
	gl.FLOAT,
	0,
	4*Float32Array.BYTES_PER_ELEMENT,
	0,
)
gl.enableVertexAttribArray(attribLocations.a_Position)
// pointer
gl.vertexAttribPointer(
	attribLocations.a_TexCoord,
	2,
	gl.FLOAT,
	0,
	4*Float32Array.BYTES_PER_ELEMENT,
	2*Float32Array.BYTES_PER_ELEMENT,
)
gl.enableVertexAttribArray(attribLocations.a_TexCoord)

// uniform
gl.uniform1f(uniformLocations.u_PixDia,1/canvas.width)

// texture
// gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true)

// render

let textures = []
let fbs = []
for(let i=0;i<2;i++){
	textures[i] = buildTexture(null) 
	fbs[i] = buildFramebuffer(textures[i])
}
updateTextureData(textures[0],genBottomPaddedTexture())



looper()
read()

function eachFrame(){
	setTexFramebufferPair(pairCounter)
	gl.drawArrays(gl.TRIANGLES,0,data.length/2)
	read()

	// DRAWING TO CANVAS
	drawToCanvas(0)
	pairCounter++
	if(pairCounter==2){
		pairCounter=0
	}
	console.log('rendered')
}

function looper(){
	if(new Date() - time > 1000/fps){
		eachFrame()
		time = new Date()
	}

	requestAnimationFrame(looper)
}

function drawToCanvas(debugOn){
	gl.uniform1i(uniformLocations.u_FinalRender,!debugOn)
	gl.bindFramebuffer(gl.FRAMEBUFFER,null)
	gl.drawArrays(gl.TRIANGLES,0,data.length/2)
	gl.uniform1i(uniformLocations.u_FinalRender,false)
}
var readBuffer
function read(){
	readBuffer = new Uint8Array(size)
	gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,readBuffer)
	// console.log(readBuffer)
}

/// FUNCTIONS
function setTexFramebufferPair(i){
	gl.bindTexture(gl.TEXTURE_2D,textures[i])
	gl.bindFramebuffer(gl.FRAMEBUFFER,fbs[(i+1)%2])
}

// function genBottomPaddedTexture(){
// 	const padTex = new Uint8Array(size)
// 	for(let y=0;y<height;y++){
// 		for(let x=0;x<width;x++){
// 			if(y===0 && x===0){
// 				padTex[y*width*4 + x*4 + 0] = 255
// 				padTex[y*width*4 + x*4 + 1] = 0
// 				padTex[y*width*4 + x*4 + 2] = 0
// 				padTex[y*width*4 + x*4 + 3] = 255
// 			}else{
// 				if(y===height-1){
// 					// Bottom of
// 					padTex[y*width*4 + x*4 + 0] = 0
// 					padTex[y*width*4 + x*4 + 1] = 255
// 					padTex[y*width*4 + x*4 + 2] = 0
// 					padTex[y*width*4 + x*4 + 3] = 255
// 				}else{
// 					padTex[y*width*4 + x*4 + 0] = 0
// 					padTex[y*width*4 + x*4 + 1] = 0
// 					padTex[y*width*4 + x*4 + 2] = 0
// 					padTex[y*width*4 + x*4 + 3] = 255
// 				}
// 			}
// 		}
// 	}
// 	return padTex
// }
function genBottomPaddedTexture(){
	const padTex = new Uint8Array(size)
	for(let y=0;y<height;y++){
		for(let x=0;x<width;x++){
			if(y===height-1){
				padTex[y*width*4 + x*4 + 0] = 0
				if(x===0){
					padTex[y*width*4 + x*4 + 0] = 255
				}
				padTex[y*width*4 + x*4 + 1] = 0
				padTex[y*width*4 + x*4 + 2] = 255
				padTex[y*width*4 + x*4 + 3] = 255
			}else{
				if(y===0){
					// Bottom of
					padTex[y*width*4 + x*4 + 0] = 0
					padTex[y*width*4 + x*4 + 1] = 255
					padTex[y*width*4 + x*4 + 2] = 0
					padTex[y*width*4 + x*4 + 3] = 255
				}else{
					padTex[y*width*4 + x*4 + 0] = 0
					padTex[y*width*4 + x*4 + 1] = 0
					padTex[y*width*4 + x*4 + 2] = 0
					padTex[y*width*4 + x*4 + 3] = 255
				}
			}
		}
	}
	return padTex
}

function updateTextureData(tex,pixelData){
	gl.bindTexture(gl.TEXTURE_2D,tex)
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,canvas.width,canvas.height,0,gl.RGBA,gl.UNSIGNED_BYTE,pixelData)
}

function buildFramebuffer(tex){
	const fb = gl.createFramebuffer()
	gl.bindFramebuffer(gl.FRAMEBUFFER,fb)
	gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0)
	return fb
}

function buildTexture(pixelData){
	const texture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D,texture)
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,canvas.width,canvas.height,0,gl.RGBA,gl.UNSIGNED_BYTE,pixelData)

	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST)

	return texture
}

function buildShader(type,source){
	const shader = gl.createShader(type)
	gl.shaderSource(shader,source)
	gl.compileShader(shader)
	if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
		throw new Error('ERROR: compiling shader of type '+type+' . Info: '+gl.getShaderInfoLog(shader))
	}
	return shader
}

function buildProgram(){
	const program = gl.createProgram()
	gl.attachShader(program,buildShader(gl.VERTEX_SHADER,vsSource))
	gl.attachShader(program,buildShader(gl.FRAGMENT_SHADER,fsSource))
	gl.linkProgram(program)
	gl.validateProgram(program)

	if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
		throw new Error('Error: linking program. Info: '+gl.getProgramInfoLog(program))
	}
	if(!gl.getProgramParameter(program,gl.VALIDATE_STATUS)){
		throw new Error('ERROR: validating program. Info: '+gl.getProgramInfoLog(program))
	}
	return program
}


// mag and min filter?
// better size => width, height functions