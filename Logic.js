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

    // If thing is in the current room, then obj will reference it.
    let obj = game.objs.find(i => i.dataset['name'] == thing);
    let pickup = () => game.getItem(thing);
    let speaker = game.actor? game.actor : ego;

    switch (verb) {
      case 'Talk to':
        switch (thing) {
          case 'office worker':
            if (game.hasItem('ticket')) {
              game.actor.say("Hello!");
            } else {
              game.actor.say("I've lost my briefcase!");
            }
            break;
          default:
            if (obj && obj == game.actor) {
              game.actor.say("Hello!");
            } else {
              speaker.say("It doesn't speak.");
            }
            break;
        }
        break;

      case 'Walk to':
        switch (thing) {
          case 'outside':
            while (obj && obj.nextElementSibling) {
              obj = obj.nextElementSibling;
              game.remove(obj.previousElementSibling);
            }
            game.remove(obj);
            game.actor = null;
            ego.setPosition(ego.x, ego.z-544);
            ego.show();
            game.inside = 0;
            game.thing = '';
            break;

          default:
            // Walking into a building.
            if (obj && obj.propData && obj.propData[1] & 16) { 
              if ((thing == 'circus') && !game.hasItem('ticket')) {
                ego.say("I need a ticket.");
              }
              else if ((thing == 'coffin') && !game.hasItem('magic ring')) {
                ego.say("Magic is stopping me opening the coffin.");
              } 
              else {
                let props = game.props.filter(prop => prop[0] == obj.propData[10]);
                if (props.length) {
                  ego.stop(true);
                  ego.moveTo(ego.cx, 740, () => {
                    ego.moveTo(obj.cx, 740, () => {
                      let outsideX = Math.min(Math.max(obj.cx-200, 280), game.roomData[1] - 680);
                      // Add "outside" background
                      game.addPropToRoom([0, 14, 'outside', null, 6720, 485, 0, 970, , 1000]);
                      // Add "inside" background.
                      game.addPropToRoom([0, 14, 'inside', null, 400, 300, outsideX, 700, , 1001]);
                      // Add the items inside the building.
                      props.forEach(prop => game.addPropToRoom(prop));
                      ego.hide();
                      game.inside = 1;
                      ego.setPosition(ego.x, ego.z+544);
                    });
                  });
                } else {
                  ego.say("This building is locked.");
                }
              }
            } else {
              // Walk to screen object or screen click position.
              let z = ((e.pageY / game.scaleY) - 27) * 2;
              if (z <= 970) {
                if (!game.inside) {
                  ego.stop(true);
                  let destX = game.screenLeft + (e.pageX / game.scaleX);
                  destX = (destX > game.roomData[1] - 50? game.roomData[1] + 10 : destX < 50? -10 : destX);
                  ego.moveTo(destX, z > 710? z : 740);
                }
              } else {
                // Must be an item. Change command to Use
                game.verb = 'Use';
                newCommand = 'Use ' + thing + ' with ';
              }
            }
            break;
        }
        break;

      case 'Pick up':
        if (game.hasItem(thing)) {
          ego.say("I already have that.");
        } else {
          switch (thing) {
            case 'jack-o-lantern':
              ego.say("No, I shouldn't.");
              break;
            default:
              // Is item in the current room?
              if (obj && obj.propData[1] & 1) {

                if (obj.propData[0] < 11) {
                  // Normal room, so walk to item and pick it up.
                  ego.moveTo(ego.cx, 740, () => ego.moveTo(obj.x, 740, pickup));
                } else {
                  // Inside room.
                  if (obj.propData[0] == 31 || obj.propData[0] == 28)  {
                    // In my house, castle and the hospital ego can pick the items without constraint.
                    pickup();
                  }
                  else if (thing == 'bellhop') {
                    if (game.actor) {
                      game.actor.say("Please leave that there.");
                    } else {
                      pickup();
                    }
                  }
                  else {
                    game.actor.say(`Hey! That's my ${thing}.`);
                  }
                }
              }
              else {
                ego.say("I can't get that.");
              }
              break;
          }
        }
        break;

      case 'Look at':
        switch (thing) {
          case 'tree':
          case 'trees':
            ego.say("The trees make this island look very pretty.");
            break;
          default:
            if (thing != "") {
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
            case 'boy,pill':
              // End game sequence.
              game.inputEnabled = false;
              game.actor.say("An antidote? Really? Thank you so much!", 450, () => {
                game.actor.say("It tastes... strange...", 350, () => {
                  game.actor.say("I feel... something...", 350, () => {
                    game.actor.render('👦');
                    game.actor.say("I'm normal again!!", 300, () => {
                      game.room = 7;
                      ego.edge
                      game.fadeOut(game.wrap);
                      setTimeout(() => {
                        ego.setPosition(ego.x, ego.z-544);
                        game.inside = 0;
                        game.newRoom();
                        ego.say("I have returned the page boy to the castle.", 200, () => {
                          ego.say("Thank you for helping me to solve the case.", 200, () => {
                            ego.say("Well done!!!", 200, () => {
                              setTimeout(() => location.reload(), 3000);
                            });
                          });
                        });
                      }, 200);
                    });
                  });
                });
              });
              break;
            default:
              ego.say("Hmmm, that didn't work.");
              break;
          }
        }

        // Execute Use command for two objects, with movement when outside.
        if (game.inside || !obj) {
          useFn();
        } else {
          ego.moveTo(ego.cx, 740, () => ego.moveTo(obj.cx, 740, useFn));
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
