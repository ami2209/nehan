import {
  ICharacter,
  BoxEnv,
  LogicalSize,
  DualCharInfo,
  ParenType,
  KinsokuPos
} from "./public-api";

// characters that depend on writing-mode(vertical or horizontal).
export class DualChar implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public hasEmphasis: boolean;
  public info: DualCharInfo;
  public kerning: boolean;
  public spacing: number;
  public charCount: number;

  public constructor(str: string, info: DualCharInfo){
    this.text = str;
    this.size = new LogicalSize({measure:0, extent:0});
    this.hasEmphasis = false;
    this.info = info;
    this.kerning = false;
    this.spacing = 0;
    this.charCount = 1;
  }

  public isOpenParen(): boolean {
    return this.info.parenType === ParenType.OPEN;
  }

  public isCloseParen(): boolean {
    return this.info.parenType === ParenType.CLOSE;
  }

  public isTailNg(): boolean {
    return this.info.kinsokuPos === KinsokuPos.TAIL;
  }

  public isHeadNg(): boolean {
    return this.info.kinsokuPos === KinsokuPos.HEAD;
  }

  public isKernEnable(): boolean {
    return this.info.kernEnable;
  }

  public isHangEnable(): boolean {
    return this.info.hangEnable;
  }

  public setMetrics(env: BoxEnv){
    this.size.measure = env.fontSize;
    this.size.extent = env.fontSize;
    if(this.kerning && this.isKernEnable()){
      this.size.measure = Math.floor(env.fontSize / 2);
    }
  }

  public setKerning(env:BoxEnv, enable: boolean){
    if(this.info.kernEnable){
      this.kerning = enable;
      return;
    }
    console.warn("kerning is not allowed for this character:", this);
  }

  public toString(): string {
    return this.text;
  }
}
