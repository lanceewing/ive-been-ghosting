/**
 * Holds room logic functions.
 */
class Logic {

  /**
   * Constructor for Logic.
   * 
   * @param {Game} game The Game.
   */
  constructor(game) {
    this.game = game;
  }

  /**
   * Processes a command from the user input.
   * 
   * @param {string} verb The verb part of the command to process.
   * @param {string} cmd The full command to process.
   * @param {string} thing The thing or noun part of the command to process.
   * @param {MouseEvent} e The mouse event associated with the command to process.
   */
  process(verb, cmd, thing, e) {
    let newCommand = cmd;
    let game = this.game;
    let flags = game.flags;
    let ego = game.ego;
    let pip = game.pip;

    // If thing is in the current room, then obj will reference it.
    let item = game.inventory[thing];
    let obj = item? item.obj : game.objs.find(i => i.dataset['name'] == thing);
    let fn = null;

    switch (verb) {
      case 'Whisper to':
        let thing2 = (cmd.indexOf(' about ') < 0? '' : `,${cmd.substring(11, cmd.indexOf(' about '))}`)
        fn = () => {
          switch (thing + thing2) {
            case 'spirit_box':
              if (flags[0]) {      // Spirit Box ON
                if (flags[2]) {    // Already spoken to Pip once
                  if (flags[3]) {  // Spirit Box batteries are now flat
                    ego.say("The batteries have gone flat.");
                  } else {
                    newCommand = 'Whisper to spirit box about ';
                  }
                } else {           // Not yet spoken to Pip
                  ego.say("Boo!!!", () => {
                    pip.say("Who was that? I can't see you.", () => {
                      ego.say("I am a helpful ghost, and your guide.", () => {
                        pip.say("Ah... how do I know I can trust you?", () => {
                          ego.say("I will show you things, and whisper helpful tips to you.", () => {
                            pip.say("Hmmm, OK, but you will have to earn my trust.");
                            flags[2] = 1;
                          });
                        });
                      });
                    });
                  });
                  pip.jump();
                }
              } else {
                ego.say("It is turned OFF.");
              }
              break;
            case 'me':
              ego.say("I've been doing that for centuries.");
              break;
            case 'pip':
              ego.say("Boo!!!", () => {
                pip.say("Did somebody say something?", () => {
                  ego.say("I don't think he can hear me properly.");
                });
              });
              pip.jump();
              break;
            case 'door,spirit_box':
              if (flags[6]) {
                if (game.hasItem('urn')) {
                  pip.moveTo(obj.cx, 610, () => {
                    // TODO: Implement move to next room.
                    game.inputEnabled = true;
                  }); 
                } else {
                  pip.say("The door is already open.");
                }
              } else if (flags[4]) {
                pip.say("I don't see a door handle.");
              } else {
                pip.say("Is that a door? I didn't notice.", () => {
                  pip.moveTo(obj.cx, Math.min(obj.cz, 610), () => {
                    pip.say("I don't see a door handle.");
                    flags[4] = 1;
                  });
                });
              }
              break;
            case 'clock,spirit_box':
              if (flags[6]) {
                pip.say("The door is already open.");
              } else if (flags[5]) {   // Noticed that the clock has been moved many times.
                pip.say("The clock has been moved many times you say? Let me check...", () => {
                  pip.moveTo(obj.cx, Math.min(obj.cz, 610), () => {
                    obj.setPosition(obj.x + 10, obj.z);
                    obj = game.screen.querySelector(".door");
                    obj.classList.add("open");
                    flags[6] = 1;
                    pip.setDirection(Sprite.RIGHT);
                    pip.say("The door opened!!", () => {
                      pip.querySelector(".actor").classList.remove("shake");
                      pip.moveTo(obj.cx, 610, () => {
                        pip.setDirection(Sprite.LEFT);
                        pip.say("Are you coming?");
                      }); 
                    });
                    game.inputEnabled = true;
                  });
                });
              } else {
                pip.say("Sorry, I'm not sure what you want me to do.");
              }
              break;
            case 'urn,spirit_box':
              if (flags[6]) {
                pip.say("Oh! I need to take you with me?", () => {
                  pip.moveTo(obj.cx, 610, () => {
                    game.getItem(thing);
                    pip.setDirection(Sprite.RIGHT);
                    pip.say("Shall we go now?");
                  });
                });
              } else {
                pip.say("An urn? I'm too scared to touch that!");
              }
              break;
            default:
              if (thing2) {
                pip.say("Sorry, I'm not sure what you want me to do.");
              } else {
                ego.say("It doesn't speak.");
              }
              break;
          }
        }
        if (thing2) {
          ego.say(`Try the ${thing}.`, fn);
          newCommand = verb;
        } else {
          fn();
        }
        break;

      case 'Float to':
        switch (thing) {
          default:
            // Walk to screen object or screen click position.
            let z = ((e.pageY / game.scaleY) - 27) * 2;
            if (z <= 970) {
              ego.stop(true);
              let destX = e.pageX / game.scaleX;
              destX = (destX > 960 - 50? 960 + 10 : destX < 50? -10 : destX);
              ego.moveTo(destX, z > 555? z : 585);
            } else {
              // Must be an item. Change command to Use
              game.verb = 'Use';
              newCommand = 'Use ' + thing + ' with ';
            }
            break;
        }
        break;

      case 'Touch':
        fn = () => { 
          switch (thing) {
            case 'spirit_box':
              flags[0] = !flags[0];
              ego.say(`It is now turned ${flags[0]? "ON" : "OFF"}.`);
              break;
            case 'urn':
              ego.say("I'm unable to carry objects.");
              break;
            case 'clock':
              ego.say("Too heavy for me to move.");
              break;
            default:
              ego.say("Nothing happened.");
              break;
          }
        }
        if (obj) {
          if (obj.touching(game.anchor, 150)) {
            ego.moveTo(obj.cx, Math.min(obj.cz, 610), fn);
          } else {
            ego.say("It's too far from my urn.");
          }
        } else {
          ego.say("I don't think that would help.");
        }
        break;

      case 'Look at':
        switch (thing) {
          case 'circle':
            ego.say("I can only move that far from my urn.");
            break;
          case 'pip':
            ego.say(flags[6]? "He looks calm. I guess he trusts me now." : "He looks scared.");
            break;
          case 'spirit_box':
            ego.say(`It is turned ${flags[0]? "ON, to Ghost FM" : "OFF"}.`);
            break;
          default:
            if (obj && obj.propData[9]) {
              // Object description.
              ego.say(obj.propData[9]);
              if (obj.propData[10]) {
                // Flag to set when object is looked at.
                flags[obj.propData[10]] = 1;
              }
            }
            else if (thing != "") {
              ego.say("It's just a " + thing + ".");
            }
            break;
        }
        break;

      default:
        ego.say("Nothing happened.");
        break;
    }

    return newCommand;
  }

}
