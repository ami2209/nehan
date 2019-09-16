import {
  ICharacter,
  LogicalSize,
  BoxEnv,
} from "./public-api";

// ligature
export class MixChar implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public hasEmphasis: boolean;
  public kerning: boolean;
  public spacing: number;
  public charCount: number;

  public constructor(str: string){
    this.text = str;
    this.size = new LogicalSize({measure:0, extent:0});
    this.hasEmphasis = false;
    this.kerning = false;
    this.spacing = 0;
    this.charCount = 1;
  }

  public setMetrics(env: BoxEnv){
    if(env.isTextVertical()){
      this.size.measure = env.fontSize;
    } else {
      this.size.measure = Math.floor(env.fontSize * 1.25);
    }
    this.size.extent = env.fontSize;
    
  }

  public toString(): string {
    return this.text;
  }
}
