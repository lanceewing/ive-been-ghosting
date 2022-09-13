class Game {

    inventory = {};
    
    verb = 'Float to';
    
    command = 'Float to';   // Current constructed command, either full or partial
    
    thing = '';

    itemsLeft = 0;

    /**
     * The rooms map is essentially the game map.
     * 
     * room type:
     * bit 0: Floor reflects
     */
    rooms = [
        // 1. Entry Hall
        [0, [2, 8, 715, 625], [3, 4, 815, 840], [6, 1, 415, 625]],

        // 2. Parlor
        [1, [1, 8, 315, 625], [3, 8, 445, 625], ],

        // 3. Small Landing and Bedroom
        [0, [4, 4, 150, 900], [2, 8, 513, 625], [1, 1, 450, 625]],

        // 4. Library and Bedroom
        [0, [3, 1, 280, 625], [5, , , ], ],

        // 5. Attic
        [0, , [4, , , ], ],

        // 6. Cellar
        [0, [7, , , ], [1, 4, 80, 750], ]

        // 7. Outside.

    ];

    props = [
        // Room#, type, name, content, width, height, x, y, z-index override, description
        // bit 0:    0 = visible, 1 = hidden
        // bit 1:
        // bit 2:    0 = shadow, 1 = no shadow
        // bit 3:    0 = observe objs, 1 = ignore objs
        // bit 4:    0 = observe reflection, 1 = ignore reflection
        // bit 5:    0 = closed, 1 = open
        // bit 6:  
        // bit 7:    0 = normal, 1 = horizontal flip

        // Room 1 - Entry Hall
        [ 1,  4, 'middle_wall',          null, 260,   360, 165,  720,  852 ],
        [ 1,  4, 'stairs',               null, 360,   75,  450,  414,  501, "Looks very ghostly." ],
        [ 1,  4, 'up_stairs',            null, 410,   145, null, null, 1000 ],
        [ 1,164, 'door',                 null, 80,    207, 180,  574,  501, "The jib door is open." ],
        [ 1,  5, 'down_stairs',          null, 180,   70,  null, null, 498  ],
        [ 1,  4, 'picture',              null, 84,    84,  380,  300,  501  ],
        [ 1, 12, 'rug',                  null, 386,   120, 392,  950,  499 ],
        [ 1,  4, 'trapdoor',             '☠', 152,   80,  null, null, 850, "That's a rather ominous design." ],
        [ 1,  0, 'left_vase',            '🏺', 80,   90,   300,  950,   ],
        [ 1,  0, 'vase',                 '🏺', 80,   90,   815,  950,   ],

        // Room 2 - Parlor
        [ 2,  4,  'fireplace',            null, 200,   130,  380, 600, 599 ],
        [ 2,  4,  'fire',                 '🔥', 40,     50,  460, 600, 601, "It burns brightly." ],
        [ 2, 128, 'couch',                '🛋', 160,   200,  180, 610,  ],
        [ 2, 12,  'rug',                  null, 630,   120,  166, 900, 611 ],
        [ 2, 20,  'door',                 null, 80,    207,  700, 574, 501, "It looks like a jib door." ],
        [ 2, 20,  'clock',                '🕰', 40,     40,  380, 340, 501, "Looks to have been moved many times.", 5 ],
        [ 2, 20,  'urn',                  '⚱',  40,     40,  460, 340, 501, "It contains my ashes." ],
        [ 2, 20,  'spirit_box',           '📻', 40,    40,  540, 340,  501 ],
        [ 2, 21,  'ladder',               null, 40,     63,  460, 570, 600, "It appears to go up the chimney." ],

        // Room 3 - Small landing and Bedroom
        [ 3,  4,  'middle_wall',         null, 260,   360,  503, 720, 1000 ],
        [ 3, 132, 'down_stairs',         null, 180,   70,   700, 956, 501  ],
        [ 3, 20,  'bed',                 '🛏', 150,   110,   95, 850, 701  ],
        [ 3, 20,  'alcove',              null, 108,   320,  101, 760, 700  ],
        [ 3,  4,  'fireplace',           null, 200,   130,  330, 600, 599  ],
        [ 3, 20,  'ladder',              null, 40,    50,  407, 590, 600, "It appears to go down the chimney." ],
        [ 3,  4,  'alcove_wall',         null, 260,   360,  95,  720, 1000 ],
        [ 3, 36,  'door',                null, 80,    207, 180,  574, 501  ],
        [ 3,  0,  'ghost',               '🕴️', 80,    170,  735, 720,  , "He's guarding the stairs."],

        // Room 4 - Library and Bedroom
        [ 4,  12, 'middle_wall',          null, 260,   360, 250,  720, 1000 ],
        [ 4,  12, 'side_wall',            null,  53,   300, 372,  596, 501 ],
        [ 4,  12, 'window',               null, 121,   231, 542,  478, 501  ],
        [ 4,  4,  'stairs',               null, 360,   75,    0,  414, 501  ],
        [ 4,  4,  'back_wall',            null, 260,   315,  136, 630, 502 ],
        [ 4,  12, 'book_case',            null, 136,   265, 401,  600, 502  ],
        [ 4,  12, 'book_case',            null, 136,   265, 667,  600, 502  ],
        [ 4,  12, 'rug',                  null, 350,   120, 450,  884, 501 ],
        [ 4,   0, 'chair',               '🪑',  50,   120, 720,  700,   ],
        [ 4,   4, 'desk',                 null, 222,   60, 668,  800,   ],
        [ 4,  12, 'bedroom_door',         null, 100,   15,  120, 970, 1002 ],

        // Room 5 - Attic
        [ 5,  12, 'wall1',                null, 190,   341, 115,  683,   ],
        [ 5,  12, 'wall2',                null, 190,   341, 655,  683,   ],
        [ 5,  12, 'wall3',                null, 100,   311, 295,  623,   ],
        [ 5,  12, 'wall4',                null, 100,   311, 565,  623, 501 ],
        [ 5,  12, 'wall5',                null,  25,   290, 357,  586, 502 ],
        [ 5,   4, 'roof',                 null, 961,   30,   -1,   30, 1000 ],
        [ 5,   0, 'ghost_bed',           '🛌', 225,   110, 370,  590,   ],
        [ 5,   4, 'stairs2',              null,  35,   207, 326,  590, 501  ],

        // Room 6 - Cellar
        [ 6,  12, 'middle_wall',          null, 260,   388, 165,  720, 850 ],
        [ 6,  12, 'side_wall',            null,  53,   300, 305,  600, 501 ],
        [ 6,   4, 'cryptoporticus',       null, 180,   200, 352,  574, 501, "A long, dark tunnel. Very spooky." ],
        [ 6,   4, 'stairs',               null, 360,   75,  500,  414, 502  ],
        [ 6,   4, 'up_stairs',            null, 410,   145, null, null, 1000 ],
        [ 6,  12, 'wine_rack',            null, 136,   400,  31,  845,  502, "The wine rack is empty." ],
        [ 6,   0, 'beer_keg',             '🛢', 80,   100,  740,  645,  , "Each is filled with beer." ],
        [ 6,   0, 'beer_keg',             '🛢', 80,   100,  770,  745,  , "Each is filled with beer." ],
        [ 6,   0, 'beer_keg',             '🛢', 80,   100,  815,  845,  , "Each is filled with beer." ],
        [ 6,   0, 'sled',                 '🛷', 150,   40,  280,  920,  , "I vaguely recall some tragic event in my past..." ],

        // Room 50 - Return into current room.
        // No items. Ego just walks back into the previous room, as there is nothing in that direction.

        // Room 0 - All rooms
        [ 0,  4, 'left_wall',            null, 260,   360, null, null, 501 ],
        [ 0,  4, 'right_wall',           null, 260,   360, null, null, 501 ],
        [ 0,  4, 'left_window',          null, 121,   231, null, null, 501 ],
        [ 0,  4, 'right_window',         null, 121,   231, null, null, 501 ],
        [ 0,  4, 'front_wall',           null, 960,   15,  null, null, 1001 ],
    ];

    // 0 = Spirit Box ON
    // 1 = Fire is no longer burning
    // 2 = Ego spoken to Pip once
    // 3 = Batteries flat
    // 4 = Tried parlor door once
    // 5 = Noticed that the clock has been moved many times
    // 6 = Parlor door open
    // 7 = Up stairs from parlor (meets ghost)
    // 8 = Looked at monkey
    // 9 = Listened to monkey
    // 10 = Spoke to monkey
    // 11 = Vase filled with beer
    flags = [];

    /**
     * Constructor for Game.
     */
    constructor() {
        this.screen = document.getElementById('screen');
        this.wrap = document.getElementById('wrap');
        this.overlay = document.getElementById('overlay');
        this.items = document.getElementById('itemlist');
        this.sentence = document.getElementById('sentence');
        this.commands = document.getElementById('commands');
        this.status = document.getElementById('status');
        this.msg = document.getElementById('msg');

        customElements.define('x-sprite', Sprite);
        customElements.define('x-actor', Actor);
        customElements.define('x-ego', Ego);
        customElements.define('x-shadow', class Shadow extends HTMLElement {});
        customElements.define('x-anchor', class Anchor extends Sprite {});
        
        this.logic = new Logic(this);
        this.sound = new Sound();
        this.emojiMap = new Map();

        this.resizeScreen();
        onresize = e => this.resizeScreen(e);

        // Register click event listeners for item list arrow buttons.
        document.getElementById("up").onclick = e => this.scrollInv(1);
        document.getElementById("down").onclick = e => this.scrollInv(-1);

        this.commands.querySelectorAll('*').forEach(verb => {
            verb.onclick = e => {
                this.command = this.verb = e.target.dataset.name;
                this.verbIcon = e.target.innerText;
            }
        });

        // Initalise the mouse cursors.
        // Note: Firefox ignores custom cursors bigger than 32x32 when near the Window edge.
        let cursorSize = navigator.userAgent.match(/Firefox/)? 32 : 50;
        this.cursors = {};
        [['👻', 2],['👆🏼', 0],['💭', 2],['⏳', 1],['👀', 1],['➕', 1],['👂🏼', 1]].forEach(d => {
            let [c, i] = d;
            let hsy = [0, cursorSize/2, cursorSize-1][i];
            this.cursors[c] = `url(${Util.renderEmoji(c, cursorSize, cursorSize)[0].toDataURL()}) ${cursorSize/2} ${hsy}, auto`;
            document.body.style.setProperty(`--${c}`, this.cursors[c]);
        });
        this.verbIcon = '👻';

        this.started = false;
        this.fadeOut(this.wrap);

        // TODO: Uncomment the commented bits when releasing.
        //onclick = e => {
            if (!this.started) {
                this.started = true;
                onclick = null;
                //if (document.fullscreenEnabled) document.documentElement.requestFullscreen();
                this.fadeOut(this.msg);
                setTimeout(() => {
                    this.msg.style.display = 'none'
                    //this.sound.playSong();
                    speechSynthesis.getVoices();  // Trigger fetch of voices up front.
                    this.init();
                    this.loop();
                }, 200);
            }
        //}
    }

    /**
     * Initialised the parts of the game that need initialising on both
     * the initial start and then subsequent restarts. 
     */
    init() {
        this.screen.onclick = e => this.processCommand(e);
        
        // Set the room back to the start, and clear the object map.
        this.objs = [];
        this.room = 2;

        // TODO: Remove. Quick hack to test later parts of game.
        this.flags[11] = 1;
        this.getItem('vase');

        // Create Ego (the main character) and add it to the screen.
        this.ego = document.createElement('x-ego');
        this.ego.init(this, 50, 150);
        this.ego.setPosition(450, 610);
        this.ego.dataset.name = 'me';
        this.addObjEventListeners(this.ego);
        this.screen.appendChild(this.ego);

        // Create "Pip", the visitor to the house.
        this.pip = document.createElement('x-actor');
        this.pip.init(this, 50, 150);
        this.pip.setPosition(450, 935);
        this.pip.dataset.name = 'pip';
        this.addObjEventListeners(this.pip);
        this.screen.appendChild(this.pip);

        // Create the ghost's movement anchor.
        this.anchor = document.createElement('x-anchor');
        this.anchor.init(this, 50, 1, null, false);
        this.anchor.setPosition(450, 620);
        this.anchor.dataset.name = 'circle';
        this.anchor.classList.add('anchor');
        this.addObjEventListeners(this.anchor);
        this.screen.appendChild(this.anchor);

        // Enter the starting room.
        this.newRoom();

        // Intro text.
        this.inputEnabled = false;
        // this.pip.say("This is 'The Solitude' house in Philadelphia Zoo.", () => {
        //     this.pip.say("I'm a Javascript developer called Pip...", () => {
        //         this.pip.moveTo(600, 935, () => {
        //             this.pip.say("...and I have come here to research 'DEATH' for my js13kgames entry...", () => {
        //                 this.pip.moveTo(550, 935, () => {
        //                     this.pip.say("...as I heard this house is haunted.", () => {
        //                         this.ego.say("And he heard right.", () =>  {
        //                             this.ego.say("Please help me to help him with his research.", () => {
        //                                 this.pip.moveTo(530, 850, () => {
        //                                     this.pip.say("Who said that?!", () => {
        //                                         this.pip.querySelector(".actor").classList.add("shake");
                                                 this.inputEnabled = true
        //                                     });
        //                                 });
        //                             });
        //                         });
        //                     });
        //                 });
        //             });
        //         });
        //     });
        // });

        // Fade in the whole screen at the start.
        this.fadeIn(this.wrap);
    }

    /**
     * Adds a Sprite to the game.
     * 
     * @param {Sprite} obj The Sprite to add to the game.
     */
    add(obj) {
        this.screen.appendChild(obj);
        this.objs.push(obj);
    }

    /**
     * Removes a Sprite from the game.
     * 
     * @param {Sprite} obj  The Sprite to remove from the game.
     */
    remove(obj) {
        // Remove the Sprite from the screen.
        try {
            this.screen.removeChild(obj);
        } catch (e) {
            // Ignore. We don't care if it has already been removed.
        }

        // Remove the Sprite from our list of managed objects.
        this.objs = this.objs.filter(o => o !== obj);
    }

    /**
     * Scales the screen div to fit the whole screen.
     * 
     * @param {UIEvent} e The resize event.
     */
    resizeScreen(e) {
        this.wrap.style.setProperty('--scale-x', this.scaleX = innerWidth / this.wrap.offsetWidth);
        this.wrap.style.setProperty('--scale-y', this.scaleY = innerHeight / this.wrap.offsetHeight);
    }

    /**
     * This is the main game loop, in theory executed on every animation frame.
     *
     * @param {number} now Time. The delta of this value is used to calculate the movements of Sprites.
     */
    loop(now) {
        // Immediately request another invocation on the next.
        requestAnimationFrame(now => this.loop(now));

        // Calculates the time since the last invocation of the game loop.
        if (now) {
            this.stepFactor = (now - (this.lastTime || (now - 16))) * 0.06;
            this.lastTime = now;
        }

        this.pip.moved = false;
        this.ego.moved = false;
        let dx = this.ego.x - this.pip.x;
        let dz = this.ego.z - this.pip.z;

        // Update pip, anchor and ego.
        this.pip.update();
        if (this.hasItem('urn') && this.pip.moved) {
            this.anchor.setPosition(this.pip.x, this.pip.z);
            this.ego.stop(true);
            this.ego.hide();
            this.fadeOut(this.ego);
            this.ego.setDirection(this.pip.direction);
            this.ego.setPosition(this.pip.x + dx, this.pip.z + dz);
        } else {
            this.ego.update();
            if (!this.ego.touching(this.anchor, 125)) {
                while (this.ego.reset());
                this.ego.stop(true);
            }
        }

        // Update sentence.
        let newSentence = this.command + ' ' + this.thing;
        if (newSentence != this.lastSentence) {
            this.sentence.innerHTML = this.lastSentence = newSentence;
        }

        // If the room that Ego says it is in is different than what it was previously 
        // in, then we trigger entry in to the new room.
        if (this.ego.edge) {
            this.edge = this.ego.edge;
            this.room = this.ego.room;
            this.fadeOut(this.wrap);
            setTimeout(() => this.newRoom(), 200);
            this.ego.edge = 0;
            this.inputEnabled = true;
        }

        // Update based on user input state.
        this.overlay.style.display = (this.inputEnabled? 'none' : 'block');

        // Update cursor.
        let newCursor = this.cursors[this.inputEnabled? this.verbIcon : '⏳'];
        if (newCursor != this.currCursor) {
            this.wrap.style.cursor = newCursor;
            if (this.verbIcon != '👻') {
                this.wrap.style.setProperty('--c', newCursor);
            } else {
                this.wrap.style.removeProperty('--c');
            }
        }
        this.currCursor = newCursor;
    }
      
    /**
     * Processes the current user interaction.
     * 
     * @param {MouseEvent} e The mouse event that trigger the command to process.
     */
    processCommand(e) {
        if (this.inputEnabled) {
          this.command = this.logic.process(this.verb, this.command, this.thing, e);
          if (this.command == this.verb) {
            this.command = this.verb = 'Float to';
            this.verbIcon = '👻';
          }
        }
        if (e) e.stopPropagation();
    }

    /**
     * Invoked when Ego is entering a room.  
     */
    newRoom() {
        // Reset command for new room.
        this.thing = '';
        this.command = this.verb = 'Float to';
        this.verbIcon = '👻';

        // Remove the previous room's Objs from the screen.
        this.objs.forEach(obj => this.screen.removeChild(obj));
        this.objs = [];

        this.roomData = this.rooms[this.room - 1];

        // Add room classes.
        this.screen.className = 'room' + this.room;
        for (let i=0; i<8; i++) {
            if (this.roomData[0] & (1 << i)) this.screen.classList.add('r' + i);
        }

        // Add props
        this.props.forEach(prop => {
            // If prop is in the current room, or in room 0 (i.e. all rooms)...
            if ((prop[0] == this.room) || (prop[0] == 0)) this.addPropToRoom(prop);
        });

        this.ego.show();
        this.pip.show();
        this.anchor.show();

        this.fadeIn(this.wrap);
        this.fadeIn(this.ego);
        this.fadeIn(this.pip);
        this.fadeIn(this.anchor);
    }

    /**
     * Adds the given prop to the current room screen.
     * 
     * @param {Array} prop 
     */
    addPropToRoom(prop) {
        // Room type, room width, left, left path, road crossing, right path, right

        // We cache the obj when it isn't in the dom rather than recreate. It might remember it's state.
        let obj = prop[11];

        // Room#, type, name, content, width, height, x, y, radius override, z-index override, element reference
        // bit 0
        // bit 1:
        // bit 2:    0 = shadow, 1 = no shadow
        // bit 3:    0 = observe objs, 1 = ignore objs
        // bit 4:    0 = not reflected, 1 = reflected
        // bit 5:    0 = closed, 1 = open
        // bit 6:  
        // bit 7:    0 = normal, 1 = horizontal flip

        if (!obj) {
            obj = new Sprite();
            obj.init(this, prop[4], prop[5], prop[3], !(prop[1] & 4), (prop[1] & 128));

            obj.dataset.name = prop[2].replace(/[0-9]/, '').replace('_',' ');
            obj.classList.add(prop[2]);

            obj.propData = prop;

            if (prop[6] !== null) {
                obj.setPosition(prop[6], prop[7]);
            }

            // Add all prop type flags as classes.
            for (let i=0; i<8; i++) {
                if (prop[1] & (1 << i)) obj.classList.add('p' + i);
            }

            if (prop[1] & 8) {
                // Ignore objs
                obj.ignore = true;
            }
            if (prop[8]) {
                obj.style.zIndex = prop[8];
            }
            if (prop[1] & 1) {
                obj.hide();
            }

            prop[11] = obj;
        }

        this.add(obj);

        this.addObjEventListeners(obj);
    }

    /**
     * Adds the necessarily event listens to the given element to allow it to be 
     * interacted with as an object in the current room.
     * 
     * @param {HTMLElement} elem The HTMLElement to add the object event listeners to.
     */
    addObjEventListeners(elem) {
        // It is important that we don't use addEventListener in this case. We need to overwrite
        // the event handler on entering each room.
        elem.onmouseleave = e => this.thing = '';
        elem.onclick = e => this.processCommand(e);
        elem.onmousemove = e => this.objMouseMove(e);
    }
    
    /**
     * Handles mouse move events, primarily so that the 'thing' property is updated 
     * when the mouse moves over objects on the screen. If the object has a canvas,
     * then it uses the image data to determine when exactly the mouse is over the
     * object. If the pixel is transparent at that position, then it falls back on
     * whatever is underneath the object.
     * 
     * @param {MouseEvent} e The MouseEvent for the mouse move event.
     */
    objMouseMove(e) {
        let target = e.currentTarget;
        if (target.canvas) {
            let rect = target.getBoundingClientRect(); 
            let x = ~~((e.clientX - rect.left) / this.scaleX);
            let y = ~~((e.clientY - rect.top) / this.scaleY);
            let { width, height } = target;
            let ctx = target.canvas.getContext('2d');
            let imgData = ctx.getImageData(0, 0, width, height);

            // Pixel is transparent, so get sprite underneath.
            if (!imgData.data[(y * (width << 2)) + (x << 2) +3]) {
                let elements = document.elementsFromPoint(e.clientX, e.clientY).filter(s => s instanceof Sprite);
                target = elements[1]? elements[1] : null;
            }
        }
        this.thing = target? target.dataset.name : '';
    }

    /**
     * Adds the given item to the inventory.
     * 
     * @param {string} name The name of the item to add to the inventory.
     */
    getItem(name, icon) {
        let item = document.createElement('span');
        item.dataset.name = name;
        this.items.appendChild(item);
        this.addObjEventListeners(item);
        this.inventory[name] = item;
        let obj = this.objs.find(i => i.dataset['name'] == name);
        if (obj) {
            obj.propData[0] = -1;
            this.remove(obj);
            item.innerHTML = obj.propData[3];
            item.obj = obj;
        } else {
            item.innerHTML = icon;
        }
    }

    /**
     * Checks if the given item is in the inventory.
     * 
     * @param {string} name The name of the item to check is in the inventory.
     */
    hasItem(name) {
        return this.inventory.hasOwnProperty(name);
    }

    /**
     * Removes the given item from the inventory.
     * 
     * @param {string} name The name of the item to drop.
     */
    dropItem(name) {
        let item = this.inventory[name];
        this.items.removeChild(item);
        delete this.inventory[name];
        this.scrollInv(1);
        item.obj.propData[0] = this.room;
        this.add(item.obj);
    }

    /**
     * Handles scrolling of the inventory list.
     * 
     * @param {number} dir The direction to scroll the inventory.
     */
    scrollInv(dir) {
        let newLeft = this.itemsLeft + (77 * dir);
        let invCount = this.items.children.length;
        if ((newLeft <= 0) && (newLeft >= -((invCount - 7) * 77))) {
            this.itemsLeft = newLeft;
            this.items.style.left = this.itemsLeft + 'px';
        }
    }

    /**
     * Fades in the given DOM Element.
     * 
     * @param {HTMLElement} elem The DOM Element to fade in.
     */
    fadeIn(elem) {
        // Remove any previous transition.
        elem.style.transition = 'opacity 0.5s';
        elem.style.opacity = 1.0;
        // This is so that other css styles can set transitions on the element
        // while we're not fading in.
        setTimeout(() => elem.style.removeProperty('transition'), 700);
    }

    /**
     * Fades out the given DOM Element.
     * 
     * @param {HTMLElement} elem The DOM Element to fade out.
     */
    fadeOut(elem) {
        elem.style.transition = 'opacity 0.5s';
        elem.style.opacity = 0.0;
    }
}