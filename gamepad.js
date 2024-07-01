import * as M from './module.js'

const moveThreshold = 150;
const tapThreshold = 150;
const swipeThreshold = 100;

export default class Touchpad extends Phaser.Scene {
  constructor(){
    super('Touchpad');
    this.touch = false;
    this.moveActive = false
    this.movePointer = null;
    this.gestureActive = false;
    this.gesturePointer = null;
    this.moveAngle = 0; // get data
    this.moveDistance = 0;
    this.moveForce = 0;
    this.hold = false;
  }// constructor end
 
  create() {
  ///////////////////////////////////DEBUG///////////////////////////////////DEBUG///////////////////////////////////
  this.textAngle = this.add.bitmapText(50, M.height - 200, 'p2', `Angle:`, 72 )
  .setOrigin(0,0).setScale(.5,.5).setTint(0x00ff00);
  this.textForce = this.add.bitmapText(50, M.height - 150, 'p2', `Force:`, 72 )
  .setOrigin(0,0).setScale(.5,.5).setTint(0x00ff00);
  this.textDistance = this.add.bitmapText(50, M.height - 100, 'p2', `Distance:`, 72 )
    .setOrigin(0,0).setScale(.5,.5).setTint(0x00ff00);;
  this.textGesture = this.add.bitmapText(M.width/2 + 50, M.height - 100, 'p2', `Gesture:`, 72 )
    .setOrigin(0,0).setScale(.5,.5).setTint(0x00ff00);
  // this.graphics = this.add.graphics();
  ///////////////////////////////////DEBUG///////////////////////////////////DEBUG///////////////////////////////////

    this.touchButton = this.add.image(0, 0, 'touchButton').setAlpha(0).setScale(8);
    this.touchOrigin = this.add.image(0, 0, 'touchOrigin').setAlpha(0).setScale(8); //create touchpad assets
    this.touchCurrent = this.add.image(0, 0, 'touchCurrent').setAlpha(0).setScale(8);
  }//create end

  assignPointers() {
    this.touch = true;
      if (this.input.pointer1.x < M.width/2) {
        this.movePointer = this.input.pointer1 ;
        this.gesturePointer = this.input.pointer2 ;
      } 
      if (this.input.pointer1.x > M.width/2) {
        this.gesturePointer = this.input.pointer1 ;
        this.movePointer = this.input.pointer2 ;
     }
  }// end touchAssign

  update() {
  ///////////////////////////////////DEBUG///////////////////////////////////DEBUG///////////////////////////////////
  // this.graphics.clear();
  // this.graphics.fillStyle(0x0000ff, 1);
  // this.graphics.fillCircle(this.input.pointer1.x, this.input.pointer1.y, 16, 16);
  // this.graphics.fillStyle(0xff0000, 1);
  // this.graphics.fillCircle(this.input.pointer2.x, this.input.pointer2.y, 16, 16);
  this.textAngle.setText('Angle: ' + this.moveAngle);
  this.textForce.setText('Force: ' + this.moveForce);
  this.textDistance.setText('Distance: ' + this.moveDistance);
  ///////////////////////////////////DEBUG///////////////////////////////////DEBUG///////////////////////////////////
 
    if (this.touch == false && this.input.pointer1.active) {
      this.assignPointers();
    }

    if (this.touch == true) {
      if (this.movePointer.active && this.movePointer.x < M.width/2) {
        this.moveActive = true;
        this.touchOrigin.setPosition(this.movePointer.downX, this.movePointer.downY).setAlpha(.2); //assign coordinates
        this.touchCurrent.setPosition(this.movePointer.x, this.movePointer.y).setAlpha(.2); //assign coordinates
        this.moveAngle = Math.trunc(this.movePointer.getAngle() * 180/Math.PI);
        this.moveDistance = Math.trunc(this.movePointer.getDistance());
        this.moveDistance = Phaser.Math.Clamp(this.moveDistance, 0, moveThreshold);
        this.moveForce = Math.trunc(this.moveDistance / moveThreshold*100);

        if (this.moveDistance == moveThreshold) { // limit distance of current visually
          Phaser.Math.RotateAroundDistance(this.touchCurrent, this.touchOrigin.x, this.touchOrigin.y, 0, moveThreshold);
          // M.emitter.emit('touchMove', {moveAngle: this.moveAngle, moveDistance: this.moveDistance});

        }// end if (this.distance
      
        if (this.moveForce > 0) {
          M.emitter.emit('moveStart', {moveAngle: this.moveAngle, moveForce: this.moveForce, moveDistance: this.moveDistance});
        }// end  if (this.moveDistance...
      }// end if (this.movePointer.active...

      if (!this.movePointer.active && this.moveActive == true) {
        this.touchOrigin.setPosition(0, 0).setAlpha(0); // assign coordinates
        this.touchCurrent.setPosition(0, 0).setAlpha(0);
        this.moveAngle = 0; // get data
        this.moveDistance = 0;
        this.moveForce = 0;
        M.emitter.emit('moveEnd');
        this.moveActive = false;
      }// end if (!this.movePointer.active...

      if (this.gesturePointer.active && this.gesturePointer.x > M.width/2) {
        this.gestureActive = true;
        this.touchButton.alpha = .2;
        this.touchButton.setPosition(this.gesturePointer.x, this.gesturePointer.y); //assign coordinates
        this.gestureDistance = Math.trunc(this.gesturePointer.getDistance());
        this.gestureDistanceX = Math.trunc(this.gesturePointer.getDistanceX());
        this.gestureDistanceY = Math.trunc(this.gesturePointer.getDistanceY());
        this.gestureAngle = Math.trunc(this.gesturePointer.getAngle() * 180/Math.PI);
        this.gestureDuration = Math.trunc(this.gesturePointer.getDuration());
        this.gestureUp = this.gesturePointer.upTime;
        

        if (this.gestureDuration > tapThreshold && this.hold == false) { // HOLD
          this.hold = true;
          this.textGesture.setText('Gesture: Hold');
          M.emitter.emit('hold');
          // console.log('hold')

        }// end if (this.gestureDuration...

        // M.emitter.emit('touchGesture', {gestureAngle: this.gestureAngle, gestureDistance: this.gestureDistance, gestureDuration: this.gestureDuration});
      
      
      }// if (this.gesturePointer.active

      if (!this.gesturePointer.active && this.gestureActive == true) {
        this.gestureActive = false;
        this.hold = false;
        this.touchButton.alpha = 0; //reduce opacity

        if (this.gestureDistance < swipeThreshold){ //Check Tap vs Release distance
          
          // tapCount = tapCount + 1;
          if (this.gestureDuration < tapThreshold) { // TAP
            this.textGesture.setText('Gesture: Tap');
            this.gestureDown = this.gesturePointer.downTime;
            M.emitter.emit('tap');

            if (this.gestureDown - this.gestureUp < 75) {
              // tapCount = tapCount + 1;
              M.emitter.emit('double_tap');
              this.textGesture.setText('Gesture: Double Tap');
            }

          }// end if (this.gestureDuration...

        }// end if (this.gestureDistance...

        if (this.gestureDistance > swipeThreshold) { // SWIPE
          if (this.gestureDistanceX > this.gestureDistanceY) {
            // console.log('horizontal');
            if (this.gesturePointer.downX > this.gesturePointer.upX) {
              this.textGesture.setText('Gesture: Swipe Left');
              M.emitter.emit('swipe_left');
            }// end if (this.gesturePointer.downX >...
            if (this.gesturePointer.downX < this.gesturePointer.upX) {
              this.textGesture.setText('Gesture: Swipe Right');
              M.emitter.emit('swipe_right');
            }// end if (this.gesturePointer.downX <...
          }// end if (this.gestureDistanceX...

          if (this.gestureDistanceX < this.gestureDistanceY) {
            // console.log('horizontal');
            if (this.gesturePointer.downY > this.gesturePointer.upY) {
              this.textGesture.setText('Gesture: Swipe Up');
              M.emitter.emit('swipe_up');
            }// end if (this.gesturePointer.downY >...
            if (this.gesturePointer.downY < this.gesturePointer.upY) {
              this.textGesture.setText('Gesture: Wipe Down');
              M.emitter.emit('swipe_down');
            }// end if (this.gesturePointer.downY <...
          }// end if (this.gestureDistanceX...
        }// end if (this.gestureDistance...
      }// end if (!this.gesturePointer.active...
    
      if (!this.gesturePointer.active && !this.movePointer.active) {
        this.touch = false;
        M.emitter.emit('touchEnd');
      }// end if (!this.gesturePointer.active...
    }//end this.touch == true)
  }//end update
} //end Touchpad scene

