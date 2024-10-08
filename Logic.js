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

    // Show ego on first action in new room.
    if (game.hasItem('urn') && (!ego.visible)) {
      ego.show();
      game.fadeIn(this.game.ego);
      game.anchor.show();
    }

    switch (verb) {
      case 'Whisper to':
        let thing2 = (cmd.indexOf(' about ') < 0? '' : `,${cmd.substring(11, cmd.indexOf(' about '))}`)
        fn = () => {
          switch (thing + thing2) {
            case 'ghost':
              ego.say("Boo???", () => {
                obj.say("BOO!!!", () => {
                  ego.say("Whoa! He seems angry about something.");
                });
              });
              break;
            case 'ghost bed':
              ego.say("I'd rather let her sleep.");
              break;
            case 'spirit box':
              if (flags[0]) {      // Spirit Box ON
                if (flags[2]) {    // Already spoken to Pip once
                  if (flags[3]) {  // Spirit Box batteries are now flat
                    ego.say("The batteries have gone flat.");
                  } else {
                    newCommand = 'Whisper to spirit box about ';
                  }
                } else {           // Not yet spoken to Pip
                  ego.say("Boo!!!", () => {
                    pip.say("Who said 'Boo'? I can't see you.", () => {
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
            case 'picture':
              if (flags[8]) {
                if (flags[9]) {
                  if (flags[10]) {
                    ego.say("Hmmm, nothing happened.");
                  } else {
                    ego.say("Yeah, this might work. Boo!!", () => {
                      obj.classList.add("m4");
                      flags[10] = 1;
                      obj = game.screen.querySelector(".down_stairs");
                      obj.show();
                      obj = game.screen.querySelector(".trapdoor");
                      obj.classList.add("open");
                      setTimeout(() => ego.say("The trapdoor opened!"), 1000);
                    });
                  }
                } else {
                  ego.say("Hmmm, nothing happened.");
                }
              } else {
                ego.say("Hmmm, nothing happened.");
              }
              break;
            case 'pip':
              ego.say("Boo!!!", () => {
                if ((game.room != 2) && !game.hasItem('spirit box')) {  
                  pip.say("Is that you? I can't hear what you're saying.");
                }
                else if (game.hasItem('spirit box')) {
                  pip.say("Try using the spirit box.");
                }
                else {
                  pip.say("Did somebody say something?", () => {
                    ego.say("I don't think he can hear me properly.");
                  });
                }
              });
              break;
            case 'door,spirit box':
              if (game.room == 2) {
                if (flags[6]) {
                  if (game.hasItem('urn')) {
                    pip.moveTo(obj.cx, 610, () => {
                      ego.hitEdge(1);  // Edge 1 is always a door.
                    }); 
                  } else {
                    pip.say("Yes, it's open. After you.");
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
              } else if (game.room == 1) {
                pip.moveTo(325, 625, () => {
                  pip.moveTo(150, 625, () => {
                    ego.hitEdge(1);
                  });
                }, pip.x > 315);
              } else if (game.room == 3) {
                if (flags[7]) {
                  pip.say("The ghost is blocking my way to the door.");
                } else {
                  pip.moveTo(obj.cx, 610, () => {
                    ego.hitEdge(1);  // Edge 1 is always a door.
                  }); 
                }
              }
              break;
            case 'bedroom door,spirit box':
              pip.moveTo(420, 700, () => {
                pip.moveTo(260, 700, () => {
                  pip.moveTo(175, 970, () => {
                    ego.hitEdge(1);
                  });
                }, pip.x > 330);
              }, pip.x > 330);
              break;
            case 'clock,spirit box':
              if (flags[6]) {
                pip.say("The door is already open.");
              } else {
                pip.say("Try moving the clock? Okay, let me check...", () => {
                  pip.moveTo(obj.cx, Math.min(obj.cz, 610), () => {
                    obj.setPosition(obj.x + 10, obj.z);
                    obj = game.screen.querySelector(".door");
                    obj.classList.add("p5");
                    flags[6] = 1;
                    pip.setDirection(Sprite.RIGHT);
                    pip.say("The door opened!!", () => {
                      pip.querySelector(".actor").classList.remove("shake");
                      pip.moveTo(obj.cx, 610, () => {
                        pip.setDirection(Sprite.LEFT);
                        pip.say("Are you coming?");
                      }); 
                    });
                  });
                });
              }
              break;
            case 'urn,spirit box':
              if (game.hasItem('urn')) {
                if (flags[13]) {
                  // End game.
                  pip.say("Empty your urn into the river? OK.", () => {
                    pip.moveTo(380, 700, () => {
                      pip.say("There, I've tipped the ash into the river.", () => {
                        ego.setPosition(pip.x - 100, pip.z);
                        ego.show();
                        game.fadeIn(ego);
                        ego.say("Thank you Pip! I am finally free.", () => {
                          ego.say("I drowned in this river. Now my soul can finally rest.", () => {
                            ego.setDirection(Sprite.OUT);
                            pip.setDirection(Sprite.OUT);
                            ego.say("THE END!");
                            pip.say("THE END!", () => {
                              game.fadeOut(game.wrap);
                              game.msg.innerHTML = "The End";
                              game.msg.style.display = 'flex';
                              game.fadeIn(game.msg);
                            });
                          });
                        });
                      });
                    });
                  });
                } else {
                  pip.say("Sorry, I'm not sure what you want me to do with it.");
                }
              } else if (flags[6] && game.room == 2) {
                pip.say("Oh! I need to take 'YOU' with me?", () => {
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
            case 'spirit box,spirit box':
              if (game.hasItem('spirit box')) {
                pip.say("Yes, it's an amazing device.");
              } else {
                pip.say("A spirit box? Is this how you talk to me?", () => {
                  pip.say("Let's take it.", () => {
                    pip.moveTo(obj.cx, 610, () => {
                      game.getItem(thing);
                      game.inputEnabled = true;
                    });
                  });
                });
              }
              break;
            case 'down stairs,spirit box':
              if (game.room == 1) {
                pip.moveTo(pip.x, 625, () => {
                  pip.moveTo(145, 625, () => {
                    pip.moveTo(140, 850, () => {
                      ego.hitEdge(3);  // Edge 3 is always down stairs.
                    });
                  }, pip.x > 300);
                }, pip.x > 300);
              } else if (game.room == 3) {
                if (flags[7]) {
                  pip.moveTo(800, 850, () => {
                    flags[7] = false;
                    ego.hitEdge(3);
                  });
                } else {
                  pip.say("The ghost is blocking my way to the stairs.");
                }
              }
              break;
            case 'stairs,spirit box':
            case 'up stairs,spirit box':
              if (game.room == 6) {  // Cellar.
                pip.moveTo(500, 610, () => {
                  ego.hitEdge(2);  // Edge 2 is always up stairs.
                });
              } else if (game.room == 1) {
                pip.moveTo(150, 625, () => {
                  pip.moveTo(450, 625, () => {
                    flags[7] = true;
                    ego.hitEdge(2);
                  });
                }, pip.x < 300);
              } else if (game.room == 4) {
                pip.moveTo(420, 700, () => {
                  pip.moveTo(290, 700, () => {
                    pip.moveTo(290, 660, () => {
                      ego.hitEdge(2);
                    });
                  }, pip.x > 330);
                }, pip.x > 330);
              } else if (game.room == 5) {
                pip.moveTo(360, 625, () => {
                  pip.moveTo(340, 625, () => {
                    ego.hitEdge(2);
                  });
                });
              }
              break;
            case 'trapdoor,spirit box':
              if (flags[10]) {
                pip.say("Sorry, I'm not sure what you want me to do.");
              } else {
                pip.moveTo(325, 625, () => {
                  pip.moveTo(150, 625, () => {
                    pip.moveTo(97, 800, () => {
                      pip.say("It appears to be locked.");
                    });
                  });
                }, pip.x > 315);
              }
              break;
            case 'left vase,spirit box':
              pip.moveTo(150, 625, () => {
                pip.moveTo(325, 625, () => {
                  pip.moveTo(430, obj.z - 10, () => {
                    pip.setDirection(Sprite.LEFT);
                    pip.say("This vase it too heavy to lift.");
                  });
                }, pip.x < 300);
              }, pip.x < 300);
              break;
            case 'vase,spirit box':
              if (!game.hasItem('vase')) {
                pip.moveTo(150, 625, () => {
                  pip.moveTo(325, 625, () => {
                    pip.moveTo(770, obj.z - 10, () => {
                      pip.setDirection(Sprite.RIGHT);
                      pip.say("This vase it empty. I'll take it.", () => {
                        game.getItem(thing);
                        game.inputEnabled = true;
                      });
                    });
                  }, pip.x < 300);
                }, pip.x < 300);
              } else {
                pip.say("Sorry, I'm not sure what you want me to do.");
              }
              break;
            case 'beer keg,spirit box':
              pip.moveTo(700, 745, () => {
                if (game.hasItem('vase')) {
                  pip.say("I have filled the vase with beer.");
                  flags[11] = 1;
                } else {
                  pip.say("It is too heavy for me to lift.")
                }
              });
              break;
            case 'sled,spirit box':
              if (game.hasItem('sled')) { 
                ego.say("Someone died using this sled.");
              } else {
                pip.moveTo(400, 920, () => {
                  pip.say("Looks useful. Let's take it.");
                  game.getItem('sled');
                });
              }
              break;
            case 'cryptoporticus,spirit box':
              if (flags[12]) {  // Glass cover smashed.
                if (game.hasItem('candle')) {
                  pip.say("With the candle light, it should be fine.", () => {
                    pip.moveTo(obj.cx, 610, () => {
                      ego.hitEdge(1);
                    });
                  });
                } else {
                  pip.say("It's too dark in there.");
                }
              } else {
                pip.say("It's covered with a glass panel.");
              }
              break;
            case 'fire,spirit box':
              pip.moveTo(obj.cx, 610, () => {
                if (flags[11]) {
                  obj.propData[0] = -1;
                  game.remove(obj);
                  flags[1] = 1;
                  obj = game.screen.querySelector(".ladder");
                  obj.show();
                  pip.say("I extinguished it with the beer.", () => {
                    pip.moveTo(obj.cx + 100, 630, () => {
                      game.inputEnabled = true;
                    });
                  });
                } else {
                  pip.say("There's something behind the flame.", () => {
                    pip.say("If only I had liquid to extinguish it.");
                  });
                }
              });
              break;
            case 'ladder,spirit box':
              if ((game.room == 3) && flags[7]) {
                pip.say("The ghost is blocking my way to the ladder.");
              } else {
                pip.moveTo(obj.cx, 610, () => {
                  ego.hitEdge(2);
                });
              }
              break;
            case 'candle,spirit box':
              if (!game.hasItem('candle')) {
                pip.moveTo(260, 700, () => {
                  pip.moveTo(420, 700, () => {
                    pip.moveTo(650, obj.z - 10, () => {
                      pip.setDirection(Sprite.OUT);
                      pip.say("I'll feel safer with this.", () => {
                        game.getItem(thing);
                        game.inputEnabled = true;
                      });
                    });
                  }, pip.x < 330);
                }, pip.x < 330);
              } else {
                pip.say("I feel safer with this.");
              }
              break;
            case 'tool box,spirit box':
              if (game.hasItem('tool box')) {
                if (game.hasItem('hammer')) {
                  pip.say("There's nothing else inside.");
                } else {
                  pip.say("There's a hammer inside.");
                  game.getItem('hammer','🔨');
                }
              } else {
                pip.moveTo(620, 700, () => {
                  pip.setDirection(Sprite.RIGHT);
                  pip.say("I wonder what's inside here.", () => {
                    game.getItem(thing);
                    game.inputEnabled = true;
                  });
                });
              }
              break;
            case 'hammer,spirit box':
              if (game.room == 6) {
                if (flags[12]) {
                  pip.say("I've already smashed the glass panel.");
                } else {
                  pip.say("Smash the glass panel with the hammer?", () => {
                    pip.moveTo(415, 625, () => {
                      pip.say("Great idea!", () => {
                        obj = game.screen.querySelector(".cryptoporticus");
                        obj.classList.remove("p1");
                        obj.propData[1] |= 2;
                        game.inputEnabled = true;
                        flags[12] = 1;
                      });
                    });
                  });
                }
              } else {
                pip.say("Sorry, I'm not sure what you want me to do with it.");
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
          ego.say(`...${thing}...`, fn);
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
            }
            break;
        }
        break;

      case 'Touch':
        fn = () => { 
          switch (thing) {
            case 'spirit box':
              flags[0] = !flags[0];
              ego.say(`It is now turned ${flags[0]? "ON" : "OFF"}.`);
              break;
            case 'urn':
              ego.say("I'm unable to carry objects.");
              break;
            case 'clock':
              ego.say("Too heavy for me to move.");
              break;
            case 'door':
              if (game.room == 1) {
                obj.classList.add("shake");
                pip.say("You want to go through the door? OK.", () => {
                  obj.classList.remove("shake");
                  pip.moveTo(obj.cx, 610, () => {
                    ego.hitEdge(1);  // Edge 1 is always a door.
                  });
                });
              }
              break;
            default:
              ego.say("Hmmm, nothing happened.");
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

      case 'Listen to':
        switch (thing) {
          case 'picture':
            if (flags[8]) {
              if (flags[9]) {
                ego.say("I don't hear anything.");
              } else {
                ego.say("Hmmm, I wonder...", () => {
                  obj.classList.add("m3");
                  flags[9] = 1;
                  setTimeout(() => ego.say("Hey!! The picture changed again!"), 1000);
                });
              }
            } else {
              ego.say("I don't hear anything.");
            }
            break;
          case 'spirit box':
            ego.say("Only the living listen to it.");
            break;
          case 'clock':
            ego.say("Tick, tock.");
            break;
          case 'ghost bed':
            ego.say("Yep, she's snoring.");
            break;
          case 'fire':
          case 'fireplace':
            if (flags[1]) {
              ego.say("I hear sounds from upstairs.");
            } else {
              ego.say("The fire crackles.");
            }
            break;
          default:
            ego.say("I don't hear anything.");
            break;
        }
        break;

      case 'Look at':
        switch (thing) {
          case 'circle':
            ego.say("I can only move that far from my urn.");
            break;
          case 'river':
            if (flags[13]) {
              ego.say("I remember now. This river is where I died.");
            } else {
              ego.say("Very pretty.");
            }
            break;
          case 'pip':
            ego.say(flags[6]? "He looks calm. I guess he trusts me now." : "He looks scared.");
            break;
          case 'spirit box':
            ego.say(`It is turned ${flags[0]? "ON, to Ghost FM" : "OFF"}.`);
            break;
          case 'fireplace':
            ego.say(flags[1] || (game.room == 3)? "Is that a ladder at the back?" : "The fire burns brightly.");
            break;
          case 'vase':
            ego.say(flags[11]? "It is filled with beer." : "It is empty.");
            break;
          case 'cryptoporticus':
            ego.say(flags[12]? "A long, dark tunnel. Very spooky." : "It is covered with a glass panel.");
            break;
          case 'me':
            ego.say("I forget who I am. Maybe pip can help me remember.");
            break;
          case 'ghost bed':
            ego.say("Don't worry, it's just Letitia, sleeping.");
            break;
          case 'ghost':
            ego.say("I don't think I know this guy. He's new.");
            break;
          case 'picture':
            if (flags[8]) {
              if (flags[9]) {
                if (flags[10]) {
                  ego.say("It's just a happy monkey now.");
                } else {
                  ego.say("Now the monkey is covering its mouth.");
                }
              } else {
                ego.say("Now the monkey is covering its ears.");
              }
            } else {
              ego.say("The monkey is covering its eyes.", () => {
                obj.classList.add("m2");
                flags[8] = 1;
                setTimeout(() => ego.say("Hey!! It just changed!"), 1000);
              });
            }
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
