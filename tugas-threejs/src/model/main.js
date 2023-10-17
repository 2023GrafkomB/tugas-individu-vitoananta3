let scene, camera, renderer;
let mixer;
let currentAnimation = null;
let fbxLoader;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(0, 200, 500);
    camera.lookAt(new THREE.Vector3(0, 50, 0));
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', renderer);

    fbxLoader = new THREE.FBXLoader();

    fbxLoader.load('../../public/asset/animation/Injured Idle.fbx', (object) => {
        scene.add(object);

        mixer = new THREE.AnimationMixer(object);

        const clip = object.animations[0];

        const action = mixer.clipAction(clip);
        action.play();
        currentAnimation = action;

        animate();
    });

    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'w':
                loadAnimation('../../public/asset/animation/Injured Walk.fbx');
                break;
            case 'a':
                loadAnimation('../../public/asset/animation/Injured Turn Left.fbx');
                break;
            case 's':
                loadAnimation('../../public/asset/animation/Injured Walk Backwards.fbx');
                break;
            case 'd':
                loadAnimation('../../public/asset/animation/Injured Turn Right.fbx');
                break;
            case ' ':
                loadAnimation('../../public/asset/animation/Injured Standing Jump.fbx');
                break;
            default:
                loadAnimation('../../public/asset/animation/Injured Idle.fbx');
                break;
        }
    });
}

function loadAnimation(animationFile) {
    fbxLoader.load(animationFile, (object) => {
        if (currentAnimation) {
            currentAnimation.stop();
        }
        const clip = object.animations[0];
        const action = mixer.clipAction(clip);
        action.play();
        currentAnimation = action;
    })
}

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    if (mixer) {
        mixer.update(0.01);
    }
}

init();