/*:
 * @plugindesc v 1.0.0 Place social media buttons on your title screen
 * <X_SocialMediaButtons>
 * @author FeniXEngine Contributors (https://fenixenginemv.gitlab.io/)
 * @pluginname X_SocialMediaButtons
 * @modulename X_SocialMediaButtons
 * @external
 * @required
 *
 * @param settings
 * @text General Settings
 * @type struct<Settings>
 * @desc The position & spacing for the social media images.
 * @default {"x":"Graphics.boxWidth - 5","y":"Graphics.boxHeight - 5","spacing":"15","onClickSound":"{\"name\":\"Decision3\",\"volume\":\"65\",\"pitch\":\"100\",\"pan\":\"0.5\"}"}
 *
 * @param onTouchFilter
 * @text On Touch Filter
 * @type struct<ButtonFilter>
 * @desc The filter applied to Image when touched. [See Help] Does not work well with black images!
 * @default {"type":"hue","value1":"55","value2":"false"}
 *
 * @param onTouchSound
 * @text On Touch Sound
 * @type struct<SoundEffect>
 * @desc The sound played when button is touched
 * @default {"name":"Cursor3","volume":"75","pitch":"150","pan":"0.5"}
 *
 * @param buttonsList
 * @text Buttons List
 * @type struct<ButtonPreset>[]
 * @desc All the buttons to be drawn on screen.
 * @default ["{\"url\":\"http://twitter.com/\",\"pos\":\"1\",\"image\":\"pictures/twitter\"}","{\"url\":\"http://facebook.com/\",\"pos\":\"2\",\"image\":\"pictures/facebook\"}","{\"url\":\"http://youtube.com/\",\"pos\":\"3\",\"image\":\"pictures/youtube\"}","{\"url\":\"http:///plus.google.com/.com/\",\"pos\":\"5\",\"image\":\"pictures/google-plus\"}"]
 *
 * @help
--------------------------------------------------------------------------------
 # TERMS OF USE

 MIT License -

 * Free for use in any RPG Maker MV game project, commerical or otherwise

 * Credit may go to FeniXEngine Contributors or FeniXEngine

 * Though not required, you may provide a link back to the original source code,
   repository or website.

 -------------------------------------------------------------------------------
 # INFORMATION

  It adds social media images to your title screen, allows for special effects
  like applying a filter and playing a sound effect when touching one.
  Upon click it will take the user to an external URL using the devices preferred
  application like the browser or twitter app.

--------------------------------------------------------------------------------
 # Instructions

 * Install the plugin in your projects js/plugins directory

 * Save your Social Media images in a sub directory within your img/ directory

 * Adjust the parameters to match your social media profiles.

 # Color Matrix Filter

  Here is some information on the filter being applied, it's called a color matrix
  and in layman's terms, it adjusts the images rgba values which can create some
  very cool looking effects. While all this may be a bit advanced to understand
  there is nothing stopping you from testing them all out to see which one you
  prefer, don't worry you won't break anything 😉.

  -----------------------------------------------
   Filters

  Type              Value1            Value2
  -----------------------------------------------
  hue              rotation            multiply
  greyscale        scale               multiply
  night            intensity           multiply
  brightness       b(0-1)              multiply
  predator         amount              multiply
  saturate         amount              multiply
  contrast         amount              multiply

  Value1 - The amount/intensity of the filter being applied.
  Value2 - Which is always multiply is a true or false value. (If true the color
         matrix is multiplied.)
*/

/* eslint-disable spaced-comment */

/*~struct~ButtonPreset:
  @param url
  @text Website URL
  @default http://
  @desc The x position of the button container.

  @param image
  @text Image
  @type file
  @dir img/
  @desc The image to use for this button.
*/
/*~struct~Settings:
  @param x
  @text x Position
  @default Graphics.boxWidth
  @desc The x position of the button container.

  @param y
  @text Y Position
  @default Graphics.boxHeight
  @desc The y position of the buttons container.

  @param spacing
  @text Spacing
  @default 15
  @type number
  @desc The amount of space between each button

  @param onClickSound
  @text On Click Sound
  @default {"name":"Decision3","volume":"65","pitch":"1","pan":"0.5"}
  @type struct<SoundEffect>
  @desc The sound effect to play when clicking a button
*/

/*~struct~ButtonFilter:
  @param type
  @text Filter Type
  @type select
  @option hue
  @option greyscale
  @option saturate
  @option night
  @option brightness
  @option predator
  @option contrast
  @default greyscale
  @desc The type of filter to apply to the button on touch

  @param value1
  @text Intensity
  @type number
  @default 1
  @desc The amount/intensity of the filter being applied.

  @param value2
  @text Value 2
  @default false
  @type bool
  @desc If true the matrix is multiplied.
*/
/*~struct~SoundEffect:
  @param name
  @text Name
  @type file
  @dir audio/se/
  @desc The name of the sound effect

  @param volume
  @text Volume
  @type number
  @min 1
  @max 100
  @Default 50

  @param pitch
  @text Pitch
  @type number
  @min 1
  @max 200
  @Default 100

  @param pan
  @text Pan
  @type number
  @default 0.5
  @decimals 0.1
  @min 0
  @max 1
*/

(function () {
'use strict';

/**
 * Recursive method that will deep parse a JSON type string
 *
 * In MV parameters can be deeply nested when using a lot of them. Use this function
 * to deep parse parameters into a ready to use object.
 * By default parameters are an object filled with string, ensure you stringify it first.
 *
 * @function parseParameters
 * @since 1.0.0
 * @memberof module:Utils
 *
 * @param {object} string - The string you want to deep parse
 *
 * @returns An object
 * @example
 *
 * const myParams = { p1: '22', p2: 'true' }
 * parseParameters((JSON.stringify(myParams)) // => { p1: 22, p2: true }
 *
 * const myParams = { p1: '{a: 1'1, c: '2'}', p2: '[{}, {}, {}]' }
 * parseParameters(JSON.stringify(myParams)) // => { p1: {a: 1, c: 2}, p2: [{}, {}, {}] }
 *
 */
function parseParameters (string) {
  try {
    return JSON.parse(string, (key, value) => {
      try {
        return parseParameters(value)
      } catch (e) {
        return value
      }
    })
  } catch (e) {
    return string
  }
}

/**
 * The Core file is responsible for fetching and parsing of all plugin
 * parameters, note-tags and other important information. The core should
 * contain all global variables and base configuration related to the plugin.
 *
 * @file Core
 *
 * @author       FeniXEngine Contributors
 * @copyright    2018 FeniXEngine
 */

const rawParameters = $plugins.filter(
  plugin => plugin.description.contains('<X_SocialMediaButtons>'))[0].parameters;

const _Params = parseParameters(JSON.stringify(rawParameters));

class SocialMediaButton extends Sprite_Button {
  /**
   * A button for social media icons/images
   *
   * @param {*} src - The image source for the button
   * @param {*} x - The x position of the button
   * @param {*} y - The y position of the button
   */
  constructor (data, x, y) {
    super();
    super.initialize();
    this._data = data;
    this.bitmap = data.src;
    this.setClickHandler(this.openLink);
    this._colorMatrix = new PIXI.filters.ColorMatrixFilter();
    this.filters = [this._colorMatrix];
    this._isFiltered = false;
    this._mousePos = {};
  }

  updateMousePosition (event) {
    this._mousePos.x = event.pageX;
    this._mousePos.y = event.pageY;
  }

  update () {
    super.update();
  }

  updateFrame (event) {
    const filter = _Params.onTouchFilter;
    if (this.isButtonTouching() && !this._isFiltered) {
      this._colorMatrix[filter.type](filter.value1, filter.value2);
      this._isFiltered = true;
      AudioManager.playSe(_Params.onTouchSound);
    } else if (this._isFiltered && !this.isButtonTouching()) {
      this._colorMatrix.reset();
      this._isFiltered = false;
    }
  }

  isButtonTouching () {
    if (!this._mousePos.x || !this._mousePos.y) { return false }
    const x = this.canvasToLocalX(Graphics.pageToCanvasX(this._mousePos.x));
    const y = this.canvasToLocalY(Graphics.pageToCanvasY(this._mousePos.y));
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }

  setPosition (x, y) {
    this.x = x;
    this.y = y;
  }

  openLink () {
    if (Utils.isNwjs()) {
      try {
        AudioManager.playSe(_Params.settings.onClickSound);
        window.nw.Shell.openExternal(this._data.url);
      } catch (error) {
        console.log(error);
      }
    } else if (!Utils.isNwjs()) {
      AudioManager.playSe(_Params.settings.onClickSound);
	  android.urlopen(this._data.url);
    }
  }
}

class SocialMediaContainer extends Sprite {
  /**
   * A container to hold all social media buttons
   *
   * @param {*} x - The x position of the container
   * @param {*} y - The y position of the container
   */
  constructor (x, y) {
    super();
    this._listener = this.processButtonTouching.bind(this);
    document.addEventListener('mousemove', this._listener);
    this.createSocialButtons();
  }

  createSocialButtons () {
    let x = 0;
    _Params.buttonsList.forEach(social => {
      if (!social) { return }
      const path = social.image.split('/');
      const data = {
        src: ImageManager.loadBitmap(`img/${path[0]}/`, path[1]),
        url: social.url
      };
      const button = new SocialMediaButton(data, x, 0);
      button.bitmap.addLoadListener(() => {
        button.setPosition(x, 0);
        this.addChild(button);
        x += _Params.settings.spacing + button.width;
        this.resize();
      });
    });
  }

  processButtonTouching (event) {
    this.children.forEach(button => button.updateMousePosition(event));
  }

  setPosition () {
    /* eslint-disable no-eval */
    const x2 = eval(_Params.settings.x);
    const y2 = eval(_Params.settings.y);
    this.x = x2;
    this.y = y2 - this.getBounds().height;
    if (this.x + this.getBounds().width > Graphics.boxWidth) {
      this.x = x2 - this.getBounds().width;
    }
  }

  resize () {
    this.calculateBounds();
    this.setPosition();
  }

  removeListener () {
    document.removeEventListener('mousemove', this._listener);
  }
}

const Alias_SceneTitle_create = Scene_Title.prototype.create;
Scene_Title.prototype.create = function () {
  Alias_SceneTitle_create.call(this);
  this.createSocialContainer();
};

Scene_Title.prototype.createSocialContainer = function () {
  this._socialMediaContainer = new SocialMediaContainer();
  this.addChild(this._socialMediaContainer);
};

const Alias_SceneTitle_terminate = Scene_Title.prototype.terminate;
Scene_Title.prototype.terminate = function () {
  Alias_SceneTitle_terminate.call(this);
  this._socialMediaContainer.removeListener();
};

}());
