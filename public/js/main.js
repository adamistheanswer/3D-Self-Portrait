let orbitControls;
let container, camera, scene, renderer, loader, effect;
let gltf, mixer;

let scenes = {
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

function onload() {
  window.addEventListener("resize", onWindowResize, false);
  initScene(scenes[Object.keys(scenes)[0]]);
  animate();
}

function initScene(sceneInfo) {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    container.offsetWidth / container.offsetHeight,
    0.001,
    1000
  );
  scene.add(camera);

  if (sceneInfo.addLights) {
    let ambient = new THREE.AmbientLight(0xffffff);
    ambient.intensity = 1.65;
    scene.add(ambient);

    let directionalLight = new THREE.DirectionalLight(0xdddddd, 2.5);
    directionalLight.position.set(-0.1, -0.1, 1).normalize();
    scene.add(directionalLight);
  }

  // RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.gammaOutput = true;
  renderer.physicallyCorrectLights = true;

  //let helper = new THREE.GridHelper( 1200, 60, 0xFF4444, 0x404040 );
  //this.scene.add( helper );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

  const loadingManager = new THREE.LoadingManager();

  loadingManager.onLoad = function() {
    console.log("Loading complete!");
    const loadingScreen = document.getElementById("loading-screen");
    loadingScreen.classList.add("fade-out");
    loadingScreen.addEventListener("transitionend", this.onTransitionEnd);
    var elem = document.querySelector("#loading-screen");
    elem.parentNode.removeChild(elem);
  };

  loadingManager.onProgress = function() {
    document.getElementById("loadingtext").innerHTML =
      "Loading 3D Portrait";
  };

  loadingManager.onError = function(url) {
    console.log("There was an error loading " + url);
  };

  loader = new THREE.GLTFLoader(loadingManager);

  THREE.DRACOLoader.setDecoderPath("js/libs/draco/gltf/");
  loader.setDRACOLoader(new THREE.DRACOLoader(loadingManager));

  let url = sceneInfo.url;

  let loadStartTime = performance.now();

  loader.load(
    url,
    function(gltf) {
      let object = gltf.scene;

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

  initScene(scenes[Object.keys(scenes)[0]]);
}

onload();
