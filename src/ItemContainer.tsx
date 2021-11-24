import React, { ChangeEvent, Suspense } from 'react';
import * as THREE from 'three';
import styles from "./ItemContainer.module.css";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AmbientLight, DirectionalLight, AnimationMixer, Clock, TextureLoader, MeshStandardMaterial } from 'three';
import { motion, AnimatePresence } from 'framer-motion';


interface ItemContainerProps {
    index?: number,
    setItemsState?: any,
    itemsState?: any
}


const panelAppear = {
    hidden: {
        x: "100%",
    },
    visible: {
        x: "0%",
        transition: {
            duration: 5,
            type: "spring",
            damping: 25,
            stiffness: 200
        }
    },
    exit: {
        x: "100%",
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 200
        }
    }
}

const canvasAppear = {
    hidden: {
        opacity: 0
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 2
        }
    },
    exit: {
        opacity: 0
    }
}


function ItemContainer(props : ItemContainerProps) {

    const containerRef = React.useRef(null);
    const [isVisible, setIsVisible] = React.useState(false);
    const [isZoomed, setIsZoomed] = React.useState(false);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [inputColor, setInputColor] = React.useState('red');
    let scene : THREE.Scene;
    let camera : THREE.PerspectiveCamera;
    let renderer = React.useRef<THREE.WebGLRenderer>().current;
    let mixer : AnimationMixer;
    let gltfModel = React.useRef<THREE.Group>();
    const clock = new Clock();

    const callbackFunction = (entries : any) => {
        const [entry] = entries;
        console.log("on passe ici")
        setIsVisible(entry.isIntersecting);
    }

    const options = {
        root: null,
        rootMargin: "0px",
        threshold: 0.5
    }

    React.useEffect(() => {
        const observer = new IntersectionObserver(callbackFunction, options);
        if (containerRef.current) observer.observe(containerRef.current)

        return () => {
            if (containerRef.current) observer.unobserve(containerRef.current);
        }
    }, [containerRef, options])


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
        mixer?.update(delta);
        if (gltfModel.current){
            gltfModel.current.rotation.y += 0.01
            gltfModel.current.rotation.x += 0.0
        }
        if (resizeRendererToDisplaySize(renderer!)) {
            const canvas = renderer!.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }


        renderer!.render( scene, camera );
    };

    React.useEffect(() => {
        if (!isVisible) {
            return;
        }
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000 );

        renderer = new THREE.WebGLRenderer({canvas: canvasRef.current!, antialias: true} );
        //renderer.setSize(window.innerWidth / (resizeCanvas ? 1.5 : 4), window.innerHeight / (resizeCanvas ? 1.5 : 4));

        const loader = new GLTFLoader();
        
        loader.load(
            'assets/gltf/scene.gltf',
            gltf => {
                mixer = new AnimationMixer(gltf.scene);
                gltfModel.current = gltf.scene;
                gltf.scene.position.y = -5 ;
                scene.add(gltf.scene)
                gltf.animations.forEach(element => {
                    mixer.clipAction(element).play();
                });
                gltf.scene.traverse(function (child: any) {

                });
            }
        )
        const texture = new TextureLoader().load('sky_cloud_evening.jpg');

        const light = new DirectionalLight();
        light.add(light.target);
        light.position.set(-20, 20, 20);
        light.intensity = 1;

        camera.position.z = 10;
        scene.background = texture;

        scene.add(light, light.target);

        animate();
    }, [isVisible])
    

    const onColorChange = (e : any) => {
        const material = new THREE.MeshStandardMaterial( { color: e.target.value} );
        gltfModel.current!.traverse(function (child: any) {
            if (child.material){
                if (child.name === "Arm_Right_Red_Mat_0" || child.name === "Arm_Left_Red_Mat_0")
                {
                    child.material = material
                }
            }
        });
        setInputColor(e.target.value)
    }

    const onCanvasClick = () => {
        props.setItemsState({itemIndex: props.index, isFullList: !props.itemsState.isFullList});
        setIsZoomed(!isZoomed);
    }

    return (
        <Suspense fallback={<div>loading</div>}>
            <div className={styles.container} ref={containerRef}>
            <motion.canvas variants={canvasAppear}
                initial="hidden" animate="visible" exit="exit"
                ref={canvasRef} className={`${styles.canvas} ${isZoomed ? styles.big : styles.little}`} onClick={onCanvasClick}>
            </motion.canvas>
            <AnimatePresence>
            {
                isZoomed ? 
                <motion.div className={styles.pannel} variants={panelAppear}
                    initial="hidden" animate="visible" exit="exit">
                    <input type="color" value={inputColor} onChange={(e) => onColorChange(e)}/>
                </motion.div>
                :
                null
            }
            </AnimatePresence>
        </div>
        </Suspense>
        
    )
}

export default ItemContainer
