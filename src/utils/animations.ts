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

export {panelAppear, canvasAppear};