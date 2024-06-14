
// Mobile Controller v.2.0
// Coded by Loroko 
// Created: 6/8/2024
// Last Updated: 6/10/2024
// blackflypress.com 

const tapThreshold = 250;
const swipeThreshold = 100;
const moveThreshold = 150;

class Gamepad extends Phaser.Scene{

    constructor(){
        super('Gamepad');
        this.touch = false;
        this.moveActive = false
        this.movePointer = null;
        this.gestureActive = false;
        this.gesturePointer = null;
        this.moveAngle = 0; // get data
        this.moveDistance = 0;
        this.moveForce = 0;

      }// end constructor 

      preload() {
        this.load.image('touchOrigin', 'touchpad.png'); // load touchpad assets
        this.load.image('touchCurrent', 'touchpad.png'); 
        this.load.image('touchButton', 'button.png'); 
        this.load.bitmapFont('p2', 'PressStart2P.png', 'PressStart2P.xml');
      }// end preload

      create() {
        this.add.line(config.width/2, config.height/2, 0, config.height, 0, 0, 0x00ff00);
        this.add.bitmapText(50, 25 , 'p2', `Analog Control`, 45).setOrigin(0,0).setTint(0x00ff00);
        this.add.bitmapText(config.width/2 + 50, 25 , 'p2', `Gesture Control`, 45).setOrigin(0,0).setTint(0x00ff00);
        this.textAngle = this.add.bitmapText(50, 900 , 'p2', `Angle:`, 45).setOrigin(0,0).setTint(0x00ff00);
        this.textForce = this.add.bitmapText(50, 950 , 'p2', `Force:`, 45).setOrigin(0,0).setTint(0x00ff00);
        this.textDistance = this.add.bitmapText(50, 1000 , 'p2', `Distance:`, 45).setOrigin(0,0).setTint(0x00ff00);
        this.textGesture = this.add.bitmapText(config.width/2 + 50, 1000 , 'p2', `Gesture:`, 45).setOrigin(0,0).setTint(0x00ff00);
        this.touchButton = this.add.image(0, 0, 'touchButton');
        this.touchOrigin = this.add.image(0, 0, 'touchOrigin'); // create touchpad assets
        this.touchCurrent = this.add.image(0, 0, 'touchCurrent');
        this.touchButton.setScale(10);// scale up
        this.touchOrigin.setScale(10);
        this.touchCurrent.setScale(10);
        this.touchButton.alpha = 0; // reduce opacity
        this.touchOrigin.alpha = 0; 
        this.touchCurrent.alpha = 0;
        }// end create
      
        assignPointers() {
          this.touch = true;
            if (this.input.pointer1.x < config.width/2) { // check for location of pointer1
              this.movePointer = this.input.pointer1 ;
              this.gesturePointer = this.input.pointer2 ;
            } 
            if (this.input.pointer1.x > config.width/2) {
              this.gesturePointer = this.input.pointer1 ;
              this.movePointer = this.input.pointer2 ;
           }
        }// end touchAssign
      
        update() {
          this.textAngle.setText('Angle: ' + this.moveAngle); // UI updates
          this.textForce.setText('Force: ' + this.moveForce); // UI updates

          this.textDistance.setText('Distance: ' + this.moveDistance);
         
          if (this.touch == false && this.input.pointer1.active) { // first point of contact
            this.assignPointers();
          }// end if (this.touch...
      
          if (this.touch == true) {
            if (this.movePointer.active && this.movePointer.downX < config.width/2) { // handle analog control
              this.moveActive = true;
              // console.log('move');
              this.touchOrigin.alpha = .2; // increase opacity
              this.touchCurrent.alpha = .2;
              this.touchOrigin.setPosition(this.movePointer.downX, this.movePointer.downY); // assign coordinates
              this.touchCurrent.setPosition(this.movePointer.x, this.movePointer.y); 
              this.moveAngle = Math.trunc(this.movePointer.getAngle() * 180/Math.PI); // get data
              this.moveDistance = Math.trunc(this.movePointer.getDistance());
              this.moveDistance = Phaser.Math.Clamp(this.moveDistance, 0, moveThreshold);
              this.moveForce = Math.trunc(this.moveDistance / moveThreshold*100);

              if (this.moveDistance == moveThreshold) { // limit distance of current visually
                Phaser.Math.RotateAroundDistance(this.touchCurrent, this.touchOrigin.x, this.touchOrigin.y, 0, moveThreshold);
              }// end if (this.distance

            }// end if (this.movePointer.active...
      
            if (!this.movePointer.active) {      // handle analog control end
              this.moveActive = false;
              this.touchOrigin.setPosition(0, 0); // assign coordinates
              this.touchCurrent.setPosition(0, 0); 
              this.touchOrigin.alpha = 0; // reduce opacity
              this.touchCurrent.alpha = 0;
              this.moveAngle = 0; // get data
              this.moveDistance = 0;
              this.moveForce = 0;
        
            }// end if (!this.movePointer.active...
      
            if (this.gesturePointer.active && this.gesturePointer.downX > config.width/2) { // handle gesture control
              this.gestureActive = true;
              this.touchButton.alpha = .2;
              this.touchButton.setPosition(this.gesturePointer.x, this.gesturePointer.y); //assign coordinates
              this.gestureDistance = Math.trunc(this.gesturePointer.getDistance());
              this.gestureDistanceX = Math.trunc(this.gesturePointer.getDistanceX());
              this.gestureDistanceY = Math.trunc(this.gesturePointer.getDistanceY());
              this.gestureAngle = Math.trunc(this.gesturePointer.getAngle() * 180/Math.PI);
              this.gestureDuration = Math.trunc(this.gesturePointer.getDuration());
              this.gestureUp = this.gesturePointer.upTime;


              if (this.gestureDuration > tapThreshold) { // HOLD
                this.textGesture.setText('Gesture: Hold');
              }// end if (this.gestureDuration...
              
            }// if (this.gesturePointer.active
      
            if (!this.gesturePointer.active && this.gestureActive == true) { // TAP
              this.gestureActive = false;
              this.touchButton.alpha = 0; //reduce opacity

              if (this.gestureDistance < swipeThreshold){ //Check Tap vs Release distance
                if (this.gestureDuration < tapThreshold) { 
                  this.textGesture.setText('Gesture: Tap');
                  this.gestureDown = this.gesturePointer.downTime;
          
                  if (this.gestureDown - this.gestureUp < 120) {
                    this.textGesture.setText('Gesture: Double Tap');
                  }


                }// end if (this.gestureDuration...

      
              }// end if (this.gestureDistance...

              if (this.gestureDuration < 225){
      
              if (this.gestureDistance > swipeThreshold) { // SWIPES
                if (this.gestureDistanceX > this.gestureDistanceY) {
                  if (this.gesturePointer.downX > this.gesturePointer.upX) {
                    this.textGesture.setText('Gesture: Swipe Left');
                  }// end if (this.gesturePointer.downX >...
                  if (this.gesturePointer.downX < this.gesturePointer.upX) {
                    this.textGesture.setText('Gesture: Swipe Right');
                  }// end if (this.gesturePointer.downX <...
                }// end if (this.gestureDistanceX...
      
                if (this.gestureDistanceX < this.gestureDistanceY) {
                  if (this.gesturePointer.downY > this.gesturePointer.upY) {
                    this.textGesture.setText('Gesture: Swipe Up');
                  }// end if (this.gesturePointer.downY >...
                  if (this.gesturePointer.downY < this.gesturePointer.upY) {
                    this.textGesture.setText('Gesture: Swipe Down');
                  }// end if (this.gesturePointer.downY <...
                }// end if (this.gestureDistanceX...
              }// end if (this.gestureDistance...
            }// end if (!this.gesturePointer.active...
          }
          
            if (!this.gesturePointer.active && !this.movePointer.active) { // handle all touch end
              this.touch = false;
            }// end if (!this.gesturePointer.active...
          }//end this.touch == true)
        }//end update
    //   } //end Touchpad scene
      
}
const config = {
    type: Phaser.AUTO,
    width: 2160,
    height: 1080,
    backgroundColor: 0xacabaf,
    input: {
      activePointers: 3
    },// end input
    physics: { 
        default: 'arcade',
        arcade: {
            
            debug: true,
            debugShowBody: true,
            debugBodyColor: 0x00ff00
        },// end arcade
    },// end physics
    render: {
        pixelArt: true
    },// end render
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },// end scale
    scene: [
        Gamepad
    ]// end scene
    // seed: [ (Date.now() * Math.random()).toString() ]
  }; // end config
export default new Phaser.Game(config);

