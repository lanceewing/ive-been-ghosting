class Ego extends Actor {

    /**
     * Constructor for Ego.
     */
    constructor() {
        super();
    }

    /**
     * 
     * @param {number} edge 
     */
    hitEdge(edge) {
        if (edge) {
            // Stop moving.
            this.destX = this.destZ = -1;
            this.heading = null;

            // Now check if there is a room on this edge.
            let edgeData = this.game.rooms[this.room - 1][edge];
            if (edgeData) {
                this.game.inputEnabled = false;

                // Hide ego (and pip) before we reposition him to the new entry point.
                if (edgeData != this.room) {
                    this.hide();
                    this.pip.hide();
                }

                // Set the new room for ego.
                this.room = edgeData;

                // 0 = no edge yet
                // 1 = door
                // 2 = up stairs
                // 3 = down stairs

                // Work out the new position for ego.
                switch (edge) {
                    case 1: // Exit out of a door.
                        this.setPosition(newRoomWidth, this.z);
                        this.setDirection(Sprite.LEFT);
                        this.moveTo(newRoomWidth - 70, 740, () => this.game.inputEnabled = true);
                        break;

                    case 2: // Exit up stairs.
                        this.setPosition(newRoomWidth - pathStartAddX - this.radius, pathStartY);
                        this.setDirection(newRoomDown? Sprite.IN : Sprite.OUT);
                        this.moveTo(newRoomWidth - pathEndAddX, 740, () => this.game.inputEnabled = true);
                        break;

                    case 3: // Exit down stairs.
                        this.setPosition(reverseX, 950);
                        this.setDirection(Sprite.IN);
                        this.moveTo(reverseX, 740, () => this.game.inputEnabled = true);
                        break;
                }
                
                // Previously positions are not applicable when room changes.
                this.positions = [];

                this.step = 1;

                // Store the edge that ego entered the new room.
                this.edge = edge;
            }
        }
    }
}