class Ego extends Actor {

    /**
     * Constructor for Ego.
     */
    constructor() {
        super();
    }

    /**
     * Process Ego hitting a room exit.
     * 
     * @param {number} edge 
     */
    hitEdge(edge) {
        // 0 = no edge yet
        // 1 = door
        // 2 = up stairs
        // 3 = down stairs
        if (edge) {
            // Stop moving.
            this.destX = this.destZ = -1;
            this.heading = null;

            // Now check if there is a room on this edge.
            let edgeData = this.game.rooms[this.room - 1][edge];
            if (edgeData) {
                this.game.inputEnabled = false;

                // Hide ego (and pip) before we reposition him to the new entry point.
                this.hide();
                this.pip.hide();

                // Reposition both ego and pip.
                this.setPosition(edgeData[2], edgeData[3]);
                this.setDirection(edgeData[1]);
                this.game.pip.setPosition(edgeData[2], edgeData[3]);
                this.game.pip.setDirection(edgeData[1]);

                // Set the new room for ego.
                this.room = edgeData[0];
                
                // Previous positions are not applicable when room changes.
                this.positions = [];

                this.step = 1;

                // Store the edge that ego entered the new room.
                this.edge = edge;
            }
        }
    }
}