console.log('main.js loaded')
const cssBorder = 1




canvas.addEventListener('mousemove',e=>{
	if(e.which===1){
		const realPos = getRealPos(e.offsetX,e.offsetY)
		spawnSandGroup(realPos[0],realPos[1])
	}
})

function getRealPos(x,y){
	return [x,height-y-cssBorder]
}

function spawnSandGroup(x,y){
	spawnSand(x,y)
	spawnSand(x,y-1)
	spawnSand(x,y-2)
}

function spawnSand(x,y){
	// const oldTexture = new Uint8Array(size)
	// gl.drawArrays(gl.TRIANGLES,0,data.length/2)
	// gl.drawArrays(gl.TRIANGLES,0,data.length/2)
	// gl.drawArrays(gl.TRIANGLES,0,data.length/2)
	// gl.drawArrays(gl.TRIANGLES,0,data.length/2)
	// gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,oldTexture)
	// console.log('oldTexture')
	// console.log(readBuffer)
	writePixel(readBuffer,x,y,255,0,0)
	// console.log('pairCounter',pairCounter)
	gl.bindTexture(gl.TEXTURE_2D,textures[pairCounter])
	// console.log('NEW read()')
	// console.log(read())
	// console.log('oldTexture()')
	// console.log(readBuffer)
	// console.log('NEW NEW NEW')
	// console.log(oldTexture)
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		canvas.width,
		canvas.height,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		readBuffer
	)
	// console.log(x,y)
}


function writePixel(arr,x,y,r=255,g=255,b=255){
	// y from the bottom
	arr[y*width*4+x*4+0] = r
	// arr[y*width*4+x*4+1] = g
	// arr[y*width*4+x*4+2] = b
	// arr[y*width*4+x*4+3] = 255
}