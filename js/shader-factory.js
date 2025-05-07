let gl, 
    resolutionUniformLocation, 
    timeUniform, 
    shaderCanvas,
    resized = true

export function initializeShader(canvas, vertexShaderSource, fragmentShaderSource) {
    shaderCanvas = canvas
    gl = canvas.getContext("webgl2", {antialias: false})
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    const program = createProgram(
        createShader(gl.VERTEX_SHADER, vertexShaderSource),
        createShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
    gl.useProgram(program)
    setPositions(program)
    resolutionUniformLocation = gl.getUniformLocation(program, 'resolution')
    timeUniform = gl.getUniformLocation(program, "time")
    window.onresize = () => resized = true
    window.requestAnimationFrame(render)
}

function render(timestamp) {
    updateUniforms(timestamp)
    const primitiveType = gl.TRIANGLES
    const offset = 0
    const count = 6
    gl.drawArrays(primitiveType, offset, count)
    window.requestAnimationFrame(render)
}

function updateUniforms(timestamp) {
    if (resized) {
        resized = false
        const size = getExactClientSize(shaderCanvas)
        shaderCanvas.width = Math.round(size.width * window.devicePixelRatio)
        shaderCanvas.height = Math.round(size.height * window.devicePixelRatio)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        gl.uniform2f(resolutionUniformLocation, shaderCanvas.width, shaderCanvas.height)
    }
    gl.uniform1f(timeUniform, timestamp / 10000)
}

function getExactClientSize(element) {
    const rect = element.getBoundingClientRect()
    const computedStyle = getComputedStyle(element)
    const scaleX = rect.width / parseFloat(computedStyle.width)
    const scaleY = rect.height / parseFloat(computedStyle.height)

    const intrinsicWidth = rect.width / scaleX
    const intrinsicHeight = rect.height / scaleY

    return {width: intrinsicWidth, height: intrinsicHeight};
}

function createShader(type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (success) {
        return shader
    }
}

function createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    return program
}

function setPositions(program) {
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,

        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ]), gl.STATIC_DRAW)
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const positionLocation = gl.getAttribLocation(program, 'position')
    const size = 2 // 2 components per iteration
    const type = gl.FLOAT
    const normalize = false
    const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0 // start at the beginning of the buffer
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset)
    gl.enableVertexAttribArray(positionLocation)
}