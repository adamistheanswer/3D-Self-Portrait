if (WEBGL.isWebGLAvailable() === false) {
  document.body.appendChild(WEBGL.getWebGLErrorMessage());
}

var orbitControls;
var container, camera, scene, renderer, loader, effect;
var gltf, mixer;

var scenes = {
  remesh: {
    url: "./models/gltf/remeshDraco.gltf",
    cameraPos: new THREE.Vector3(-0.7, 0.6, 2),
    objectRotation: new THREE.Euler(-1.58, 0, 0),
    objectPosition: new THREE.Euler(0, -0.25, 0),
    objectScale: new THREE.Vector3(2.6, 2.6, 2.6),
    addLights: true,
    shadows: true,
    addGround: false
  }
};

var state = {
  scene: Object.keys(scenes)[0]
};

function onload() {
  window.addEventListener("resize", onWindowResize, false);

  initScene(scenes[state.scene]);
  animate();
}

function initScene(sceneInfo) {
  container = document.getElementById("container");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(
    45,
    container.offsetWidth / container.offsetHeight,
    0.001,
    1000
  );
  scene.add(camera);

  var spot1;

  if (sceneInfo.addLights) {
    var ambient = new THREE.AmbientLight(0xffffff);
    ambient.intensity = 1.65;
    scene.add(ambient);

    var directionalLight = new THREE.DirectionalLight(0xdddddd, 2.5);
    directionalLight.position.set(-0.1, -0.1, 1).normalize();
    scene.add(directionalLight);
  }

  // RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.gammaOutput = true;
  renderer.physicallyCorrectLights = true;

  //var helper = new THREE.GridHelper( 1200, 60, 0xFF4444, 0x404040 );
  //this.scene.add( helper );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

  loader = new THREE.GLTFLoader();

  THREE.DRACOLoader.setDecoderPath("js/libs/draco/gltf/");
  loader.setDRACOLoader(new THREE.DRACOLoader());

  var url = sceneInfo.url;

  var loadStartTime = performance.now();

  loader.load(
    url,
    function(gltf) {
      var object = gltf.scene;

      console.info(
        "Load time: " + (performance.now() - loadStartTime).toFixed(2) + " ms."
      );

      if (sceneInfo.cameraPos) {
        camera.position.copy(sceneInfo.cameraPos);
      }

      if (sceneInfo.center) {
        orbitControls.target.copy(sceneInfo.center);
      }

      if (sceneInfo.objectPosition) {
        object.position.copy(sceneInfo.objectPosition);

        if (spot1) {
          spot1.target.position.copy(sceneInfo.objectPosition);
        }
      }

      if (sceneInfo.objectRotation) {
        object.rotation.copy(sceneInfo.objectRotation);
      }

      if (sceneInfo.objectPosition) {
        object.position.copy(sceneInfo.objectPosition);
      }

      if (sceneInfo.objectScale) {
        object.scale.copy(sceneInfo.objectScale);
      }

      object.traverse(function(node) {
        if (node.isMesh || node.isLight) node.castShadow = true;
      });

      scene.add(object);
      onWindowResize();
    },
    undefined,
    function(error) {
      console.error(error);
    }
  );
}

function onWindowResize() {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  orbitControls.update();

  render();
}

function render() {
  renderer.render(scene, camera);
}

function reload() {
  if (container && renderer) {
    container.removeChild(renderer.domElement);
  }

  if (loader && mixer) mixer.stopAllAction();

  initScene(scenes[state.scene]);
}

onload();
