import React from 'react'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DirectionalLight, AnimationMixer, Clock, TextureLoader } from 'three';
import { ModelType } from '../App';

interface HiddenCanvasProps {
    models: ModelType[],
    modelsRef: any,
    setIsLoading: Function
    setProgress: Function
}

const HiddenCanvas = ({models, modelsRef, setIsLoading, setProgress} : HiddenCanvasProps) => {
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
                    gltf.scene.position.x = -30 * model.index;
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
        const ratio = 100 / models.length;
        models.forEach((model, index) => {
            const ctx = modelsRef.current[index].getContext('2d');
            setTimeout(() => {
                ctx.drawImage(renderer.current!.getContext().canvas, 0, 0, 700, 700, 0, 0, 700, 700);
                camera.position.x -= 30;
                setProgress((progress: number) => progress + ratio);
                if (index === models.length - 1){
                    setProgress(100)
                }
            }, 2000 + model.index * 100)
        })
    }, [models])
    


    return (
        <div>
            <canvas style={{visibility:'hidden', position:'fixed'}} ref={canvasRef}></canvas>
        </div>
    )
}

export default HiddenCanvas
