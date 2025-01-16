export default function getFirstLetters(sentence: string): string {
  const words = sentence.split(' ');

  if (words.length >= 2) {
    const firstLetter = words[0][0];
    const secondLetter = words[1][0];
    return `${firstLetter}${secondLetter}`;
  } else if (words.length === 1) {
    // If there's only one word, return the first letter of that word
    return words[0][0];
  } else {
    // Return an empty string if the sentence is empty
    return '';
  }
}
