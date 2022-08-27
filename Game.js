class Game {

    inventory = {};
    
    verb = 'Walk to';
    
    command = 'Walk to';   // Current constructed command, either full or partial
    
    thing = '';

    itemsLeft = 0;

    /**
     * The rooms map is essentially the game map.
     */
    rooms = [
        // Room type, room width, left crossing, left path, centre crossing, right path, right crossing
        // room 50  = special room for country side, but used in multiple places.
        // Room types:
        //  bit 0: 1 = has wall, 0 = no wall
        //  bit 1: 1 = tree row, 0 = no tree row
        //  bit 2: 1 = smaller trees, 0 = normal trees (if bit 1 is set)
        //  bit 3: 1 = big trees at bottom of screen, 0 = no big trees
        // Negative value for room applies to left/right path only. Negative means down, Position means up.

        // Main street north.
        [7, 960,  1, 0, 0, 0, 1],
    ];

    props = [
        // Room#, type, name, content, width, height, x, y, radius override, z-index override, element reference
        // bit 0-1:  00 = actor, 01 = item, 10 = prop, 11 = not used.
        // bit 2:    0  = shadow, 1 = no shadow
        // bit 3:    0  = observe objs, 1 = ignore objs
        // bit 4:    0  = not building, 1 = building
        // bit 5-6:  00 = normal, 01 = light, 10 = dark
        // bit 7:    0 = normal, 1 = horizontal flip

        // Room 1 - Entry Hall
        [ 1,  14, 'middle_wall',          null, 260,   360, 165,  720,  , 1000 ],
        [ 1,  14, 'stairs',               null, 360,   75,  null, null, , 501  ],
        [ 1,  14, 'up_stairs',            null, 410,   145, null, null, , 1000 ],
        [ 1,  14, 'door',                 null, 80,    207, 180,  574,  , 501  ],
        [ 1,  14, 'down_stairs',          null, 180,   70,  null, null, , 501  ],

        // Room 50 - Return into current room.
        // No items. Ego just walks back into the previous room, as there is nothing in that direction.

        // Room 0 - All rooms
        [ 0,  14, 'left_wall',            null, 260,   360, null, null, , 501 ],
        [ 0,  14, 'right_wall',           null, 260,   360, null, null, , 501 ],
        [ 0,  14, 'left_window',          null, 121,   231, null, null, , 501 ],
        [ 0,  14, 'right_window',         null, 121,   231, null, null, , 501 ],
    ];

    // 1 = 
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
        customElements.define('x-ego', Ego);
        customElements.define('x-shadow', class Shadow extends HTMLElement {});
        
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
        (Util.MAC? ['🚶','🤚🏼','⬆️','💬','⬇️','⏳','↖️','👁️','⬅️','➕','↗️','🤏🏼','➡️','❔','↙️','🔍','↘️'] :
        ['🚶','🤚🏼','\u{1F871}','💬','\u{1F873}','⏳','\u{1F874}','👁️','\u{1F870}','➕','\u{1F875}','🤏🏼','\u{1F872}','❔','\u{1F877}','🔍','\u{1F876}']).forEach((c,i) => {
            let hsy = [cursorSize-1, cursorSize/2][i%2];
            this.cursors[c] = `url(${Util.renderEmoji(c, cursorSize, cursorSize)[0].toDataURL()}) ${cursorSize/2} ${hsy}, auto`;
            document.body.style.setProperty(`--${c}`, this.cursors[c]);
        });
        this.verbIcon = '🚶';

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
                    this.sound.playSong();
                    this.init();
                    this.loop();
                }, 200);
            }
        //}

        // TODO: Following is for debug only
        window.game = this;
    }

    /**
     * Initialised the parts of the game that need initialising on both
     * the initial start and then subsequent restarts. 
     */
    init() {
        this.screen.onclick = e => this.processCommand(e);
        
        // Set the room back to the start, and clear the object map.
        this.objs = [];
        this.room = 1;

        // Create Ego (the main character) and add it to the screen.
        this.ego = document.createElement('x-ego');
        this.ego.init(this, 50, 150);
        this.ego.setPosition(450, 750);
        this.screen.appendChild(this.ego);

        // Enter the starting room.
        this.newRoom();

        // TODO: Uncomment when releasing.
        // Intro text.
        // this.inputEnabled = false;
        // this.ego.say("Hello!!", 100, () => {
        //     this.ego.say("I'm detective Pip.", 250, () => {
        //         this.ego.say("The King has commissioned me to find his missing Page Boy.", 300, () => {
        //             this.ego.say("He was on his way to deliver a message to The Goblin...", 300, () => {
        //                 this.ego.moveTo(300, 740, () => {
        //                     this.ego.say("...but went missing in the woods to the west.", 300, () => {
        //                         this.ego.moveTo(300, 800, () => {
        //                             this.ego.say("Please help me to find him.", 200, () => {
        //                                 this.ego.say("Use the Walk, Look, Pick up, and Talk icons below.", 300, () => {
                                            this.inputEnabled = true;
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
        this.scaleX = innerWidth / this.wrap.offsetWidth;
        this.scaleY = innerHeight / this.wrap.offsetHeight;
        this.wrap.style.setProperty('--scale-x', this.scaleX);
        this.wrap.style.setProperty('--scale-y', this.scaleY);
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
        this.updateDelta(now);

        // Update all objects on the screen.
        this.updateObjects();

        // Update sentence.
        let newSentence = this.command + ' ' + this.thing;
        if (newSentence != this.lastSentence) {
            this.sentence.innerHTML = this.lastSentence = newSentence;
        }

        // Adjust screen left to account for scrolling.
        if (this.ego.visible) {
            let newScreenLeft = this.ego.cx - (960 / 2);
            if (newScreenLeft < 0) newScreenLeft = 0;
            if (newScreenLeft > (this.roomData[1] - 960)) newScreenLeft = (this.roomData[1] - 960);

            if (newScreenLeft != this.screenLeft) {
                this.screenLeft = newScreenLeft;
                this.screen.style.setProperty('--screen-left', `-${this.screenLeft}px`);
            }
        }

        // If after updating all objects, the room that Ego says it is in is different
        // than what it was previously in, then we trigger entry in to the new room.
        if (this.ego.edge) {
            this.edge = this.ego.edge;
            this.room = this.ego.room;
            this.fadeOut(this.wrap);
            setTimeout(() => this.newRoom(), 200);
            this.ego.edge = 0;
        }

        // Update based on user input state.
        this.overlay.style.display = (this.inputEnabled? 'none' : 'block');

        // Update cursor.
        let newCursor = this.cursors[this.inputEnabled? this.verbIcon : '⏳'];
        if (newCursor != this.currCursor) {
            this.wrap.style.cursor = newCursor;
            if (this.verbIcon != '🚶') {
                this.wrap.style.setProperty('--c', newCursor);
            } else {
                this.wrap.style.removeProperty('--c');
            }
        }
        this.currCursor = newCursor;
    }

    /**
     * Updates the delta, which is the difference between the last time and now. Both values
     * are provided by the requestAnimationFrame call to the game loop. The last time is the
     * value from the previous frame, and now is the value for the current frame. The difference
     * between them is the delta, which is the time between the two frames.
     * 
     * @param {number} now The current time provided in the invocation of the game loop.
     */
    updateDelta(now) {
        if (now) {
            this.delta = now - (this.lastTime ? this.lastTime : (now - 16));
            this.stepFactor = this.delta * 0.06;
            this.lastTime = now;
        }
    }

    /**
     * The main method invoked on every animation frame when the game is unpaused. It 
     * interates through all of the Sprites and invokes their update method. The update
     * method will invoke the move method if the calculated position has changed. This
     * method then tests if the Sprite is touching another Sprite. If it is, it invokes
     * the hit method on both Sprites. 
     */
    updateObjects() {
        let a1 = this.ego;

        // Attempt to update ego.
        a1.update();

        this.objs.forEach(o => {
            if (a1.touching(o)) a1.hit(o);
        });

        a1.moved = false;
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
            this.command = this.verb = 'Walk to';
            this.verbIcon = '🚶';
          }
        }
        if (e) e.stopPropagation();
    }

    /**
     * Invoked when Ego is entering a room.  
     */
    newRoom() {
        // All main rooms are outside,
        this.inside = 0;

        // Reset command for new room.
        this.thing = '';
        this.command = this.verb = 'Walk to';
        this.verbIcon = '🚶';

        // Remove the previous room's Objs from the screen.
        this.objs.forEach(obj => this.screen.removeChild(obj));
        this.objs = [];

        this.roomData = this.rooms[this.room - 1];

        // Adjust the screen width for the new room.
        this.screen.style.setProperty('--screen-width', `${this.roomData[1]}px`);

        // Add props
        this.props.forEach(prop => {
            // If prop is in the current room, or in room 0 (i.e. all rooms)...
            if ((prop[0] == this.room) || (prop[0] == 0)) this.addPropToRoom(prop);
        });

        this.ego.show();

        if (this.edge == 3) {
            let e = this.ego;
            let bo = this.objs.find(o => e.touching(o));
            if (bo) {
                // Ego is touching a car...
                // Move Ego to either the left or right, depending on which is closer.
                e.setPosition(e.cx < bo.cx? bo.x - e.width - 20 : bo.x + bo.width + 20, e.z);
                // Adjust the destination to match the new X position.
                e.dests[0].x = e.x;
            }
        }

        this.fadeIn(this.wrap);
        this.fadeIn(this.ego);
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
        // bit 0-1:  00 = actor, 01 = item, 10 = prop, 11 = not used.
        // bit 2:    0  = shadow, 1 = no shadow
        // bit 3:    0  = observe objs, 1 = ignore objs
        // bit 4:    0  = not building, 1 = building
        // bit 5-6:  00 = normal, 01 = light, 10 = dark
        // bit 7:    0 = normal, 1 = horizontal flip

        if (!obj) {
            obj = new Sprite();
            obj.init(this, prop[4], prop[5], prop[3], !(prop[1] & 4), (prop[1] & 128));

            obj.dataset.name = prop[2].replace('_',' ');
            obj.classList.add(prop[2]);

            obj.propData = prop;

            if (prop[6] !== null) {
                obj.setPosition(prop[6], prop[7]);
            }
            if (prop[1] & 8) {
                // Ignore objs
                obj.ignore = true;
            }
            if (prop[8]) {
                obj.radius = prop[8];
            }
            if (prop[9]) {
                obj.style.zIndex = prop[9];
            }

            prop[11] = obj;
        }

        // If it is an actor, store a reference to ease of use.
        if (!prop[1]) this.actor = obj;

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