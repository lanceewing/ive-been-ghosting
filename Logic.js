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
        switch (thing) {
          case 'pip':
            ego.say("Boo!!!", () => {
              pip.say("Did somebody say something?", () => {
                ego.say("I don't think he can hear me properly.");
              });
            });
            break;
          default:
            ego.say("It doesn't speak.");
            break;
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
            default:
              ego.say("Nothing happened.");
              break;
          }
        }
        if (obj) {
          if (obj.touching(game.anchor, 150)) {
            ego.moveTo(obj.cx, Math.min(obj.cz, 610), fn);
          } else {
            ego.say("I can't walk to there.");
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
            ego.say(`It is turned ${flags[0]? "ON" : "OFF"}.`);
            break;
          default:
            if (obj && obj.desc) {
              ego.say(obj.desc);
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
