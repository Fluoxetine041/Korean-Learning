import { defineEventHandler } from 'h3'

// Mock articles data
const articles = [
  {
    id: '1',
    title: 'The Benefits of Learning a Second Language',
    excerpt: 'Discover how learning a new language like English can improve your cognitive abilities and open new opportunities in your personal and professional life.',
    category: 'education',
    level: 'beginner',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    date: 'Jan 15, 2023',
    author: {
      name: 'Emily Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    paragraphs: [
      "Learning a second language offers numerous cognitive benefits. Research has shown that bilingual individuals often have better problem-solving skills, enhanced memory, and improved concentration compared to monolingual counterparts.",
      "When you learn a new language, your brain creates new neural pathways. This mental exercise strengthens your brain's natural ability to focus, handle multiple tasks, and analyze information. Many studies suggest that bilingualism can even delay the onset of dementia and Alzheimer's disease by several years.",
      "Beyond cognitive advantages, language learning opens doors to new cultures and perspectives. It allows you to connect with people from different backgrounds and understand their worldview in a more authentic way. This cultural awareness is increasingly valuable in our globalized society."
    ]
  },
  {
    id: '2',
    title: 'Understanding Climate Change: The Basics',
    excerpt: 'Learn about the fundamental concepts of climate change, its causes, and how it affects our planet in this introductory article.',
    category: 'science',
    level: 'intermediate',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    date: 'Feb 22, 2023',
    author: {
      name: 'David Wilson',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    paragraphs: [
      "Climate change refers to significant changes in global temperature, precipitation, wind patterns, and other measures of climate that occur over several decades or longer. While the Earth's climate has changed throughout history, the current trend is concerning because it is primarily caused by human activities and is occurring at an unprecedented rate.",
      "The main driver of current climate change is the greenhouse effect. Gases like carbon dioxide, methane, and nitrous oxide trap heat in the Earth's atmosphere, much like a greenhouse. Human activities, particularly the burning of fossil fuels for energy, have significantly increased the concentration of these gases in the atmosphere.",
      "The consequences of climate change are far-reaching and include rising sea levels, more frequent and severe weather events, shifts in plant and animal ranges, and more acidic oceans. These changes affect ecosystems, agriculture, human health, and infrastructure."
    ]
  },
  {
    id: '3',
    title: 'The Digital Revolution: How Technology Changed Everything',
    excerpt: 'Explore the profound impact of digital technology on society, business, and our daily lives over the last few decades.',
    category: 'technology',
    level: 'advanced',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    date: 'Mar 10, 2023',
    author: {
      name: 'Sophia Chen',
      avatar: 'https://randomuser.me/api/portraits/women/56.jpg'
    },
    paragraphs: [
      "The Digital Revolution, also known as the Third Industrial Revolution, marks the shift from mechanical and analog electronic technology to digital electronics which began in the latter half of the 20th century. This transition has fundamentally altered how we live, work, and communicate.",
      "At the core of this revolution is the widespread adoption of digital computers and digital record-keeping that continues to the present day. Innovations like the Internet, mobile phones, and social media have accelerated this transformation, creating a highly interconnected global society.",
      "The economic impact has been profound, with traditional industries disrupted and new sectors emerging. Companies that failed to adapt to digital trends often became obsolete, while tech-focused enterprises have achieved unprecedented scale and influence."
    ]
  },
  {
    id: '4',
    title: 'Introduction to Healthy Eating Habits',
    excerpt: 'Discover the basics of nutrition and how to develop healthy eating habits that can improve your overall wellbeing.',
    category: 'health',
    level: 'beginner',
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    date: 'Apr 5, 2023',
    author: {
      name: 'Michael Brown',
      avatar: 'https://randomuser.me/api/portraits/men/62.jpg'
    },
    paragraphs: [
      "Healthy eating is about consuming a variety of foods that give you the nutrients you need to maintain your health, feel good, and have energy. These nutrients include protein, carbohydrates, fat, water, vitamins, and minerals. The key is finding a balance that's right for you.",
      "A balanced diet typically includes plenty of fruits and vegetables, whole grains, lean proteins, and healthy fats. It limits processed foods, added sugars, and excessive salt. Portion control is also important, as even healthy foods can contribute to weight gain if consumed in large amounts.",
      "Starting small and making gradual changes to your eating habits can lead to sustainable improvements in your diet. Try adding one extra serving of vegetables each day, swapping refined grains for whole grains, or replacing sugary drinks with water."
    ]
  },
  {
    id: '5',
    title: 'The History of Cinema: From Silent Films to Digital',
    excerpt: 'Take a journey through the fascinating evolution of cinema from its early silent days to modern digital masterpieces.',
    category: 'culture',
    level: 'intermediate',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    date: 'May 18, 2023',
    author: {
      name: 'Jessica Martinez',
      avatar: 'https://randomuser.me/api/portraits/women/23.jpg'
    },
    paragraphs: [
      "Cinema began in the late 19th century with the invention of motion picture cameras and projectors. Early films were silent, short, and often documentary in nature. The Lumière brothers' 'Workers Leaving the Lumière Factory' (1895) is considered one of the first true films ever made.",
      "The 1920s saw the rise of narrative storytelling in film, with directors like Charlie Chaplin and Buster Keaton creating memorable characters and complex plots. The introduction of synchronized sound in 'The Jazz Singer' (1927) revolutionized the industry, leading to the decline of silent films.",
      "Throughout the 20th century, cinema evolved through technological innovations like color film, widescreen formats, and special effects. The transition from analog to digital filmmaking in the late 1990s and early 2000s represented another profound shift, democratizing the production process and enabling new creative possibilities."
    ]
  },
  {
    id: '6',
    title: 'Understanding Global Economics in the Modern Era',
    excerpt: 'A comprehensive look at how global economic systems function and interact in today\'s interconnected world.',
    category: 'business',
    level: 'advanced',
    image: 'https://images.unsplash.com/photo-1611324586964-4ded20256688?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    date: 'Jun 27, 2023',
    author: {
      name: 'Robert Taylor',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg'
    },
    paragraphs: [
      "The global economy is a complex network of interconnected markets, trade relationships, and financial systems. International trade, investment flows, and monetary policies create dependencies between nations that can lead to both opportunities and vulnerabilities.",
      "Several key institutions govern the global economic order, including the World Trade Organization (WTO), International Monetary Fund (IMF), and World Bank. These organizations establish rules for international commerce, provide financial assistance to developing countries, and help stabilize the global financial system.",
      "Economic globalization has intensified in recent decades due to advances in transportation, communication, and information technology. This integration has contributed to poverty reduction and economic growth in many regions but has also raised concerns about inequality, labor standards, and environmental sustainability."
    ]
  }
]

export default defineEventHandler((event) => {
  // Return all articles
  return articles
}) 