import { prisma } from './prisma';
import { Logger } from '../../shared/utils/logger';

async function main() {
  Logger.info('🌱 Début du seeding...');

  // Nettoyage des données existantes
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Création d'utilisateurs de test
  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      posts: {
        create: [
          {
            title: 'Mon premier post',
            content: 'Contenu du premier post de John',
            published: true
          },
          {
            title: 'Post en brouillon',
            content: 'Ce post n\'est pas encore publié',
            published: false
          }
        ]
      }
    },
    include: {
      posts: true
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      posts: {
        create: [
          {
            title: 'Article sur TypeScript',
            content: 'TypeScript est un super langage !',
            published: true
          }
        ]
      }
    },
    include: {
      posts: true
    }
  });

  Logger.info(`✅ Utilisateurs créés: ${user1.name} et ${user2.name}`);
  Logger.info(`📝 Posts créés: ${user1.posts.length + user2.posts.length}`);
  Logger.info('🌱 Seeding terminé !');
}

main()
  .catch((e) => {
    Logger.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
