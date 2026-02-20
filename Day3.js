document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('webgl not supported!');
        return;
    }

    // 解像度とビューポートの設定
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // プログラムオブジェクトの作成
    const program = gl.createProgram();

    const vSource = document.getElementById('vertexShader').textContent;
    const fSource = document.getElementById('fragmentShader').textContent;

    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vSource);
    gl.compileShader(vShader);
    gl.attachShader(program, vShader);

    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fSource);
    gl.compileShader(fShader);
    gl.attachShader(program, fShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    // 属性とユニフォームの場所を取得
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    const uGlobalColor = gl.getUniformLocation(program, 'uGlobalColor');

    // バッファの作成
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    // ------------ 三角形 (青) ------------
    const triData = [
        0.0, 0.3, 0.0,
        -0.3, -0.3, 0.0,
        0.3, -0.3, 0.0
    ];
    gl.uniform4fv(uGlobalColor, [0.0, 0.0, 1.0, 1.0]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triData), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // ------------ 長方形 (緑) ------------
    const rectData = [
        -0.02, -0.3, 0.0,
        0.02, -0.3, 0.0,
        -0.02, -0.8, 0.0,
        0.02, -0.8, 0.0
    ];
    gl.uniform4fv(uGlobalColor, [0.0, 1.0, 0.0, 1.0]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectData), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // ------------ 円 (赤) ------------
    const segments = 64;
    const radius = 0.13;
    const centerX = 0.0;
    const centerY = 0.55;
    let circleData = [centerX, centerY, 0.0]; // 中心点

    for (let i = 0; i <= segments; i++) {
        const theta = (i * 2 * Math.PI) / segments;
        circleData.push(
            centerX + radius * Math.cos(theta),
            centerY + radius * Math.sin(theta) * (canvas.width / canvas.height), // 縦横比補正
            0.0
        );
    }
    gl.uniform4fv(uGlobalColor, [1.0, 0.0, 0.0, 1.0]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleData), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleData.length / 3);

    gl.flush();
});