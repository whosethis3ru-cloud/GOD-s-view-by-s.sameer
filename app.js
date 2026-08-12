/* =========================================================
   GOD'S view by sameer
   v0.2
   Independent Layer Parallax Engine
========================================================= */


/* =========================
   ELEMENTS
========================= */

const stage =
    document.getElementById("stage");

const uploads =
    document.getElementById("uploads");

const empty =
    document.getElementById("empty");

const hint =
    document.getElementById("hint");

const layerControls =
    document.getElementById("layerControls");

const motionButton =
    document.getElementById("motion");

const resetButton =
    document.getElementById("reset");


/* =========================
   APP STATE
========================= */

let layers = [];

let selectedLayer = null;

let targetX = 0;
let targetY = 0;

let smoothX = 0;
let smoothY = 0;

let motionEnabled = false;


/* =========================================================
   CREATE UPLOAD BUTTONS
========================================================= */

for (let i = 0; i < 5; i++) {

    const label =
        document.createElement("label");

    label.className = "file";

    label.textContent =
        "Image " + (i + 1);


    const input =
        document.createElement("input");

    input.type = "file";

    input.accept = "image/*";


    label.appendChild(input);


    input.addEventListener(
        "change",
        function () {

            const file =
                input.files[0];

            if (!file) return;

            addLayer(file);
        }
    );


    uploads.appendChild(label);
}


/* =========================================================
   CREATE LAYER
========================================================= */

function createLayer(file) {

    const layer = {

        id:
            Date.now() +
            Math.random(),

        name:
            "Layer " +
            (layers.length + 1),

        file:
            file,

        image:
            null,

        /*
           Background starts low.
           Later layers automatically
           get more depth.
        */

        depth:
            layers.length * 25,

        movement:
            layers.length * 20 + 10,

        perspective:
            layers.length * 8 + 5,

        x: 0,

        y: 0,

        scale: 1,

        rotation: 0,

        visible: true
    };


    return layer;
}


/* =========================================================
   ADD IMAGE
========================================================= */

function addLayer(file) {

    const layer =
        createLayer(file);


    const reader =
        new FileReader();


    reader.onload =
        function () {

            const image =
                document.createElement("img");


            image.className =
                "layer";


            image.src =
                reader.result;


            image.style.zIndex =
                layers.length + 1;


            layer.image =
                image;


            layers.push(layer);


            stage.appendChild(image);


            empty.style.display =
                "none";


            selectedLayer =
                layer;


            rebuildLayerPanel();


            hint.textContent =
                "Select a layer and tilt your phone";


            render();
        };


    reader.readAsDataURL(file);
}


/* =========================================================
   LAYER PANEL
========================================================= */

function rebuildLayerPanel() {

    layerControls.innerHTML = "";


    const title =
        document.createElement("h3");


    title.textContent =
        "Layers";


    layerControls.appendChild(title);


    /*
       Show layers from front
       to back.
    */

    [...layers]
        .reverse()
        .forEach(
            function (layer) {

                const card =
                    createLayerCard(layer);

                layerControls.appendChild(card);
            }
        );
}


/* =========================================================
   CREATE LAYER CARD
========================================================= */

function createLayerCard(layer) {

    const card =
        document.createElement("div");


    card.className =
        "layer-card";


    if (layer === selectedLayer) {

        card.classList.add(
            "selected"
        );
    }


    /* HEADER */

    const header =
        document.createElement("div");


    header.className =
        "layer-header";


    const name =
        document.createElement("span");


    name.className =
        "layer-name";


    name.textContent =
        layer.name;


    const select =
        document.createElement("button");


    select.className =
        "layer-select";


    select.textContent =
        layer === selectedLayer
            ? "Selected"
            : "Edit";


    select.addEventListener(
        "click",
        function () {

            selectedLayer =
                layer;

            rebuildLayerPanel();

            render();
        }
    );


    header.appendChild(name);

    header.appendChild(select);

    card.appendChild(header);


    /* DEPTH */

    card.appendChild(
        createSlider(
            "Depth",
            layer.depth,
            0,
            100,
            function (value) {

                layer.depth =
                    value;

                render();
            }
        )
    );


    /* MOVEMENT */

    card.appendChild(
        createSlider(
            "Movement",
            layer.movement,
            0,
            150,
            function (value) {

                layer.movement =
                    value;

                render();
            }
        )
    );


    /* PERSPECTIVE */

    card.appendChild(
        createSlider(
            "Perspective",
            layer.perspective,
            0,
            100,
            function (value) {

                layer.perspective =
                    value;

                render();
            }
        )
    );


    /* VISIBILITY */

    const visibility =
        document.createElement("button");


    visibility.textContent =
        layer.visible
            ? "Hide layer"
            : "Show layer";


    visibility.addEventListener(
        "click",
        function () {

            layer.visible =
                !layer.visible;


            layer.image.style.display =
                layer.visible
                    ? "block"
                    : "none";


            rebuildLayerPanel();

            render();
        }
    );


    card.appendChild(
        visibility
    );


    return card;
}


/* =========================================================
   SLIDER
========================================================= */

function createSlider(
    name,
    value,
    min,
    max,
    callback
) {

    const row =
        document.createElement("div");


    row.className =
        "control-row";


    const label =
        document.createElement("span");


    label.textContent =
        name;


    const slider =
        document.createElement("input");


    slider.type =
        "range";

    slider.min =
        min;

    slider.max =
        max;

    slider.value =
        value;


    const valueText =
        document.createElement("span");


    valueText.className =
        "value";


    valueText.textContent =
        value;


    slider.addEventListener(
        "input",
        function () {

            const newValue =
                Number(
                    slider.value
                );


            valueText.textContent =
                newValue;


            callback(
                newValue
            );
        }
    );


    row.appendChild(label);

    row.appendChild(slider);

    row.appendChild(valueText);


    return row;
}


/* =========================================================
   PARALLAX RENDER
========================================================= */

function render() {

    layers.forEach(
        function (layer) {

            if (
                !layer.image ||
                !layer.visible
            ) {
                return;
            }


            /*
               DEPTH

               0 = background
               100 = foreground
            */

            const depth =
                layer.depth / 100;


            /*
               MOVEMENT

               Completely independent
               for each layer.
            */

            const movement =
                layer.movement / 100;


            /*
               X movement
            */

            const moveX =
                smoothX *
                movement *
                120;


            /*
               Y movement
            */

            const moveY =
                smoothY *
                movement *
                70;


            /*
               Perspective
            */

            const rotateY =
                smoothX *
                layer.perspective *
                0.10;


            const rotateX =
                -smoothY *
                layer.perspective *
                0.06;


            /*
               Slight scale based
               on depth.
            */

            const scale =
                layer.scale +
                0.04 +
                depth * 0.05;


            /*
               Apply to THIS layer only.
            */

            layer.image.style.transform =

                "translate3d(" +

                (layer.x + moveX) +
                "px," +

                (layer.y + moveY) +
                "px," +

                "0px)" +

                " rotateY(" +
                rotateY +
                "deg)" +

                " rotateX(" +
                rotateX +
                "deg)" +

                " rotateZ(" +
                layer.rotation +
                "deg)" +

                " scale(" +
                scale +
                ")";
        }
    );
}


/* =========================================================
   SMOOTH ANIMATION
========================================================= */

function animate() {

    smoothX +=
        (targetX - smoothX) *
        0.10;


    smoothY +=
        (targetY - smoothY) *
        0.10;


    render();


    requestAnimationFrame(
        animate
    );
}


animate();


/* =========================================================
   GYROSCOPE
========================================================= */

async function enableMotion() {

    try {

        if (
            !("DeviceOrientationEvent"
                in window)
        ) {

            hint.textContent =
                "This device does not support motion sensors.";

            return;
        }


        /*
           Some browsers require
           explicit permission.
        */

        if (
            typeof
            DeviceOrientationEvent
                .requestPermission ===
            "function"
        ) {

            const permission =
                await
                DeviceOrientationEvent
                    .requestPermission();


            if (
                permission !==
                "granted"
            ) {

                hint.textContent =
                    "Motion permission was denied.";

                return;
            }
        }


        if (motionEnabled) {
            return;
        }


        motionEnabled =
            true;


        window.addEventListener(
            "deviceorientation",
            function (event) {

                if (
                    event.gamma ===
                        null
                ) {
                    return;
                }


                /*
                   Left / right tilt.
                */

                targetX =
                    Math.max(
                        -1,
                        Math.min(
                            1,
                            event.gamma / 25
                        )
                    );


                /*
                   Forward / backward tilt.

                   45° is treated as
                   the neutral position.
                */

                if (
                    event.beta !== null
                ) {

                    targetY =
                        Math.max(
                            -1,
                            Math.min(
                                1,
                                (event.beta - 45)
                                / 35
                            )
                        );
                }

            },
            true
        );


        motionButton.textContent =
            "Tilt enabled ✓";


        hint.textContent =
            "Tilt your phone ↔";
    }

    catch (error) {

        console.error(error);

        hint.textContent =
            "Motion permission could not be enabled.";
    }
}


/* =========================================================
   MOTION BUTTON
========================================================= */

motionButton.addEventListener(
    "click",
    enableMotion
);


/* =========================================================
   RESET
========================================================= */

resetButton.addEventListener(
    "click",
    function () {

        layers.forEach(
            function (layer) {

                if (layer.image) {

                    layer.image.remove();
                }
            }
        );


        layers = [];

        selectedLayer =
            null;


        targetX = 0;
        targetY = 0;

        smoothX = 0;
        smoothY = 0;


        empty.style.display =
            "grid";


        hint.textContent =
            "Upload images to begin";


        layerControls.innerHTML =
            "";
    }
);