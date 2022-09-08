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
    let obj = game.objs.find(i => i.dataset['name'] == thing);
    let fn = null;

    switch (verb) {
      case 'Whisper to':
        let thing2 = (cmd.indexOf(' about ') < 0? '' : `,${cmd.substring(11, cmd.indexOf(' about '))}`)
        fn = () => {
          switch (thing + thing2) {
            case 'radio':
              if (flags[0]) {      // Radio ON
                if (flags[2]) {    // Already spoken to Pip once
                  if (flags[3]) {  // Radio batteries are now flat
                    ego.say("The batteries have gone flat.");
                  } else {
                    newCommand = 'Whisper to radio about ';
                  }
                } else {           // Not yet spoken to Pip
                  ego.say("Boo!!!", () => {
                    pip.say("Who was that? I can't see you.", () => {
                      ego.say("I am a helpful ghost, and your guide.", () => {
                        pip.say("Ah... how do I know I can trust you?", () => {
                          ego.say("I will show you things, and whisper helpful tips to you.", () => {
                            pip.say("OK, but you will have to earn my trust.");
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
            case 'door,radio':
              if (flags[4]) {
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
              destX = (destX > game.roomData[1] - 50? game.roomData[1] + 10 : destX < 50? -10 : destX);
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
            case 'radio':
              flags[0] = !flags[0];
              ego.say(`It is now turned ${flags[0]? "ON" : "OFF"}.`);
              break;
            case 'urn':

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
            ego.say("He looks scared.");
            break;
          case 'radio':
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
      
      case 'Use':
        let useFn = () => {
          let thing1 = cmd.substring(4, cmd.indexOf(' with '));
          let things = [thing, thing1].sort().join();
          switch (things) {
            default:
              ego.say("Hmmm, that didn't work.");
              break;
          }
        }

        // Execute Use command for two objects, with movement if obj set.
        if (obj) {
          ego.moveTo(ego.cx, 740, () => ego.moveTo(obj.cx, 740, useFn));
        } else {
          useFn();
        }

        newCommand = verb;
        break;

      default:
        ego.say("Nothing happened.");
        break;
    }

    if (newCommand.endsWith('with ')) {
      game.verbIcon = game.inventory[thing].innerHTML;
      game.cursors[game.verbIcon] = `url(${Util.renderEmoji(game.verbIcon, 50, 50)[0].toDataURL()}) 25 25, auto`;
    }

    return newCommand;
  }

}
