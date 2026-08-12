/* =========================================================
   GOD'S view by sameer
   v0.2 — Real Layer System
========================================================= */

const stage = document.getElementById("stage");
const uploads = document.getElementById("uploads");
const empty = document.getElementById("empty");
const hint = document.getElementById("hint");

let layers = [];
let selectedLayer = null;

let targetX = 0;
let targetY = 0;

let currentX = 0;
let currentY = 0;

let motionStarted = false;


/* =========================================================
   LAYER OBJECT
========================================================= */

function createLayer(file, number) {

    return {
        id: Date.now() + Math.random(),

        name: "Layer " + number,

        file: file,

        image: null,

        depth: number === 1 ? 5 : number * 25,

        movement: number === 1 ? 5 : number * 25,

        perspective: number === 1 ? 5 : number * 10,

        x: 0,

        y: 0,

        scale: 1,

        rotation: 0,

        visible: true
    };
}


/* =========================================================
   CREATE IMAGE UPLOAD BUTTONS
========================================================= */

for (let i = 0; i < 5; i++) {

    const label = document.createElement("label");

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
        function (event) {

            const file =
                event.target.files[0];

            if (!file) return;

            addLayer(file);

        }
    );

    uploads.appendChild(label);
}


/* =========================================================
   ADD NEW LAYER
========================================================= */

function addLayer(file) {

    const layer =
        createLayer(
            file,
            layers.length + 1
        );

    const reader =
        new FileReader();

    reader.onload =
        function () {

            const img =
                document.createElement("img");

            img.className = "layer";

            img.src =
                reader.result;

            img.style.zIndex =
                layers.length + 1;

            layer.image =
                img;

            layers.push(layer);

            stage.appendChild(img);

            empty.style.display =
                "none";

            hint.textContent =
                "Select a layer and tilt your phone";

            selectedLayer =
                layer;

            createLayerPanel();

            updateSelectedLayerUI();

            render();
        };

    reader.readAsDataURL(file);
}


/* =========================================================
   LAYER PANEL
========================================================= */

function createLayerPanel() {

    let panel =
        document.getElementById(
            "layerControls"
        );

    if (!panel) {

        panel =
            document.createElement("div");

        panel.id =
            "layerControls";

        panel.className =
            "layer-controls";

        const controls =
            document.querySelector(
                ".controls"
            );

        controls.before(panel);
    }

    panel.innerHTML = "";

    const title =
        document.createElement("h3");

    title.textContent =
        "Layers";

    panel.appendChild(title);


    layers.forEach(
        function (layer, index) {

            const card =
                document.createElement("div");

            card.className =
                "layer-card";


            if (layer === selectedLayer) {

                card.style.border =
                    "1px solid #e7d3a0";
            }


            const header =
                document.createElement(
                    "div"
                );

            header.className =
                "layer-title";


            const name =
                document.createElement(
                    "span"
                );

            name.textContent =
                layer.name;


            const select =
                document.createElement(
                    "button"
                );

            select.textContent =
                layer === selectedLayer
                    ? "Selected ✓"
                    : "Edit";


            select.style.marginTop =
                "0";

            select.addEventListener(
                "click",
                function () {

                    selectedLayer =
                        layer;

                    createLayerPanel();

                    updateSelectedLayerUI();

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

                        updateSelectedLayerUI();

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

                        updateSelectedLayerUI();

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

                        updateSelectedLayerUI();

                        render();
                    }
                )
            );


            /* VISIBILITY */

            const visibility =
                document.createElement(
                    "button"
                );

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

                    createLayerPanel();
                }
            );


            card.appendChild(
                visibility
            );


            panel.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   SLIDER CREATOR
========================================================= */

function createSlider(
    labelText,
    value,
    min,
    max,
    callback
) {

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "control-row";


    const label =
        document.createElement(
            "span"
        );

    label.textContent =
        labelText;


    const slider =
        document.createElement(
            "input"
        );

    slider.type =
        "range";

    slider.min =
        min;

    slider.max =
        max;

    slider.value =
        value;


    const valueText =
        document.createElement(
            "span"
        );

    valueText.className =
        "value";

    valueText.textContent =
        value;


    slider.addEventListener(
        "input",
        function () {

            const number =
                Number(
                    slider.value
                );

            valueText.textContent =
                number;

            callback(number);
        }
    );


    row.appendChild(label);

    row.appendChild(slider);

    row.appendChild(valueText);

    return row;
}


/* =========================================================
   UPDATE UI
========================================================= */

function updateSelectedLayerUI() {

    if (!selectedLayer) return;

    const cards =
        document.querySelectorAll(
            ".layer-card"
        );

    cards.forEach(
        function (card, index) {

            const layer =
                layers[index];

            if (layer === selectedLayer) {

                card.style.border =
                    "1px solid #e7d3a0";
            }

            else {

                card.style.border =
                    "1px solid #292934";
            }
        }
    );
}


/* =========================================================
   PARALLAX ENGINE
========================================================= */

function render() {

    layers.forEach(
        function (layer) {

            if (
                !layer ||
                !layer.image ||
                !layer.visible
            ) {
                return;
            }


            const depth =
                Number(layer.depth) / 100;


            const movement =
                Number(layer.movement) / 100;


            const perspective =
                Number(layer.perspective);


            /*
              Every layer gets its OWN
              movement value.
            */

            const moveX =
                targetX *
                movement *
                120;


            const moveY =
                targetY *
                movement *
                75;


            /*
              Depth controls the
              simulated camera distance.
            */

            const z =
                depth * 60;


            /*
              Every layer gets its
              own perspective.
            */

            const rotateY =
                targetX *
                perspective *
                0.10;


            const rotateX =
                -targetY *
                perspective *
                0.06;


            /*
              Slight enlargement prevents
              edges appearing during movement.
            */

            const scale =
                Number(layer.scale) +
                1.05 +
                depth * 0.05;


            layer.image.style.transform =
                `
                translate3d(
                    ${layer.x + moveX}px,
                    ${layer.y + moveY}px,
                    ${z}px
                )

                rotateY(${rotateY}deg)

                rotateX(${rotateX}deg)

                rotateZ(${layer.rotation}deg)

                scale(${scale})
                `;
        }
    );
}


/* =========================================================
   SMOOTH MOTION
========================================================= */

function animation() {

    currentX +=
        (targetX - currentX) *
        0.10;


    currentY +=
        (targetY - currentY) *
        0.10;


    /*
      Use the smoothed values
      for the final render.
    */

    const oldX =
        targetX;

    const oldY =
        targetY;


    targetX =
        currentX;

    targetY =
        currentY;


    render();


    targetX =
        oldX;

    targetY =
        oldY;


    requestAnimationFrame(
        animation
    );
}

animation();


/* =========================================================
   PHONE GYROSCOPE
========================================================= */

async function enableTilt(button) {

    try {

        if (
            !window.DeviceOrientationEvent
        ) {

            hint.textContent =
                "Motion sensors are not available.";

            return;
        }


        if (
            typeof DeviceOrientationEvent
                .requestPermission ===
            "function"
        ) {

            const permission =
                await DeviceOrientationEvent
                    .requestPermission();


            if (
                permission !==
                "granted"
            ) {

                hint.textContent =
                    "Motion permission denied.";

                return;
            }
        }


        if (motionStarted) return;


        motionStarted =
            true;


        window.addEventListener(
            "deviceorientation",
            function (event) {

                if (
                    event.gamma ===
                        null ||
                    event.beta ===
                        null
                ) {
                    return;
                }


                let x =
                    event.gamma / 30;


                let y =
                    (event.beta - 45) / 35;


                x =
                    Math.max(
                        -1,
                        Math.min(
                            1,
                            x
                        )
                    );


                y =
                    Math.max(
                        -1,
                        Math.min(
                            1,
                            y
                        )
                    );


                targetX =
                    x;

                targetY =
                    y;

            },
            true
        );


        button.textContent =
            "Tilt enabled ✓";


        hint.textContent =
            "Tilt your phone ↔";
    }

    catch (error) {

        console.log(error);

        hint.textContent =
            "Motion permission could not be enabled.";
    }
}


/* =========================================================
   ENABLE TILT BUTTON
========================================================= */

const motionButton =
    document.getElementById(
        "motion"
    );


if (motionButton) {

    motionButton.onclick =
        function () {

            enableTilt(
                motionButton
            );
        };
}


/* =========================================================
   RESET
========================================================= */

const resetButton =
    document.getElementById(
        "reset"
    );


if (resetButton) {

    resetButton.onclick =
        function () {

            layers.forEach(
                function (layer) {

                    if (
                        layer &&
                        layer.image
                    ) {

                        layer.image.remove();
                    }
                }
            );


            layers = [];

            selectedLayer =
                null;


            targetX =
                0;

            targetY =
                0;


            empty.style.display =
                "grid";


            hint.textContent =
                "Upload images to begin";


            const panel =
                document.getElementById(
                    "layerControls"
                );


            if (panel) {

                panel.remove();
            }
        };
}