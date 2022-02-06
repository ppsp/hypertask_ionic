// Taken from https://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-a-range-within-the-supp
// Credits to Remi
export default class NumberUtils {
  public static Range(start: number, stop: number, step: number): number[] {
    const a = [start];
    let b = start;
    if (start <= stop) {
      while (b < stop) {
        a.push(b += step || 1);
      }
    } else {
      while (b > stop) {
        a.push(b += step || 1);
      }
    }

    return a;
  }

  public static getRandomId(): string {
    let result = Math.random().toString(36);
    if (result.length < 20) {
      result += Math.random().toString(36);
    }
    return result;
  }

  public static checkIfDuplicateExists(w) {
    const duplicateExists = new Set(w).size !== w.length;
    /*if (duplicateExists === true) {
      console.log('DUPLICATE EXISTS', duplicateExists, w);
    } else {
      console.log('DUPLICATE DOES NOT EXIST', duplicateExists, w);
    }*/

    return duplicateExists;
  }
}
