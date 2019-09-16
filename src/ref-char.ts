import {
  ICharacter,
  LogicalSize,
  BoxEnv,
} from "./public-api";

export class RefChar implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public hasEmphasis: boolean;
  public kerning: boolean;
  public spacing: number;
  public charCount: number;

  static softHyphen: string = "&shy;";

  public constructor(str: string){
    this.text = str;
    this.size = new LogicalSize({measure:0, extent:0});
    this.hasEmphasis = false;
    this.kerning = false;
    this.spacing = 0;
    this.charCount = 1;
  }

  public setMetrics(env: BoxEnv){
    this.size.measure = env.fontSize;
    this.size.extent = env.fontSize;
  }

  public toString(): string {
    return this.text;
  }
}
