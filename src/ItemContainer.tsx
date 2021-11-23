import React, { ChangeEvent } from 'react';
import * as THREE from 'three';
import styles from "./ItemContainer.module.css";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AmbientLight, DirectionalLight, AnimationMixer, Clock, TextureLoader, MeshStandardMaterial } from 'three';
import { motion } from 'framer-motion';


interface ItemContainerProps {
    index?: number,
    setItemState?: any,
    itemsState?: any
}


const appearEffect = {
    hidden: {
        x: "100%",
        opacity: 0
    },
    visible: {
        x: "0%",
        opacity: 1,
        transition: {
            duration: 5,
            type: "spring",
            damping: 25,
            stiffness: 500
        }
    },
    exit: {
        x: "100%",
        opacity: 0
    }
}

function ItemContainer(props : any) {

    const [isZoomed, setIsZoomed] = React.useState(false);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [inputColor, setInputColor] = React.useState('red');
    let scene : THREE.Scene = new THREE.Scene();
    let camera : THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    let renderer = React.useRef<THREE.WebGLRenderer>().current;
    let mixer : AnimationMixer;
    let gltfModel = React.useRef<THREE.Group>();
    const clock = new Clock();

    const animate = () => {
        let delta = clock.getDelta();
        requestAnimationFrame(animate);
        mixer?.update(delta);
        if (gltfModel.current){
            gltfModel.current.rotation.y += 0.01
            gltfModel.current.rotation.x += 0.0
        }
        renderer!.render( scene, camera );
    };

    React.useEffect(() => {
        
        renderer = new THREE.WebGLRenderer({canvas: canvasRef.current!, antialias: true} );
        renderer.setSize(window.innerWidth / (isZoomed ? 1.5 : 4), window.innerHeight / (isZoomed ? 1.5 : 4));

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
    }, [isZoomed])
    

    const onColorChange = (e : any) => {
        console.log(e.target.value)
        const material = new THREE.MeshStandardMaterial( { color: e.target.value} );
        console.log(gltfModel)
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
        setIsZoomed(!isZoomed)
    }


    return (
        <div className={styles.container}>
            <motion.canvas initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity:0}}
                ref={canvasRef} className={`${styles.canvas} ${isZoomed ? styles.big : null}`} onClick={onCanvasClick}>
            </motion.canvas>
            {
                isZoomed ? 
                <motion.div className={styles.pannel} variants={appearEffect}
                    initial="hidden" animate="visible" exit="exit">
                    <input type="color" value={inputColor} onChange={(e) => onColorChange(e)}/>
                </motion.div>
                
                :

                null
                
            }
        </div>
        
    )
}

export default ItemContainer
