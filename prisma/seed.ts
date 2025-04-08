import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting seed process...');

  // Create authors
  console.log('Creating authors...');
  const emilyId = uuidv4();
  const davidId = uuidv4();
  
  const authors = await Promise.all([
    prisma.author.upsert({
      where: { id: emilyId },
      update: {},
      create: {
        id: emilyId,
        name: 'Emily Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        bio: 'Emily is an English language specialist with over 10 years of teaching experience.'
      },
    }),
    prisma.author.upsert({
      where: { id: davidId },
      update: {},
      create: {
        id: davidId,
        name: 'David Wilson',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        bio: 'David is a science writer and educator with a passion for making complex topics accessible.'
      },
    }),
  ]);

  console.log(`Created ${authors.length} authors`);

  // Create articles
  console.log('Creating articles...');
  const article1Id = uuidv4();
  const article2Id = uuidv4();
  
  const articles = await Promise.all([
    prisma.article.upsert({
      where: { id: article1Id },
      update: {},
      create: {
        id: article1Id,
        title: 'The Benefits of Learning a Second Language',
        excerpt: 'Discover how learning a new language like English can improve your cognitive abilities and open new opportunities in your personal and professional life.',
        content: 'Full content of the article about language learning benefits.',
        paragraphs: [
          "Learning a second language offers numerous cognitive benefits. Research has shown that bilingual individuals often have better problem-solving skills, enhanced memory, and improved concentration compared to monolingual counterparts.",
          "When you learn a new language, your brain creates new neural pathways. This mental exercise strengthens your brain's natural ability to focus, handle multiple tasks, and analyze information. Many studies suggest that bilingualism can even delay the onset of dementia and Alzheimer's disease by several years.",
          "Beyond cognitive advantages, language learning opens doors to new cultures and perspectives. It allows you to connect with people from different backgrounds and understand their worldview in a more authentic way. This cultural awareness is increasingly valuable in our globalized society.",
          "From a professional standpoint, knowing a second language can significantly boost your career prospects. Many employers seek candidates with language skills for roles in international business, diplomacy, translation, education, and customer service. Bilingual employees often earn higher salaries than their monolingual peers.",
          "Learning English specifically provides access to a global language used in business, science, technology, and entertainment worldwide. It's the primary language of the internet and international communication, making it particularly valuable for personal and professional growth.",
          "The process of language acquisition also teaches patience and perseverance. It's a long-term commitment that requires consistent practice and resilience through challenges. These skills transfer to other areas of life and work, promoting a growth mindset.",
          "Interestingly, studies have found that people sometimes express different personality traits when speaking different languages. This phenomenon, known as the 'language personality shift,' suggests that languages can influence how we perceive ourselves and present to others.",
          "Technology has made language learning more accessible than ever before. With apps, online courses, language exchange platforms, and media streaming services, you can immerse yourself in authentic content and connect with native speakers from anywhere in the world.",
          "While learning a new language requires effort, the cognitive, cultural, and professional benefits make it one of the most rewarding investments in your personal development. Whether you're looking to enhance your career prospects, travel more confidently, or simply challenge your brain, language learning offers invaluable returns."
        ],
        category: 'education',
        level: 'beginner',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        date: new Date('2023-01-15'),
        authors: {
          create: [
            {
              author: {
                connect: { id: emilyId }
              }
            }
          ]
        }
      },
    }),
    prisma.article.upsert({
      where: { id: article2Id },
      update: {},
      create: {
        id: article2Id,
        title: 'Understanding Climate Change: The Basics',
        excerpt: 'Learn about the fundamental concepts of climate change, its causes, and how it affects our planet in this introductory article.',
        content: 'Full content of the article about climate change basics.',
        paragraphs: [
          "Climate change refers to significant changes in global temperature, precipitation, wind patterns, and other measures of climate that occur over several decades or longer. While the Earth's climate has changed throughout history, the current trend is concerning because it is primarily caused by human activities and is occurring at an unprecedented rate.",
          "The main driver of current climate change is the greenhouse effect. Gases like carbon dioxide, methane, and nitrous oxide trap heat in the Earth's atmosphere, much like a greenhouse. Human activities, particularly the burning of fossil fuels for energy, have significantly increased the concentration of these gases in the atmosphere.",
          "The consequences of climate change are far-reaching and include rising sea levels, more frequent and severe weather events, shifts in plant and animal ranges, and more acidic oceans. These changes affect ecosystems, agriculture, human health, and infrastructure.",
          "Scientists measure climate change through various indicators, including temperature records, sea level measurements, ice core samples, satellite observations, and ocean acidity. The data consistently shows warming trends and other changes consistent with climate model predictions.",
          "The Intergovernmental Panel on Climate Change (IPCC), a UN body that assesses climate science, has concluded with high confidence that human activities are the dominant cause of observed warming since the mid-20th century.",
          "Addressing climate change requires both mitigation (reducing greenhouse gas emissions) and adaptation (adjusting to actual or expected climate effects). Mitigation strategies include transitioning to renewable energy, improving energy efficiency, protecting and expanding carbon sinks like forests, and changing consumption patterns.",
          "International cooperation is essential for effective climate action. The Paris Agreement, adopted in 2015, represents a global commitment to limit warming to well below 2°C above pre-industrial levels, with efforts to limit it to 1.5°C.",
          "Individual actions matter too. Choices about transportation, diet, energy use, and consumption can collectively make a significant difference in reducing greenhouse gas emissions.",
          "While the challenges of climate change are immense, technological innovation, policy reforms, and growing public awareness provide reasons for cautious optimism. The transition to a low-carbon economy also presents opportunities for job creation, improved public health, and more sustainable development."
        ],
        category: 'science',
        level: 'intermediate',
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        date: new Date('2023-02-22'),
        authors: {
          create: [
            {
              author: {
                connect: { id: davidId }
              }
            }
          ]
        }
      },
    }),
  ]);

  console.log(`Created ${articles.length} articles`);
  
  console.log('✅ Seed completed successfully');
}

// Execute the seed function
seed()
  .catch((e) => {
    console.error('❌ Seed failed');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma client connection
    await prisma.$disconnect();
  }); 