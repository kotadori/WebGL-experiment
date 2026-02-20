document.addEventListener('DOMContentLoaded', function () {
    // HTMLからcanvas要素を取得する
    const canvas = document.getElementById('canvas');

    // canvas要素からwebglコンテキストを取得する
    const gl = canvas.getContext('webgl');

    // WebGLコンテキストが取得できたかどうか調べる
    if (!gl) {
        alert('webgl not supported!');
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);

    // プログラムオブジェクトを作成する
    const program = gl.createProgram();

    // MVP行列を生成するための射影変換
    // シェーダのソースを取得する
    const vertexShaderSource = document.getElementById('vertexShader').textContent;
    const fragmentShaderSource = document.getElementById('fragmentShader').textContent;

    // シェーダをコンパイルして、プログラムオブジェクトにシェーダを割り当てる
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    gl.attachShader(program, vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, fragmentShader);

    // シェーダをリンクする
    gl.linkProgram(program);
    // プログラムオブジェクトを有効にする
    gl.useProgram(program);

    // 3つの頂点の座標を定義する
    const triangleVertexPosition = [
        0.0, 0.4, 0.0,
        -0.4, -0.4, 0.0,
        0.4, -0.4, 0.0
    ];

    // 頂点バッファを作成する
    const triangleVertexBuffer = gl.createBuffer();
    // 頂点バッファをバインドする
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
    // 頂点バッファに頂点データをセットする
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertexPosition), gl.STATIC_DRAW);

    // Positionのロケーションを取得し、バッファを割り当てる
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    let MVMat = glMatrix.mat4.create();
    let PrMat = glMatrix.mat4.create();
    let eye = glMatrix.vec3.fromValues(0, 0, 3);
    let center = glMatrix.vec3.fromValues(0, 0, 0);
    let up = glMatrix.vec3.fromValues(0, 1, 0);
    var lookAtMatrix = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(lookAtMatrix, eye, center, up);
    glMatrix.mat4.perspective(PrMat, 0.4 * Math.PI, canvas.width / canvas.height, 0.1, 10.0);


    setTimeout(render, 30);
    var frame = 0;

    const uPrLocation = gl.getUniformLocation(program, 'uPrMatrix');
    const uMVLocation = gl.getUniformLocation(program, 'uMVMatrix');

    function render() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        frame++;

        glMatrix.mat4.identity(MVMat);

        let currentAngle = (frame % 360) * Math.PI / 180;
        glMatrix.mat4.rotate(MVMat, MVMat, currentAngle, [1, 1, 0]);

        let scaleFactor = 1.0 + Math.sin(frame * 0.1) * 0.9;
        glMatrix.mat4.scale(MVMat, MVMat, [scaleFactor, scaleFactor, 1.0]);

        glMatrix.mat4.multiply(MVMat, lookAtMatrix, MVMat);

        gl.uniformMatrix4fv(uPrLocation, false, PrMat);

        gl.uniformMatrix4fv(uMVLocation, false, MVMat);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.flush();

        setTimeout(render, 30);
    }

    // 最初の実行
    render();

});
