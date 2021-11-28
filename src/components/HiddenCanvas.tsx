import React from 'react'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DirectionalLight, AnimationMixer, Clock, TextureLoader } from 'three';
import { Models } from '../App';

interface HiddenCanvasProps {
    models: Models[],
    modelsRef: any
}

const HiddenCanvas = ({models, modelsRef} : HiddenCanvasProps) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    let scene : THREE.Scene;
    let camera : THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    let renderer = React.useRef<THREE.WebGLRenderer>();
    const clock = new Clock();

    function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    const animate = () => {
        let delta = clock.getDelta();
        requestAnimationFrame(animate);
        if (resizeRendererToDisplaySize(renderer.current!)) {
            const canvas = canvasRef.current;
            if (canvas){
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }
        }
        if (resizeRendererToDisplaySize(renderer.current!)) {
            const canvas = canvasRef.current;
            if (canvas){
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }
        }

        renderer.current!.render( scene, camera );
    };

    React.useEffect(() => {
        scene = new THREE.Scene();
        renderer.current = new THREE.WebGLRenderer({canvas: canvasRef.current!, antialias: true, preserveDrawingBuffer: true} );
        

        const loader = new GLTFLoader();

        models.map(model => {
            loader.load(
                `assets/gltf/${model.name}/scene.gltf`,
                gltf => {
                    gltf.scene.position.y = -5;
                    gltf.scene.position.x = -5 * model.index;
                    scene.add(gltf.scene);
                }
            )
        })
        const texture = new TextureLoader().load('sky_cloud_evening.jpg');

        const light = new DirectionalLight();
        light.add(light.target);
        light.position.set(-20, 20, 20);
        light.intensity = 1;

        camera.position.z = 10;
        scene.background = texture;

        scene.add(light, light.target);

        animate();

    }, [])

    React.useEffect(() => {
        if (!camera) return;
        models.forEach((model, index) => {
            const ctx = modelsRef.current[index].getContext('2d');
            setTimeout(() => {
                ctx.drawImage(renderer.current!.getContext().canvas, 0, 0, 500, 500, 0, 0, 500, 500);
                camera.position.x -= 5;
            }, 2000 + model.index * 100)
        })
    }, [models])
    


    return (
        <div>
            <canvas style={{visibility:'hidden'}} ref={canvasRef}></canvas>
        </div>
    )
}

export default HiddenCanvas
