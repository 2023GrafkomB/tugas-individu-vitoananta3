var init = function () {
    var canvas = document.getElementById('canvas');
    var gl = canvas.getContext('webgl');

    // gl.clearColor(0.75, 0.85, 0.8, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    //
    // Create shaders
    // 
    var vertexShaderText = document.getElementById('vertex-shader').textContent;
    var fragmentShaderText = document.getElementById('fragment-shader').textContent;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.validateProgram(program);

    //
    // Create buffer
    //
    var pyramidVertices =
        [ //    X,      Y,      Z               U,      V
            //  Base
            -1.0, -1.0, -1.0, 0, 0,
            1.0, -1.0, -1.0, 1, 0,
            1.0, -1.0, 1.0, 1, 1,
            -1.0, -1.0, 1.0, 0, 1,

            // Front
            0.0, 1.0, 0.0, 0.5, 0.5,
        ];

    var pyramidIndices =
        [
            // Base
            0, 1, 2,
            0, 2, 3,

            // Front
            0, 4, 1,
            1, 4, 2,
            2, 4, 3,
            3, 4, 0,
        ];

    var pyramidVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pyramidVertices), gl.STATIC_DRAW);

    var pyramidIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
    gl.vertexAttribPointer(
        positionAttribLocation, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        texCoordAttribLocation, // Attribute location
        2, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);

    //
    // Create texture
    //
    var pyramidTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, pyramidTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('texture')
    )
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Tell OpenGL state machine which program should be active.
    gl.useProgram(program);

    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);

    //
    // Main render loop
    //
    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    var angle = 0;
    // var animationRequestId; // Store the requestAnimationFrame ID

    let animationRunning = false;
    let animationRequestId;
    if (animationRunning == false) {
        document.getElementById("stopButton").disabled = true;
    }

    // Function to start the animation
    function startAnimation() {
        if (!animationRunning) {
            animationRunning = true;
            document.getElementById("startButton").disabled = true;
            document.getElementById("stopButton").disabled = false;

            function animate(currentTime) {
                // Calculate the delta time (time since the last frame)
                const deltaTime = (currentTime - previousTime) / 2100; // Convert to seconds
                previousTime = currentTime;

                // Update the angle based on delta time
                angle += deltaTime * Math.PI; // Adjust the speed as needed

                mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
                mat4.rotate(xRotationMatrix, identityMatrix, angle / 3, [1, 0, 0]);
                mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
                mat4.scale(worldMatrix, worldMatrix, [scaleFactor, scaleFactor, scaleFactor]);
                gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

                gl.clearColor(0, 0, 0, 1);
                gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

                gl.bindTexture(gl.TEXTURE_2D, pyramidTexture);
                gl.activeTexture(gl.TEXTURE0);

                gl.drawElements(gl.TRIANGLES, pyramidIndices.length, gl.UNSIGNED_SHORT, 0);

                updateTranslation();

                if (animationRunning) {
                    animationRequestId = requestAnimationFrame(animate);
                }
            }

            // Start the animation loop
            var previousTime = performance.now();
            animate(previousTime);
        }

    }

    // Function to stop the animation
    function stopAnimation() {
        if (animationRunning) {
            animationRunning = false;
            document.getElementById("startButton").disabled = false;
            document.getElementById("stopButton").disabled = true;
            cancelAnimationFrame(animationRequestId);
        }
    }

    // Bind the functions to the buttons' click events
    document.getElementById('startButton').addEventListener('click', startAnimation);
    document.getElementById('stopButton').addEventListener('click', stopAnimation);

    // Add keyboard event listeners
    document.addEventListener("keydown", function (event) {
        if (event.key === "a" || event.key === "A") {
            startAnimation();
        } else if (event.key === "d" || event.key === "D") {
            stopAnimation();
        }
    });

    // Get references to the scale slider and its value display span
    var scaleSlider = document.getElementById('scaleSlider');
    var scaleValue = document.getElementById('scaleValue');
    var scaleFactor = 1.0;

    var scaleMatrix = new Float32Array(16);
    mat4.identity(scaleMatrix);


    // Function to update the scale when the slider value changes
    scaleSlider.addEventListener('input', function () {
        scaleFactor = parseFloat(scaleSlider.value);
        scaleValue.textContent = scaleFactor.toFixed(1);

        // Update the scale matrix
        mat4.identity(scaleMatrix);
        mat4.scale(scaleMatrix, scaleMatrix, [scaleFactor, scaleFactor, scaleFactor]);

        // Redraw the object
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);

        // Apply both the scale and rotation transformations
        mat4.mul(worldMatrix, scaleMatrix, worldMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawElements(gl.TRIANGLES, pyramidIndices.length, gl.UNSIGNED_SHORT, 0);

        updateTranslation();
    });

    var translationX = 0.0;

    var translationMatrix = new Float32Array(16);
    mat4.identity(translationMatrix);

    // Function to update the translation when the slider value changes
    function updateTranslation() {
        // Update the translation matrix
        mat4.identity(translationMatrix);
        mat4.translate(translationMatrix, translationMatrix, [translationX, 0, 0]);

        // Redraw the object
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);

        // Apply both the translation and previous transformations
        mat4.mul(worldMatrix, translationMatrix, worldMatrix);
        mat4.mul(worldMatrix, scaleMatrix, worldMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawElements(gl.TRIANGLES, pyramidIndices.length, gl.UNSIGNED_SHORT, 0);
    }

    // Get references to the translation slider and its value display span
    var translationXSlider = document.getElementById('translationXSlider');
    var translationXValue = document.getElementById('translationXValue');

    // Function to update the translationX variable and call updateTranslation
    function onTranslationXChange() {
        translationX = parseFloat(translationXSlider.value);
        translationXValue.textContent = translationX.toFixed(1);
        updateTranslation();
    }

    // Update the translation when the slider value changes
    translationXSlider.addEventListener('input', onTranslationXChange);
};
