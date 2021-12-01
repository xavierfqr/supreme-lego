const panelAppear = {
    hidden: {
        x: "100%",
    },
    visible: {
        x: "0%",
        transition: {
            type: "spring",
            damping: 50,
            stiffness: 200
        }
    },
    exit: {
        x: "100%",
        transition: {
            type: "spring",
            damping: 50,
            stiffness: 200
        }
    }
}

const canvasAppear = {
    hidden: {
        scale: 0
    },
    visible: {
        scale: 1,
        transition: {
            duration: 1
        }
    },
    exit: {
        scale: 0,
        transition: {
            duration: 1
        }
    }
}

const infosAppear = {
    hidden: {
        y: "100%",
    },
    visible: {
        y: "0%",
        transition: {
            type: "spring",
            damping: 50,
            stiffness: 200
        }
    },
    exit: {
        y: "100%",
        transition: {
            type: "spring",
            damping: 50,
            stiffness: 200
        }
    }
}

export {panelAppear, canvasAppear, infosAppear};