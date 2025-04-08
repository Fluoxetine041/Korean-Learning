import { defineEventHandler, getRouterParam } from 'h3'
import { getMany } from '~/server/database'
import { createError } from 'h3'
import prisma from '~/server/database/prisma'

// Define types for our dictionary
interface Definition {
  definition: string;
  example: string;
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
}

interface WordEntry {
  word: string;
  meanings: Meaning[];
}

// Mock dictionary data with proper typing
const dictionary: Record<string, WordEntry> = {
  'language': {
    word: 'language',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The method of human communication, either spoken or written, consisting of the use of words in a structured and conventional way.',
            example: 'English is a widely spoken language.'
          },
          {
            definition: 'The system of communication used by a particular community or country.',
            example: 'She speaks several languages.'
          }
        ],
        synonyms: ['speech', 'tongue', 'dialect', 'idiom']
      }
    ]
  },
  'learning': {
    word: 'learning',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The acquisition of knowledge or skills through experience, study, or being taught.',
            example: 'These courses will promote effective learning.'
          }
        ],
        synonyms: ['education', 'study', 'schooling', 'training']
      },
      {
        partOfSpeech: 'verb',
        definitions: [
          {
            definition: 'Present participle of learn.',
            example: 'He is learning English.'
          }
        ],
        synonyms: []
      }
    ]
  },
  'cognitive': {
    word: 'cognitive',
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Relating to cognition, which is the mental action or process of acquiring knowledge and understanding through thought, experience, and the senses.',
            example: 'Cognitive development occurs throughout childhood.'
          }
        ],
        synonyms: ['mental', 'intellectual', 'cerebral', 'psychological']
      }
    ]
  },
  'english': {
    word: 'English',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The language of England, widely used in many varieties throughout the world.',
            example: 'She teaches English as a foreign language.'
          },
          {
            definition: 'The people of England.',
            example: 'The English are known for their love of tea.'
          }
        ],
        synonyms: []
      },
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Relating to England, its people, or the English language.',
            example: 'English literature'
          }
        ],
        synonyms: ['British']
      }
    ]
  },
  'climate': {
    word: 'climate',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The weather conditions prevailing in an area in general or over a long period.',
            example: 'Our climate is changing due to global warming.'
          },
          {
            definition: 'The prevailing trend of public opinion or of another aspect of life.',
            example: 'The current economic climate'
          }
        ],
        synonyms: ['weather conditions', 'weather pattern', 'atmosphere']
      }
    ]
  },
  'digital': {
    word: 'digital',
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Relating to, using, or storing data or information in the form of digital signals.',
            example: 'Digital TV'
          },
          {
            definition: 'Involving or relating to the use of computer technology.',
            example: 'The digital revolution'
          }
        ],
        synonyms: ['electronic', 'computerized', 'computer-based']
      }
    ]
  }
}

export default defineEventHandler(async (event) => {
  try {
    const word = getRouterParam(event, 'word')?.toLowerCase();
    
    if (!word) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Word parameter is required',
      });
    }

    // Fetch word with meanings, definitions and synonyms using Prisma
    const wordRecord = await prisma.word.findUnique({
      where: { 
        word 
      },
      include: {
        meanings: {
          include: {
            definitions: true,
            synonyms: true
          }
        }
      }
    });

    if (!wordRecord) {
      // If we don't have the word in our database, you could implement a fallback 
      // to an external dictionary API here
      
      throw createError({
        statusCode: 404,
        statusMessage: 'Word not found',
      });
    }

    // Format the result to match the expected structure
    return {
      word: wordRecord.word,
      meanings: wordRecord.meanings.map(meaning => ({
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions.map(def => ({
          definition: def.definition,
          example: def.example
        })),
        synonyms: meaning.synonyms.map(syn => syn.synonym)
      }))
    };
    
  } catch (error) {
    console.error('Error fetching word definition:', error);
    const statusCode = error.statusCode || 500;
    const statusMessage = error.statusMessage || 'Failed to fetch definition';
    
    throw createError({
      statusCode,
      statusMessage,
    });
  }
}); 