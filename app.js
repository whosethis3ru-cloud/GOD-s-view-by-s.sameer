const stage = document.getElementById("stage");
const uploads = document.getElementById("uploads");
const empty = document.getElementById("empty");
const hint = document.getElementById("hint");

const depthDefault = 55;
const movementDefault = 55;
const perspectiveDefault = 30;

let layers = [];
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let motionStarted = false;


/* =========================
   CREATE UPLOAD BUTTONS
========================= */

for (let i = 0; i < 5; i++) {

    const label = document.createElement("label");
    label.className = "file";
    label.textContent = "Image " + (i + 1);

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    label.appendChild(input);

    input.addEventListener("change", function (event) {

        const file = event.target.files[0];

        if (file) {
            addImage(i, file);
        }

    });

    uploads.appendChild(label);
}


/* =========================
   ADD IMAGE
========================= */

function addImage(index, file) {

    const reader = new FileReader();

    reader.onload = function () {

        let layer = layers[index];

        if (!layer) {

            layer = {
                image: document.createElement("img"),

                depth: depthDefault,
                movement: movementDefault,
                perspective: perspectiveDefault
            };

            layer.image.className = "layer";

            layers[index] = layer;

            stage.appendChild(layer.image);
        }

        layer.image.src = reader.result;

        layer.image.style.zIndex = index + 1;

        empty.style.display = "none";

        hint.textContent = "Tilt your phone ↔";

        createLayerControls();

        render();
    };

    reader.readAsDataURL(file);
}


/* =========================
   LAYER CONTROL PANEL
========================= */

function createLayerControls() {

    let panel = document.getElementById("layerControls");

    if (!panel) {

        panel = document.createElement("div");

        panel.id = "layerControls";
        panel.className = "layer-controls";

        document
            .querySelector(".controls")
            .before(panel);
    }

    panel.innerHTML = "<h3>Layers</h3>";

    layers.forEach(function (layer, index) {

        if (!layer) return;

        const card = document.createElement("div");

        card.className = "layer-card";

        card.innerHTML = `
            <div class="layer-title">
                <span>Layer ${index + 1}</span>
                <span>${index === 0 ? "Background" : index === layers.length - 1 ? "Foreground" : "Depth " + index}</span>
            </div>

            <div class="control-row">
                <span>Depth</span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value="${layer.depth}"
                    data-type="depth"
                >
                <span class="value">${layer.depth}</span>
            </div>

            <div class="control-row">
                <span>Movement</span>
                <input
                    type="range"
                    min="0"
                    max="150"
                    value="${layer.movement}"
                    data-type="movement"
                >
                <span class="value">${layer.movement}</span>
            </div>

            <div class="control-row">
                <span>Perspective</span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value="${layer.perspective}"
                    data-type="perspective"
                >
                <span class="value">${layer.perspective}</span>
            </div>
        `;

        const sliders =
            card.querySelectorAll("input");

        sliders.forEach(function (slider) {

            slider.addEventListener("input", function () {

                const type =
                    slider.dataset.type;

                layer[type] =
                    Number(slider.value);

                slider.parentElement
                    .querySelector(".value")
                    .textContent =
                    slider.value;

                render();
            });

        });

        panel.appendChild(card);
    });
}


/* =========================
   PARALLAX ENGINE
========================= */

function render() {

    layers.forEach(function (layer) {

        if (!layer || !layer.image) return;

        // Convert the individual layer settings
        // into usable values.

        const depth =
            Number(layer.depth) / 100;

        const movement =
            Number(layer.movement) / 100;

        const perspective =
            Number(layer.perspective);


        /*
        DEPTH

        A layer with depth 0 behaves like
        the background.

        A layer with depth 1 behaves like
        the closest foreground layer.
        */

        const depthOffset =
            depth * 45;


        /*
        MOVEMENT

        Every layer gets its OWN movement value.

        Background:
        movement = 0.05

        Foreground:
        movement = 1.00
        */

        const moveX =
            targetX *
            movement *
            100;

        const moveY =
            targetY *
            movement *
            65;


        /*
        PERSPECTIVE

        Each layer can have its own
        rotation response.
        */

        const rotateY =
            targetX *
            perspective *
            0.12;

        const rotateX =
            -targetY *
            perspective *
            0.08;


        /*
        SCALE

        Deeper/closer layers are slightly
        enlarged so that their edges don't
        appear when they move.
        */

        const scale =
            1.06 +
            depth * 0.08;


        /*
        APPLY EVERYTHING TO THIS
        PARTICULAR IMAGE.
        */

        layer.image.style.transform =
            `
            translate3d(
                ${moveX}px,
                ${moveY}px,
                ${depthOffset}px
            )
            rotateY(${rotateY}deg)
            rotateX(${rotateX}deg)
            scale(${scale})
            `;
    });
}

/* =========================
   SMOOTH MOTION
========================= */

function animation() {

    currentX +=
        (targetX - currentX) * 0.12;

    currentY +=
        (targetY - currentY) * 0.12;

    render();

    requestAnimationFrame(animation);
}

animation();


/* =========================
   PHONE GYROSCOPE
========================= */

async function enableTilt(button) {

    try {

        if (!window.DeviceOrientationEvent) {

            hint.textContent =
                "Motion sensors aren't supported.";

            return;
        }


        if (
            typeof DeviceOrientationEvent.requestPermission ===
            "function"
        ) {

            const permission =
                await DeviceOrientationEvent.requestPermission();

            if (permission !== "granted") {

                hint.textContent =
                    "Motion permission denied.";

                return;
            }
        }


        if (motionStarted) return;

        motionStarted = true;


        window.addEventListener(
            "deviceorientation",
            function (event) {

                if (
                    event.gamma === null ||
                    event.beta === null
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
                        Math.min(1, x)
                    );


                y =
                    Math.max(
                        -1,
                        Math.min(1, y)
                    );


                targetX = x;
                targetY = y;

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
            "Could not access motion sensors.";
    }
}


/* =========================
   ENABLE BUTTON
========================= */

const motionButton =
    document.getElementById("motion");

if (motionButton) {

    motionButton.onclick =
        function () {

            enableTilt(
                motionButton
            );

        };
}


/* =========================
   RESET
========================= */

const resetButton =
    document.getElementById("reset");

if (resetButton) {

    resetButton.onclick =
        function () {

            layers.forEach(function (layer) {

                if (layer) {
                    layer.image.remove();
                }

            });

            layers = [];

            targetX = 0;
            targetY = 0;

            empty.style.display = "grid";

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
