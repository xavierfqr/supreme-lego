import React from 'react';
import * as THREE from 'three';
import styles from "./ItemContainer.module.css";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AmbientLight, DirectionalLight, AnimationMixer, Clock, TextureLoader } from 'three';

function ItemContainer() {

    const [isZoomed, setIsZoomed] = React.useState(false);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    let scene : THREE.Scene = new THREE.Scene();
    let camera : THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    let renderer = React.useRef<THREE.WebGLRenderer>().current;
    let mixer : AnimationMixer;

    const changeRenderer = () => {
        const sizeScale = isZoomed ? 4 : 2;
        setIsZoomed(!isZoomed);
        console.log(renderer)
        renderer!.setSize(window.innerWidth / sizeScale, window.innerHeight / sizeScale);
    }

    // React.useEffect(() => {
    //     scene = new THREE.Scene();
    //     camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    // }, [])

    React.useEffect(() => {
        
        renderer = new THREE.WebGLRenderer({canvas: canvasRef.current!, antialias: true} );
        const clock = new Clock();
        renderer.setSize(window.innerWidth / (isZoomed ? 2 : 4), window.innerHeight / (isZoomed ? 2 : 4));

        const loader = new GLTFLoader();
        let gltfModel: THREE.Group;

        loader.load(
            'assets/gltf/scene.gltf',
            gltf => {
                mixer = new AnimationMixer(gltf.scene);
                gltfModel = gltf.scene;
                gltf.scene.position.y = -5 ;
                scene.add(gltf.scene)
                gltf.animations.forEach(element => {
                    mixer.clipAction(element).play();
                });
                gltf.scene.traverse(function (child: any) {
                    if (child.material)
                        console.log("child", child);
                });
            }
        )
        
        const texture = new TextureLoader().load('sky_cloud_evening.jpg');
        const material = new THREE.MeshBasicMaterial( { map: texture } );

        const light = new DirectionalLight();
        light.add(light.target);
        light.position.set(-20, 20, 20);
        light.intensity = 1;

        camera.position.z = 10;

        scene.add(light, light.target);
        const color = new THREE.Color('blue')
        scene.background = texture;
    
        var animate = function () {
            let delta = clock.getDelta();
            requestAnimationFrame( animate );
            mixer?.update(delta);
            if (gltfModel){
                gltfModel.rotation.y += 0.01
                gltfModel.rotation.x += 0.0
            }
            renderer!.render( scene, camera );
        };
        animate();
    }, [isZoomed])

    return (
        <canvas ref={canvasRef} className={styles.container} onClick={() => setIsZoomed(!isZoomed)}>
        </canvas>
    )
}

export default ItemContainer
