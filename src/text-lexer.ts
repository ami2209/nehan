import {
  Character,
  BufferedLexer,
  Config,
  Char,
  Word,
  RefChar,
  SpaceChar,
  HalfChar,
  SmpUniChar,
  MixChar,
  DualChar,
  DualCharTable,
  Tcy,
} from "./public-api";

export class TextLexer extends BufferedLexer<Character>{
  public uprightTokens(){
    this.tokens = this.tokens.reduce((acm, token) => {
      if(token instanceof Word){
	return acm.concat(token.splitTcys());
      }
      return acm.concat(token);
    }, [] as Character []);
  }

  private getShy(): string | null {
    if(this.buff.indexOf(RefChar.softHyphen) !== 0){
      return null;
    }
    this.stepBuff(RefChar.softHyphen.length);
    return RefChar.softHyphen;
  }

  private getWordOrTcy(): Word | Tcy | null {
    let word = "";
    while(this.hasNextBuff()){
      let word_match = Config.rexWord.exec(this.buff);
      if(word_match){
	word += word_match[0];
	this.stepBuff(word_match[0].length);
	continue;
      }
      let shy = this.getShy();
      if(shy){
	word += shy;
	continue;
      }
      break;
    }
    if(word === ""){
      return null;
    }
    if(Config.isTcyWord(word)){
      return new Tcy(word);
    }
    return new Word(word);
  }

  private getTcy(): Tcy | null {
    let tcy_match_uni = Config.rexTcyUni.exec(this.buff);
    if(tcy_match_uni){
      let tcy = tcy_match_uni[0];
      this.stepBuff(tcy.length);
      return new Tcy(tcy);
    }
    let tcy_match = Config.rexTcy.exec(this.buff);
    if(!tcy_match){
      return null;
    }
    let tcy = tcy_match[0];
    this.stepBuff(tcy.length);
    return new Tcy(tcy);
  }

  private getSpaceChar(): SpaceChar | null {
    let space_char_ref_match = Config.rexSpaceCharRef.exec(this.buff);
    if(space_char_ref_match){
      let space_char_ref = space_char_ref_match[0];
      this.stepBuff(space_char_ref.length);
      let space_char = SpaceChar.charRefToStr(space_char_ref);
      return new SpaceChar(space_char);
    }
    let space_char_match = Config.rexSpace.exec(this.buff);
    if(space_char_match){
      let space_char = space_char_match[0];
      this.stepBuff(space_char.length);
      return new SpaceChar(space_char);
    }
    return null;
  }

  private getRefChar(): RefChar | null {
    let ref_char_match = Config.rexRefChar.exec(this.buff);
    if(!ref_char_match){
      return null;
    }
    let ref_char = ref_char_match[0];
    this.stepBuff(ref_char.length);
    return new RefChar(ref_char);
  }

  private getHalfChar(): HalfChar | null {
    let half_char_match = Config.rexHalfChar.exec(this.buff);
    if(!half_char_match){
      return null;
    }
    let half_char = half_char_match[0];
    this.stepBuff(half_char.length);
    return new HalfChar(half_char);
  }

  // unicode character defined in Supplementary Multilingual Plane(SMP).
  private getSmpUniChar(): SmpUniChar | null {
    let lead = this.buff.charCodeAt(0);
    if(0xd800 <= lead && lead <= 0xdbff){
      let trail = this.buff.charCodeAt(1);
      if(trail && 0xdc00 <= trail && trail <= 0xdfff){
	let bytes = this.buff.substring(0, 2);
	this.stepBuff(2);
	return new SmpUniChar(bytes);
      }
    }
    return null;
  }

  private getMixChar(c1: string): MixChar | null {
    let char = c1;
    let voiced_mark_match = Config.rexVoicedMark.exec(this.buff);
    if(!voiced_mark_match){
      return null;
    }
    char += voiced_mark_match[0];
    this.stepBuff(voiced_mark_match[0].length);
    return new MixChar(char);
  }

  private getDualChar(c1: string): DualChar | null {
    let info = DualCharTable.load(c1);
    if(!info){
      return null;
    }
    return new DualChar(c1, info);
  }

  protected createToken(): Character {
    // try to parse dual-char to prevent treating half-size dual-char(like U+0029) as word.
    let p1 = this.peekChar();
    let half_dual_char = this.getDualChar(p1);
    if(half_dual_char !== null){
      this.stepBuff(1);
      return half_dual_char;
    }
    let tcy = this.getTcy();
    if(tcy !== null){
      return tcy;
    }
    let word_or_tcy = this.getWordOrTcy();
    if(word_or_tcy !== null){
      return word_or_tcy;
    }
    let space_char = this.getSpaceChar();
    if(space_char !== null){
      return space_char;
    }
    let ref_char = this.getRefChar();
    if(ref_char !== null){
      return ref_char;
    }
    let half_char = this.getHalfChar();
    if(half_char !== null){
      return half_char;
    }
    let smp_uni_char = this.getSmpUniChar();
    if(smp_uni_char !== null){
      return smp_uni_char;
    }
    let c1 = this.getChar();
    let mix_char = this.getMixChar(c1);
    if(mix_char !== null){
      return mix_char;
    }
    let dual_char = this.getDualChar(c1);
    if(dual_char !== null){
      return dual_char;
    }
    return new Char(c1);
  }
}
