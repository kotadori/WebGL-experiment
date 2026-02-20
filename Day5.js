document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
  
    canvas.width = 700;
    canvas.height = 700;
  
    const gl = canvas.getContext('webgl');
    if (!gl) return;
  
    const program = glInitShader();
    const uMVLocation = gl.getUniformLocation(program, 'uMVMatrix');
    const uPrLocation = gl.getUniformLocation(program, 'uPrMatrix');
     
    let MVMat = glMatrix.mat4.create();
    let ModelMat = glMatrix.mat4.create();
    let ViewMat =  glMatrix.mat4.create();
    let PrMat = glMatrix.mat4.create();
    let MVMatStack = [];
  
    // カメラと投影の設定
    let eye = glMatrix.vec3.fromValues(0, 5, 5);
    let center = glMatrix.vec3.fromValues(0, 0, 0);
    let up = glMatrix.vec3.fromValues(0, 1, 0);
    glMatrix.mat4.lookAt(ViewMat, eye, center, up);
  
    glMatrix.mat4.perspective(PrMat, 90 * Math.PI / 180, canvas.width / canvas.height, 0.1, 20);
    
    // 頂点データ
    const triangleVertexPos = [
      0.0, 0.0, 0.0,
      -0.4, -0.4, 0.0,
      0.4, -0.4, 0.0,
  
      0.0, -0.0, 0.0,
      -0.4, 0.4, 0.0,
      0.4, 0.4, 0.0
      
    ];
    const triangleVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertexPos), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  
    gl.enable(gl.DEPTH_TEST);
  
    let frame = 0; // アニメーション用のカウンター
  
    function render() {
      frame++;
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(uPrLocation, false, PrMat);
  
      // アニメーション用の角度（ゆっくり回転）
      let animAngle = (frame % 360) * Math.PI / 180;
  
      // --- 1本目の柱（右） ---
      pushMVMatrix(); 
        glMatrix.mat4.identity(ModelMat);
        glMatrix.mat4.translate(ModelMat, ModelMat, [2.0, 0.0, 0.0]); 
        glMatrix.mat4.rotateY(ModelMat, ModelMat, animAngle); // 柱全体を回転
        glMatrix.mat4.multiply(MVMat, ViewMat, ModelMat); 
        drawPillar(); 
      popMVMatrix();
  
      // --- 2本目の柱（左） ---
      pushMVMatrix();
        glMatrix.mat4.identity(ModelMat);
        glMatrix.mat4.translate(ModelMat, ModelMat, [-2.0, 0.0, 0.0]); 
        glMatrix.mat4.rotateY(ModelMat, ModelMat, -animAngle); // 逆回転
        glMatrix.mat4.multiply(MVMat, ViewMat, ModelMat); 
        drawPillar(); 
      popMVMatrix();
  
      gl.flush();
  
      setTimeout(render, 30);
    }
  
    function drawPillar() {
      for (let i = 0; i < 8; i++) {
        pushMVMatrix();
        let angle = (i * 45) * Math.PI / 180;
        glMatrix.mat4.rotateY(MVMat, MVMat, angle);
        glMatrix.mat4.translate(MVMat, MVMat, [0.0, 0.0, 1.0]);
  
        glMatrix.mat4.scale(MVMat, MVMat, [1.0, 5.0, 1.0]); 
        
        gl.uniformMatrix4fv(uMVLocation, false, MVMat);
  
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        popMVMatrix();
      }
    }
  
    function pushMVMatrix(){
      MVMatStack.push(glMatrix.mat4.clone(MVMat));
    }
  
    function popMVMatrix(){
      MVMat = MVMatStack.pop();
    }
  
    function glInitShader(){
      const vertexShaderSource = document.getElementById('vertexShader').textContent;
      const fragmentShaderSource = document.getElementById('fragmentShader').textContent;
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      gl.compileShader(fragmentShader);
      const program = gl.createProgram();  
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);
      return program;
    }
  
    render(); // 最初の呼び出し
  });
