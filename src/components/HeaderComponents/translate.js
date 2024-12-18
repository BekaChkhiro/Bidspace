import axios from 'axios';

export const translateText = async (text, targetLanguage) => {
  console.log(`Translating text: ${text} to ${targetLanguage}`);
  try {
    const response = await axios.post('https://libretranslate.de/translate', {
      q: text,
      source: 'en', // Source language
      target: targetLanguage,
      format: 'text'
    });
    console.log('Translation response:', response.data);
    return response.data.translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Return original text if translation fails
  }
};
