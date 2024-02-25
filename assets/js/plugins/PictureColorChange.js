/*---------------------------------------------------------------------------*
 * 2018/08/16 kido
 * https://kido0617.github.io/
 * Ver.1.0
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc ピクチャの色相や色合いを変えるプラグイン
 * @author kido
 * @help
 * 詳細
 * 色相を変える
 * https://kido0617.github.io/rpgmaker/2018-08-16-rotate-hue/
 * 
 * 色合いを変える
 * https://kido0617.github.io/rpgmaker/2018-08-20-tint/
 * 
 * プラグインコマンド
 *   RotateHue arg0 arg1
 *     arg0はピクチャ番号、arg1はデフォルトからの色相の回転角度。単位は度
 *       例: RotateHue 1 180 
 *     引数には変数の制御文字が使えます。
 *       例: RotateHue \V[3] \V[4]
 * 
 *   SetTint arg0 arg1
 *     arg0はピクチャ番号、arg1は色の値。下記2つは同じ
 *       例: SetTint 1 0xFF0000
 *       例: SetTint 1 16711680
 *     引数には変数の制御文字が使えます。
 *       例: SetTint \V[3] \V[4]
 * 　
 *   RGBそれぞれに値を指定する場合は以下です
 *   SetTint arg0 arg1 arg2 arg3
 *     arg0はピクチャ番号、arg1、arg2、arg3にはrgbの値を指定
 *       例: SetTint 1 255 0 0
 *     引数には変数の制御文字が使えます。
 *       例: SetTint \V[3] \V[4] \V[5] \V[6]
*/

(function(){
  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'RotateHue') {
      if(args.length < 2){
        console.error('ピクチャ番号と色相の値を入れてください');
        return;
      }
      var picId = convertEscapeCharacter(args[0]);
      var pic = $gameScreen.picture(parseInt(picId));
      if(!pic){
        console.error('存在しないピクチャ番号です');
        return;
      }
      var hue = parseInt(convertEscapeCharacter(args[1]));
      if(Number.isNaN(hue)){
        console.error('色相の値が正しくありません');
        return;
      }
      pic.rotateHue(hue);
    }else  if (command === 'SetTint') {
      if(args.length != 2 && args.length != 4){
        console.error('ピクチャ番号と色合いの値を入れてください');
        return;
      }
      var picId = convertEscapeCharacter(args[0]);
      var pic = $gameScreen.picture(parseInt(picId));
      if(!pic){
        console.error('存在しないピクチャ番号です');
        return;
      }
      var tint;
      if(args.length == 2){
        tint = parseInt(convertEscapeCharacter(args[1]));
      }else{
        var r = parseInt(convertEscapeCharacter(args[1]));
        var g = parseInt(convertEscapeCharacter(args[2]));
        var b = parseInt(convertEscapeCharacter(args[3]));
        if(Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)){
          console.error('色合いの値が正しくありません');
          return;  
        }
        tint =  r << 16 | g << 8 | b;
      }
      if(Number.isNaN(tint)){
        console.error('色合いの値が正しくありません');
        return;
      }
      pic.setTint(tint);
    }
  };

  function convertEscapeCharacter(text){
    text = text.replace(/\\/g, '\x1b');
    text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
      return $gameVariables.value(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
      return $gameVariables.value(parseInt(arguments[1]));
    }.bind(this));
    return text;
  }

  Game_Picture.prototype.rotateHue = function(hue) {
    this.hue = hue;
  };
  Game_Picture.prototype.resetHue = function() {
    this.hue = 0;
  };
  Game_Picture.prototype.setTint = function(tint) {
    this.tint = tint;
  };
  Game_Picture.prototype.resetTint = function() {
    this.tint = 0xFFFFFF;
  };

  var show = Game_Picture.prototype.show;
  Game_Picture.prototype.show = function(name, origin, x, y, scaleX, scaleY, opacity, blendMode) {
    show.call(this, name, origin, x, y, scaleX, scaleY, opacity, blendMode);
    this.resetHue();
    this.resetTint();
  };

  var updateBitmap = Sprite_Picture.prototype.updateBitmap;
  Sprite_Picture.prototype.updateBitmap = function() {
    var picture = this.picture();
    var isPictureChanged = picture && picture.name() !== this._pictureName;

    updateBitmap.call(this); 
    
    if(!picture){
      this.__hue = 0;
      this.__tint = 0xFFFFFF;
      return;
    }

    var isHueChanged = picture.hue != this.__hue;
    var isTintChanged = picture.tint != this.__tint;

    if(isHueChanged || isTintChanged || isPictureChanged){
      this.__hue = picture.hue;
      this.__tint = picture.tint;
      this.bitmap.addLoadListener(function(){
        //bitmapのキャッシュがあるのでそのまま色を変えてしまうとキャッシュしているbitmapを変えてしまうのでコピーする
        //bltしてコピーするのでちらつき防止の効果もある
        if(isPictureChanged){
          //未加工のbitmapを保存しておく
          this.defaultBitmap = this.bitmap;
        }
        var bitmap = Object.create(Bitmap.prototype);
        bitmap.initialize(this.defaultBitmap.width, this.defaultBitmap.height);
        bitmap.smooth = true;
        bitmap.blt(this.defaultBitmap, 0, 0, this.defaultBitmap.width, this.defaultBitmap.height, 0, 0);
        this.bitmap = bitmap;
        if(isTintChanged || this.__tint != 0xFFFFFF) {
          this.bitmap.setTint(this.__tint);
        }
        if(isHueChanged || this.__hue != 0) {
          this.bitmap.rotateHue(this.__hue);
        }
      }.bind(this));
    }
  };

  Bitmap.prototype.setTint = function(color){
    function hex2rgb(hex, out)
    {
        out = out || [];
    
        out[0] = ((hex >> 16) & 0xFF) / 255;
        out[1] = ((hex >> 8) & 0xFF) / 255;
        out[2] = (hex & 0xFF) / 255;
    
        return out;
    }
    const context = this._context;

    const rgbValues = hex2rgb(color);
    const r = rgbValues[0];
    const g = rgbValues[1];
    const b = rgbValues[2];

    const pixelData = context.getImageData(0, 0, this.width, this.height);
    const pixels = pixelData.data;

    for (var i = 0; i < pixels.length; i += 4){
      pixels[i + 0] *= r;
      pixels[i + 1] *= g;
      pixels[i + 2] *= b;
    }
    context.putImageData(pixelData, 0, 0);
    this._setDirty();
  };

})();