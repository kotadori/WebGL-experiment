document.addEventListener('DOMContentLoaded', function () {

    const canvas = document.getElementById('canvas');
    canvas.width = 700;
    canvas.height = 700;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);

    const program = glInitShader();

    const uMVLocation = gl.getUniformLocation(program, 'uMVMatrix');
    const uPrLocation = gl.getUniformLocation(program, 'uPrMatrix');

    let MVMat = glMatrix.mat4.create();
    let ModelMat = glMatrix.mat4.create();
    let ViewMat = glMatrix.mat4.create();
    let PrMat = glMatrix.mat4.create();
    let MVMatStack = [];

    let eye = glMatrix.vec3.fromValues(0, 5, 5);
    let center = glMatrix.vec3.fromValues(0, 0, 0);
    let up = glMatrix.vec3.fromValues(0, 1, 0);

    glMatrix.mat4.lookAt(ViewMat, eye, center, up);
    glMatrix.mat4.perspective(PrMat, 90 * Math.PI / 180,
        canvas.width / canvas.height, 0.1, 20);

    const triangleVertexPos = [
         0.0,  0.0, 0.0,
        -0.4, -0.4, 0.0,
         0.4, -0.4, 0.0,

         0.0,  0.0, 0.0,
        -0.4,  0.4, 0.0,
         0.4,  0.4, 0.0
    ];

    const triangleVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertexPos), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    let frame = 0;

    function render() {
        frame++;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(uPrLocation, false, PrMat);

        let animAngle = (frame % 360) * Math.PI / 180;

        // 右の柱
        glMatrix.mat4.identity(ModelMat);
        glMatrix.mat4.translate(ModelMat, ModelMat, [2,0,0]);
        glMatrix.mat4.rotateY(ModelMat, ModelMat, animAngle);
        glMatrix.mat4.multiply(MVMat, ViewMat, ModelMat);
        drawPillar();

        // 左の柱
        glMatrix.mat4.identity(ModelMat);
        glMatrix.mat4.translate(ModelMat, ModelMat, [-2,0,0]);
        glMatrix.mat4.rotateY(ModelMat, ModelMat, -animAngle);
        glMatrix.mat4.multiply(MVMat, ViewMat, ModelMat);
        drawPillar();

        gl.flush();

        setTimeout(render, 30);
    }

    // 最初の一回だけ呼ぶ
    render();

    function drawPillar() {
        for (let i = 0; i < 8; i++) {

            let tempMat = glMatrix.mat4.clone(MVMat);

            let angle = i * 45 * Math.PI / 180;
            glMatrix.mat4.rotateY(tempMat, tempMat, angle);
            glMatrix.mat4.translate(tempMat, tempMat, [0,0,1]);
            glMatrix.mat4.scale(tempMat, tempMat, [1,5,1]);

            gl.uniformMatrix4fv(uMVLocation,
                false, tempMat);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    }

    function glInitShader() {

        const vertexShaderSource =
            document.getElementById('vertexShader').textContent;
        const fragmentShaderSource =
            document.getElementById('fragmentShader').textContent;

        const vertexShader =
            gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        if (!gl.getShaderParameter(vertexShader,
            gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(vertexShader));
        }

        const fragmentShader =
            gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        if (!gl.getShaderParameter(fragmentShader,
            gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(fragmentShader));
        }

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program,
            gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
        }

        gl.useProgram(program);

        return program;
    }
});