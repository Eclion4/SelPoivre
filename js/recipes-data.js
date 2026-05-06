/**
 * Base de recettes Sel & Poivre — source unique de vérité.
 * "authorType: 'mijote'" = recette curatée/officielle Sel & Poivre (pas d'utilisateur spécifique).
 * "authorType: 'user'"   = recette soumise par un membre de la communauté.
 * status: 'published' | 'pending' | 'rejected'
 */

const RECIPES_DB = [

  /* ========================================================
     RECETTES OFFICIELLES MIJOTE  (ids 1–15)
     ======================================================== */

  {
    id: 1, slug: 'boeuf-bourguignon',
    title: 'Bœuf bourguignon',
    description: 'La recette classique du bœuf mijoté au vin rouge de Bourgogne, carottes, lardons et champignons. Un plat emblématique de la cuisine française.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
    category: 'plats',
    tags: ['français', 'sel-poivre', 'hiver', 'classique'],
    prepTime: 30, cookTime: 180, totalTime: 210,
    difficulty: 'avancé', calories: 580, servings: 6,
    rating: 4.9, ratingCount: 1240, featured: true,
    status: 'published', createdAt: '2025-11-10T10:00:00Z',
    ingredients: [
      { qty: '1.5', unit: 'kg', name: 'bœuf à braiser (paleron ou gîte), coupé en gros cubes' },
      { qty: '200', unit: 'g', name: 'lardons fumés' },
      { qty: '1', unit: 'bouteille', name: 'vin rouge de Bourgogne (pinot noir)' },
      { qty: '3', unit: '', name: 'carottes, coupées en rondelles épaisses' },
      { qty: '2', unit: '', name: 'oignons jaunes, émincés' },
      { qty: '300', unit: 'g', name: 'champignons de Paris, coupés en quartiers' },
      { qty: '3', unit: 'gousses', name: 'ail, écrasé' },
      { qty: '2', unit: 'c. à s.', name: 'concentré de tomate' },
      { qty: '1', unit: '', name: 'bouquet garni (thym, laurier, persil)' },
      { qty: '2', unit: 'c. à s.', name: 'farine' },
      { qty: '3', unit: 'c. à s.', name: 'huile neutre' },
      { qty: '', unit: '', name: 'sel et poivre noir du moulin' }
    ],
    steps: [
      {
        title: 'Faire mariner la viande',
        text: 'La veille, placez les cubes de bœuf dans un plat avec le vin, les carottes, les oignons, l\'ail et le bouquet garni. Couvrez et laissez mariner au réfrigérateur toute la nuit. Cette étape attendrit la viande et développe les arômes.'
      },
      {
        title: 'Faire revenir les lardons',
        text: 'Égouttez la viande (réservez la marinade). Dans une cocotte en fonte, faites revenir les lardons à feu vif sans matière grasse jusqu\'à ce qu\'ils soient bien dorés. Retirez-les et réservez, laissez la graisse dans la cocotte.'
      },
      {
        title: 'Saisir la viande',
        text: 'Essuyez les cubes de bœuf avec du papier absorbant. Faites-les colorer en plusieurs fois dans la cocotte chaude avec un peu d\'huile — ne surchargez pas la cocotte. Chaque face doit être bien dorée pour le goût. Retirez et réservez.'
      },
      {
        title: 'Construire la sauce',
        text: 'Faites revenir les légumes de la marinade dans la même cocotte. Ajoutez le concentré de tomate et la farine, remuez 2 minutes. Versez la marinade filtrée, les lardons et la viande. Le liquide doit couvrir les trois quarts de la viande.'
      },
      {
        title: 'Mijoter à feu très doux',
        text: 'Portez à frémissement, couvrez et laissez cuire à feu très doux (ou au four à 160 °C) pendant 2 h 30 à 3 heures. La viande doit se défaire facilement à la fourchette. Ajoutez les champignons 30 minutes avant la fin.'
      },
      {
        title: 'Dégraisser et ajuster',
        text: 'Retirez le bouquet garni. Si la sauce est trop liquide, retirez la viande et faites réduire à feu vif jusqu\'à consistance nappante. Rectifiez l\'assaisonnement. Remettez la viande pour la réchauffer avant de servir avec des pommes de terre vapeur ou des tagliatelles.'
      }
    ],
    nutrition: { glucides: 14, proteines: 48, lipides: 32, fibres: 3 }
  },

  {
    id: 2, slug: 'quiche-lorraine',
    title: 'Quiche lorraine traditionnelle',
    description: 'Pâte brisée maison, appareil crème-œufs, lardons fumés et noix de muscade. La vraie quiche lorraine sans fromage.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80',
    category: 'entrées',
    tags: ['français', 'lorrain', 'classique', 'pâte brisée'],
    prepTime: 25, cookTime: 40, totalTime: 65,
    difficulty: 'moyen', calories: 420, servings: 6,
    rating: 4.7, ratingCount: 876, featured: false,
    status: 'published', createdAt: '2025-10-05T09:00:00Z',
    ingredients: [
      { qty: '200', unit: 'g', name: 'farine T55' },
      { qty: '100', unit: 'g', name: 'beurre froid en dés' },
      { qty: '1', unit: 'pincée', name: 'sel' },
      { qty: '3', unit: 'c. à s.', name: 'eau froide' },
      { qty: '200', unit: 'g', name: 'lardons fumés' },
      { qty: '3', unit: '', name: 'œufs entiers' },
      { qty: '200', unit: 'ml', name: 'crème fraîche épaisse' },
      { qty: '100', unit: 'ml', name: 'lait entier' },
      { qty: '1', unit: 'pincée', name: 'noix de muscade râpée' },
      { qty: '', unit: '', name: 'sel et poivre noir du moulin' }
    ],
    steps: [
      {
        title: 'Préparer la pâte brisée',
        text: 'Sablez la farine avec le beurre froid du bout des doigts jusqu\'à obtenir une texture de sable grossier. Ajoutez le sel et l\'eau froide cuillère par cuillère, amalgamez sans trop travailler. Formez une boule, filmez et réfrigérez 30 minutes.'
      },
      {
        title: 'Foncer le moule et précuire',
        text: 'Préchauffez le four à 190 °C. Étalez la pâte et foncez un moule de 26 cm beurré. Piquez le fond à la fourchette, couvrez de papier sulfurisé lesté de billes céramiques et précuisez 15 minutes à blanc pour que le fond reste croustillant.'
      },
      {
        title: 'Faire revenir les lardons',
        text: 'Dans une poêle sans matière grasse, faites rissoler les lardons à feu moyen jusqu\'à ce qu\'ils soient légèrement dorés. Égouttez-les sur du papier absorbant pour retirer l\'excès de graisse.'
      },
      {
        title: 'Réaliser l\'appareil',
        text: 'Fouettez ensemble les œufs, la crème et le lait. Assaisonnez généreusement de sel, poivre et muscade. L\'appareil doit être homogène et légèrement mousseux.'
      },
      {
        title: 'Garnir et cuire',
        text: 'Répartissez les lardons sur le fond de tarte précuit. Versez l\'appareil par-dessus jusqu\'à 3 mm du bord. Enfournez à 180 °C pour 25 à 30 minutes. La quiche est prête quand l\'appareil est tout juste pris et légèrement gonflé avec une belle couleur dorée.'
      }
    ],
    nutrition: { glucides: 22, proteines: 18, lipides: 28, fibres: 1 }
  },

  {
    id: 3, slug: 'tarte-tatin',
    title: 'Tarte Tatin aux pommes',
    description: 'Pommes caramélisées renversées sur une pâte feuilletée croustillante. Servie tiède avec une crème fraîche épaisse.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?w=600&q=80',
    category: 'desserts',
    tags: ['français', 'classique', 'automne', 'pommes'],
    prepTime: 20, cookTime: 45, totalTime: 65,
    difficulty: 'moyen', calories: 340, servings: 8,
    rating: 4.8, ratingCount: 654, featured: true,
    status: 'published', createdAt: '2025-09-20T10:00:00Z',
    ingredients: [
      { qty: '1.2', unit: 'kg', name: 'pommes Golden ou Reinette (environ 6 pommes)' },
      { qty: '120', unit: 'g', name: 'sucre en poudre' },
      { qty: '80', unit: 'g', name: 'beurre demi-sel' },
      { qty: '1', unit: 'c. à c.', name: 'extrait de vanille' },
      { qty: '1', unit: 'pincée', name: 'cannelle moulue' },
      { qty: '1', unit: 'rouleau', name: 'pâte feuilletée pur beurre (ou maison)' },
      { qty: '', unit: '', name: 'crème fraîche épaisse, pour servir' }
    ],
    steps: [
      {
        title: 'Préparer les pommes',
        text: 'Pelez, épépinez et coupez les pommes en quartiers épais. Arrosez-les de vanille et saupoudrez d\'une pincée de cannelle. Des pommes fermes résistent mieux à la cuisson et resteront entières sous la pâte.'
      },
      {
        title: 'Réaliser le caramel',
        text: 'Dans une poêle à manche allant au four (ou une cocotte en fonte de 24 cm), faites fondre le beurre à feu moyen. Ajoutez le sucre en pluie et laissez caraméliser sans remuer, juste en inclinant doucement la poêle, jusqu\'à un caramel blond doré et odorant.'
      },
      {
        title: 'Disposer les pommes',
        text: 'Hors du feu, rangez les quartiers de pommes en rosace serrée dans le caramel, côté courbé vers le bas. Remettez sur feu moyen et laissez cuire 10 à 15 minutes jusqu\'à ce que les pommes soient translucides et le caramel réduit.'
      },
      {
        title: 'Couvrir de pâte et enfourner',
        text: 'Préchauffez le four à 200 °C. Découpez la pâte feuilletée en un disque légèrement plus grand que la poêle. Drapez-la sur les pommes en rentrant les bords à l\'intérieur comme une couverture. Percez quelques trous avec la pointe d\'un couteau.'
      },
      {
        title: 'Retourner et servir',
        text: 'Enfournez 25 à 30 minutes jusqu\'à ce que la pâte soit bien gonflée et dorée. Laissez reposer 5 minutes hors du four, puis retournez d\'un geste vif sur un plat de service. Servez tiède avec une généreuse cuillerée de crème fraîche épaisse.'
      }
    ],
    nutrition: { glucides: 48, proteines: 3, lipides: 14, fibres: 3 }
  },

  {
    id: 4, slug: 'soupe-oignon',
    title: 'Soupe à l\'oignon gratinée',
    description: 'Oignons longuement caramélisés dans du beurre, bouillon de bœuf, croûtons gratiné au gruyère. Le réconfort parisien par excellence.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
    category: 'entrées',
    tags: ['français', 'hiver', 'réconfort', 'gratiné'],
    prepTime: 15, cookTime: 60, totalTime: 75,
    difficulty: 'facile', calories: 280, servings: 4,
    rating: 4.8, ratingCount: 923, featured: false,
    status: 'published', createdAt: '2025-11-28T10:00:00Z',
    ingredients: [
      { qty: '1', unit: 'kg', name: 'oignons jaunes, finement émincés' },
      { qty: '60', unit: 'g', name: 'beurre' },
      { qty: '2', unit: 'c. à s.', name: 'huile d\'olive' },
      { qty: '1', unit: 'c. à c.', name: 'sucre' },
      { qty: '100', unit: 'ml', name: 'vin blanc sec' },
      { qty: '1.5', unit: 'litre', name: 'bouillon de bœuf maison ou du commerce' },
      { qty: '1', unit: '', name: 'branche de thym frais' },
      { qty: '8', unit: 'tranches', name: 'baguette rassis' },
      { qty: '150', unit: 'g', name: 'gruyère râpé' },
      { qty: '', unit: '', name: 'sel et poivre du moulin' }
    ],
    steps: [
      {
        title: 'Caraméliser les oignons',
        text: 'Dans une grande cocotte, faites fondre le beurre avec l\'huile à feu moyen. Ajoutez tous les oignons et le sucre. Faites cuire en remuant régulièrement pendant 40 à 45 minutes jusqu\'à ce qu\'ils soient profondément dorés et caramélisés. Ne brusquez pas cette étape — la patience est le secret.'
      },
      {
        title: 'Déglacer et cuire le bouillon',
        text: 'Versez le vin blanc sur les oignons caramélisés et grattez bien les sucs au fond de la cocotte. Laissez réduire 2 minutes. Ajoutez le bouillon et le thym, portez à ébullition puis laissez mijoter 15 minutes à couvert. Rectifiez l\'assaisonnement.'
      },
      {
        title: 'Préparer les croûtons',
        text: 'Préchauffez le gril du four. Disposez les tranches de baguette sur une plaque, passez-les sous le gril 2 minutes de chaque côté jusqu\'à ce qu\'elles soient dorées et croustillantes. Réservez.'
      },
      {
        title: 'Gratiner et servir',
        text: 'Répartissez la soupe dans des bols allant au four. Posez 2 croûtons sur chaque bol et couvrez généreusement de gruyère râpé. Passez sous le gril à 220 °C pendant 3 à 5 minutes jusqu\'à ce que le fromage soit fondu, bouillonnant et bien gratiné. Servez immédiatement.'
      }
    ],
    nutrition: { glucides: 30, proteines: 14, lipides: 12, fibres: 4 }
  },

  {
    id: 5, slug: 'crepes-classiques',
    title: 'Crêpes légères à la française',
    description: 'Pâte fine et dorée, parfaite pour les versions sucrées ou salées. Le secret : reposer la pâte 1 h et bien beurrer la poêle.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&q=80',
    category: 'desserts',
    tags: ['français', 'simple', 'famille', 'chandeleur'],
    prepTime: 10, cookTime: 20, totalTime: 90,
    difficulty: 'facile', calories: 190, servings: 8,
    rating: 4.9, ratingCount: 2100, featured: true,
    status: 'published', createdAt: '2025-08-15T10:00:00Z',
    ingredients: [
      { qty: '250', unit: 'g', name: 'farine T45' },
      { qty: '3', unit: '', name: 'œufs entiers' },
      { qty: '500', unit: 'ml', name: 'lait entier' },
      { qty: '50', unit: 'g', name: 'beurre fondu refroidi' },
      { qty: '1', unit: 'pincée', name: 'sel fin' },
      { qty: '1', unit: 'c. à s.', name: 'sucre vanillé (pour version sucrée)' },
      { qty: '1', unit: 'c. à s.', name: 'rhum ambré ou eau de fleur d\'oranger (facultatif)' },
      { qty: '', unit: '', name: 'beurre ou huile neutre, pour la cuisson' }
    ],
    steps: [
      {
        title: 'Préparer la pâte',
        text: 'Tamisez la farine dans un grand saladier et faites un puits. Ajoutez les œufs et fouettez en incorporant la farine progressivement depuis le centre. Versez le lait en filet tout en continuant de fouetter pour éviter les grumeaux. Terminez par le beurre fondu et l\'arôme choisi.'
      },
      {
        title: 'Laisser reposer la pâte',
        text: 'Filmez le saladier et laissez reposer la pâte à température ambiante au minimum 1 heure. Ce repos permet au gluten de se détendre et donne des crêpes plus légères et faciles à retourner. La pâte se conserve aussi une nuit au frais.'
      },
      {
        title: 'Cuire les crêpes',
        text: 'Chauffez une crêpière ou poêle antiadhésive à feu moyen-fort. Beurrez légèrement avec un papier absorbant. Versez une petite louche de pâte et inclinez la poêle rapidement en cercle pour étaler finement. Cuisez 1 à 1 min 30 de chaque côté jusqu\'à légère coloration dorée.'
      },
      {
        title: 'Servir avec les garnitures',
        text: 'Empilez les crêpes sur une assiette couverte d\'aluminium pour les garder chaudes. Servez avec du beurre demi-sel, du sucre, de la confiture, du Nutella, ou du fromage et du jambon pour les crêpes salées. Les crêpes se réchauffent très bien à la poêle.'
      }
    ],
    nutrition: { glucides: 28, proteines: 6, lipides: 7, fibres: 1 }
  },

  {
    id: 6, slug: 'ratatouille',
    title: 'Ratatouille provençale',
    description: 'Aubergines, courgettes, poivrons et tomates mijotés à l\'huile d\'olive avec thym et basilic frais. L\'essence de la Provence.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=600&q=80',
    category: 'plats',
    tags: ['végétarien', 'méditerranéen', 'été', 'vegan'],
    prepTime: 20, cookTime: 50, totalTime: 70,
    difficulty: 'facile', calories: 160, servings: 4,
    rating: 4.7, ratingCount: 541, featured: false,
    status: 'published', createdAt: '2025-07-12T10:00:00Z',
    ingredients: [
      { qty: '2', unit: '', name: 'aubergines moyennes' },
      { qty: '3', unit: '', name: 'courgettes' },
      { qty: '2', unit: '', name: 'poivrons rouges' },
      { qty: '1', unit: '', name: 'poivron jaune' },
      { qty: '4', unit: '', name: 'tomates mûres, pelées et concassées' },
      { qty: '2', unit: '', name: 'oignons rouges, émincés' },
      { qty: '4', unit: 'gousses', name: 'ail, finement émincé' },
      { qty: '6', unit: 'c. à s.', name: 'huile d\'olive extra-vierge' },
      { qty: '1', unit: 'bouquet', name: 'thym et romarin frais' },
      { qty: '1', unit: 'poignée', name: 'feuilles de basilic frais' },
      { qty: '', unit: '', name: 'sel, poivre et piment d\'Espelette' }
    ],
    steps: [
      {
        title: 'Préparer et faire dégorger les légumes',
        text: 'Coupez les aubergines en cubes de 2 cm, salez-les et laissez-les dégorger 20 minutes dans une passoire. Cette étape retire l\'amertume et l\'excès d\'eau. Coupez courgettes et poivrons en morceaux similaires.'
      },
      {
        title: 'Faire revenir les légumes séparément',
        text: 'Dans une grande sauteuse, faites revenir chaque légume séparément dans 2 cuillères d\'huile d\'olive jusqu\'à légère coloration. Commencez par les poivrons, puis les aubergines rincées et essuyées, puis les courgettes. Réservez-les séparément — cela préserve la texture de chacun.'
      },
      {
        title: 'Préparer la base tomate',
        text: 'Dans la même sauteuse, faites revenir les oignons 5 minutes dans le reste d\'huile. Ajoutez l\'ail et cuisez 1 minute. Incorporez les tomates concassées, le thym et le romarin. Laissez mijoter 10 minutes jusqu\'à réduction.'
      },
      {
        title: 'Assembler et mijoter ensemble',
        text: 'Remettez tous les légumes dans la sauteuse avec la sauce tomate. Mélangez délicatement, assaisonnez de sel, poivre et piment d\'Espelette. Couvrez et laissez mijoter à feu doux 20 à 25 minutes. La ratatouille est meilleure réchauffée le lendemain. Parsemez de basilic au moment de servir.'
      }
    ],
    nutrition: { glucides: 18, proteines: 4, lipides: 9, fibres: 6 }
  },

  {
    id: 7, slug: 'mousse-chocolat',
    title: 'Mousse au chocolat noir intense',
    description: 'Chocolat noir 70%, blancs montés en neige ferme, jaunes d\'œufs et beurre. Sans crème pour une texture aérienne unique.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1511715282680-fbf93a50e721?w=600&q=80',
    category: 'desserts',
    tags: ['chocolat', 'végétarien', 'sans gluten', 'classique'],
    prepTime: 20, cookTime: 0, totalTime: 140,
    difficulty: 'facile', calories: 320, servings: 6,
    rating: 4.9, ratingCount: 1876, featured: true,
    status: 'published', createdAt: '2025-10-30T10:00:00Z',
    ingredients: [
      { qty: '200', unit: 'g', name: 'chocolat noir 70% de cacao' },
      { qty: '50', unit: 'g', name: 'beurre doux' },
      { qty: '6', unit: '', name: 'œufs, séparés' },
      { qty: '40', unit: 'g', name: 'sucre en poudre' },
      { qty: '1', unit: 'pincée', name: 'fleur de sel' },
      { qty: '1', unit: 'pincée', name: 'sel fin (pour les blancs)' }
    ],
    steps: [
      {
        title: 'Faire fondre le chocolat',
        text: 'Cassez le chocolat en morceaux et faites-le fondre au bain-marie avec le beurre, en remuant doucement. Le mélange doit être lisse, brillant et à environ 50 °C. Retirez du feu et laissez tiédir à 40 °C pour ne pas cuire les jaunes.'
      },
      {
        title: 'Incorporer les jaunes',
        text: 'Fouettez les jaunes d\'œufs avec le sucre jusqu\'à ce que le mélange blanchisse et fasse le ruban. Versez le chocolat fondu tiède en filet tout en fouettant constamment. Ajoutez la fleur de sel.'
      },
      {
        title: 'Monter les blancs en neige',
        text: 'Montez les blancs avec une pincée de sel en neige ferme mais pas cassante — les becs doivent être souples. Des blancs trop fermes se mélangent mal et donnent une mousse grumeleuse.'
      },
      {
        title: 'Incorporer les blancs',
        text: 'Incorporez un tiers des blancs dans la préparation chocolatée en fouettant vivement pour l\'alléger. Ajoutez le reste en deux fois à la spatule, avec des gestes amples et enveloppants en soulevant depuis le bas. Travaillez rapidement pour conserver l\'air.'
      },
      {
        title: 'Réfrigérer et servir',
        text: 'Répartissez la mousse dans des verrines ou ramequins. Couvrez de film alimentaire au contact pour éviter la croûte. Réfrigérez au minimum 2 heures, idéalement 4 heures. Servez avec quelques éclats de chocolat ou une feuille de menthe fraîche.'
      }
    ],
    nutrition: { glucides: 24, proteines: 8, lipides: 20, fibres: 3 }
  },

  {
    id: 8, slug: 'poulet-roti-herbes',
    title: 'Poulet rôti aux herbes et citron',
    description: 'Poulet fermier rôti avec beurre aux herbes glissé sous la peau, ail en chemise et citron. Peau croustillante garantie.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=600&q=80',
    category: 'plats',
    tags: ['viande', 'dimanche', 'classique', 'rôti'],
    prepTime: 15, cookTime: 80, totalTime: 95,
    difficulty: 'facile', calories: 490, servings: 4,
    rating: 4.8, ratingCount: 1543, featured: false,
    status: 'published', createdAt: '2025-09-05T10:00:00Z',
    ingredients: [
      { qty: '1', unit: '', name: 'poulet fermier d\'environ 1.6 kg' },
      { qty: '80', unit: 'g', name: 'beurre mou' },
      { qty: '3', unit: 'gousses', name: 'ail, finement haché' },
      { qty: '1', unit: 'c. à s.', name: 'thym frais effeuillé' },
      { qty: '1', unit: 'c. à s.', name: 'romarin frais, finement haché' },
      { qty: '1', unit: '', name: 'citron non traité, zeste et jus' },
      { qty: '1', unit: 'tête', name: 'ail entière, coupée en deux dans l\'épaisseur' },
      { qty: '3', unit: 'c. à s.', name: 'huile d\'olive' },
      { qty: '', unit: '', name: 'fleur de sel et poivre noir concassé' }
    ],
    steps: [
      {
        title: 'Préparer le beurre aux herbes',
        text: 'Mélangez le beurre mou avec l\'ail haché, le thym, le romarin, le zeste de citron, du sel et du poivre. Travaillez jusqu\'à obtenir un beurre homogène très parfumé. Ce beurre est le secret du moelleux et du goût du poulet.'
      },
      {
        title: 'Glisser le beurre sous la peau',
        text: 'Décollez délicatement la peau des blancs et des cuisses avec les doigts sans la déchirer. Glissez des noix de beurre aux herbes directement sur la chair sous la peau et massez depuis l\'extérieur pour répartir. Enduisez également l\'extérieur du poulet d\'huile d\'olive.'
      },
      {
        title: 'Préparer et enfourner',
        text: 'Préchauffez le four à 200 °C. Salez et poivrez généreusement l\'intérieur de la cavité. Glissez-y la moitié du citron et quelques gousses d\'ail. Posez le poulet dans un plat à rôtir avec la tête d\'ail coupée, arrosez de jus de citron.'
      },
      {
        title: 'Rôtir et arroser régulièrement',
        text: 'Enfournez poitrine vers le haut. Toutes les 20 minutes, arrosez le poulet avec les jus de cuisson. Au bout de 60 à 80 minutes (18 min/500 g), la peau doit être bien croustillante et dorée. Vérifiez la cuisson en piquant la cuisse — le jus doit couler clair.'
      },
      {
        title: 'Laisser reposer et servir',
        text: 'Sortez le poulet du four et laissez-le reposer 10 minutes recouvert d\'aluminium avant de le découper. Ce repos redistribue les jus et rend la chair plus juteuse. Déglacez le plat avec un peu d\'eau et servez avec les sucs pour la sauce.'
      }
    ],
    nutrition: { glucides: 1, proteines: 42, lipides: 32, fibres: 0 }
  },

  {
    id: 9, slug: 'creme-brulee',
    title: 'Crème brûlée vanille',
    description: 'Crème onctueuse infusée à la vanille de Tahiti, caramel craquant à la flamme. Technique du bain-marie pour une texture parfaite.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600&q=80',
    category: 'desserts',
    tags: ['classique', 'restaurant', 'vanille', 'sans gluten'],
    prepTime: 15, cookTime: 45, totalTime: 180,
    difficulty: 'facile', calories: 380, servings: 4,
    rating: 4.9, ratingCount: 1987, featured: true,
    status: 'published', createdAt: '2025-06-10T10:00:00Z',
    ingredients: [
      { qty: '500', unit: 'ml', name: 'crème liquide entière 35%' },
      { qty: '6', unit: '', name: 'jaunes d\'œufs' },
      { qty: '80', unit: 'g', name: 'sucre en poudre' },
      { qty: '2', unit: '', name: 'gousses de vanille, fendues et grattées' },
      { qty: '4', unit: 'c. à s.', name: 'cassonade (pour le caramel)' }
    ],
    steps: [
      {
        title: 'Infuser la vanille dans la crème',
        text: 'Portez la crème avec les gousses de vanille fendues et grattées à frémissement (sans ébullition). Retirez du feu, couvrez et laissez infuser 20 minutes. Plus l\'infusion est longue, plus la crème sera parfumée.'
      },
      {
        title: 'Préparer l\'appareil',
        text: 'Fouettez les jaunes avec le sucre jusqu\'à ce que le mélange blanchisse légèrement. Versez la crème tiède filtrée en filet sur les jaunes, en fouettant constamment pour ne pas les cuire. Écumez soigneusement la mousse en surface pour éviter des bulles dans la crème cuite.'
      },
      {
        title: 'Cuire au bain-marie',
        text: 'Préchauffez le four à 150 °C. Répartissez l\'appareil dans 4 ramequins. Posez-les dans un plat profond rempli d\'eau chaude à mi-hauteur des ramequins. Enfournez 40 à 45 minutes. La crème doit être juste prise, avec un très léger tremblement au centre.'
      },
      {
        title: 'Refroidir et caraméliser',
        text: 'Sortez les ramequins du bain-marie et laissez-les refroidir à température ambiante, puis réfrigérez au moins 2 heures. Au moment de servir, saupoudrez une fine couche de cassonade sur chaque crème et caramélisez au chalumeau en mouvements circulaires jusqu\'à obtenir une croûte ambrée et craquante.'
      }
    ],
    nutrition: { glucides: 26, proteines: 7, lipides: 28, fibres: 0 }
  },

  {
    id: 10, slug: 'blanquette-veau',
    title: 'Blanquette de veau à l\'ancienne',
    description: 'Veau épaule mijoté dans un bouillon blanc, sauce veloutée à la crème et citron, champignons et petits oignons. Recette de grand-mère.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80',
    category: 'plats',
    tags: ['français', 'terroir', 'classique', 'dimanche'],
    prepTime: 20, cookTime: 90, totalTime: 110,
    difficulty: 'moyen', calories: 480, servings: 4,
    rating: 4.8, ratingCount: 567, featured: false,
    status: 'published', createdAt: '2025-10-10T10:00:00Z',
    ingredients: [
      { qty: '1.2', unit: 'kg', name: 'épaule de veau, coupée en morceaux de 5 cm' },
      { qty: '200', unit: 'g', name: 'petits champignons de Paris' },
      { qty: '200', unit: 'g', name: 'petits oignons grelots, pelés' },
      { qty: '2', unit: '', name: 'carottes, en tronçons' },
      { qty: '1', unit: '', name: 'oignon piqué de 2 clous de girofle' },
      { qty: '1', unit: '', name: 'bouquet garni' },
      { qty: '50', unit: 'g', name: 'beurre' },
      { qty: '40', unit: 'g', name: 'farine' },
      { qty: '200', unit: 'ml', name: 'crème fraîche épaisse' },
      { qty: '1', unit: '', name: 'jaune d\'œuf' },
      { qty: '1', unit: '', name: 'jus de citron' },
      { qty: '', unit: '', name: 'sel, poivre blanc et muscade' }
    ],
    steps: [
      {
        title: 'Pocher la viande',
        text: 'Plongez les morceaux de veau dans une grande casserole d\'eau froide, portez à ébullition et blanchissez 5 minutes. Égouttez et rincez la viande à l\'eau froide pour éliminer les impuretés. Cette étape garantit un bouillon clair.'
      },
      {
        title: 'Cuire dans le bouillon blanc',
        text: 'Remettez la viande dans la casserole avec l\'oignon piqué, les carottes et le bouquet garni. Couvrez d\'eau froide, salez légèrement. Portez à frémissement et laissez cuire 1 heure 15 à feu doux. Écumez régulièrement. Ajoutez les oignons grelots 20 minutes avant la fin.'
      },
      {
        title: 'Cuire les champignons',
        text: 'Faites sauter les champignons 5 minutes dans une noix de beurre avec sel et poivre. Réservez. Filtrez le bouillon de cuisson et reservez-en 600 ml pour la sauce.'
      },
      {
        title: 'Préparer la sauce veloutée',
        text: 'Faites un roux blond avec le beurre et la farine. Versez le bouillon tiède en fouettant pour éviter les grumeaux. Laissez épaissir 10 minutes à feu doux. Mélangez la crème avec le jaune d\'œuf, incorporez hors du feu dans la sauce. Ajoutez le citron, la muscade et rectifiez l\'assaisonnement.'
      },
      {
        title: 'Assembler et servir',
        text: 'Remettez la viande égouttée, les oignons et les champignons dans la sauce. Réchauffez à feu très doux sans faire bouillir pour ne pas faire tourner la sauce. Servez avec du riz blanc ou des pommes de terre vapeur, parsemé de persil frais haché.'
      }
    ],
    nutrition: { glucides: 16, proteines: 44, lipides: 24, fibres: 2 }
  },

  {
    id: 11, slug: 'curry-legumes',
    title: 'Curry de légumes au lait de coco',
    description: 'Courge butternut, pois chiches, épinards dans une sauce crémeuse coco-curry. Curcuma, gingembre frais et coriandre. Prêt en 30 minutes.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80',
    category: 'plats',
    tags: ['végétarien', 'vegan', 'indien', 'rapide'],
    prepTime: 10, cookTime: 25, totalTime: 35,
    difficulty: 'facile', calories: 310, servings: 4,
    rating: 4.7, ratingCount: 523, featured: false,
    status: 'published', createdAt: '2025-12-01T10:00:00Z',
    ingredients: [
      { qty: '500', unit: 'g', name: 'courge butternut, en cubes de 2 cm' },
      { qty: '400', unit: 'g', name: 'pois chiches cuits (1 boîte)' },
      { qty: '100', unit: 'g', name: 'épinards frais ou surgelés' },
      { qty: '400', unit: 'ml', name: 'lait de coco entier' },
      { qty: '2', unit: 'c. à s.', name: 'pâte de curry rouge ou jaune' },
      { qty: '1', unit: 'c. à c.', name: 'curcuma en poudre' },
      { qty: '1', unit: 'morceau', name: 'gingembre frais (3 cm), râpé' },
      { qty: '2', unit: 'gousses', name: 'ail, écrasées' },
      { qty: '1', unit: '', name: 'oignon, émincé' },
      { qty: '2', unit: 'c. à s.', name: 'huile de coco ou huile neutre' },
      { qty: '1', unit: 'bouquet', name: 'coriandre fraîche' },
      { qty: '', unit: '', name: 'sel, jus de citron vert' }
    ],
    steps: [
      {
        title: 'Faire revenir les aromates',
        text: 'Faites chauffer l\'huile dans une grande sauteuse ou wok. Faites revenir l\'oignon 5 minutes jusqu\'à translucidité. Ajoutez l\'ail, le gingembre, la pâte de curry et le curcuma. Faites sauter 1 à 2 minutes en remuant — les épices doivent être très parfumées.'
      },
      {
        title: 'Ajouter la courge et le lait de coco',
        text: 'Versez les cubes de courge et mélangez pour bien les enrober d\'épices. Versez le lait de coco, ajoutez 100 ml d\'eau si nécessaire pour couvrir les légumes. Portez à frémissement, couvrez et laissez mijoter 15 minutes jusqu\'à ce que la courge soit tendre.'
      },
      {
        title: 'Incorporer les pois chiches et épinards',
        text: 'Ajoutez les pois chiches égouttés et les épinards. Laissez cuire encore 5 minutes jusqu\'à ce que les épinards soient fondus. Ajustez la consistance de la sauce — elle doit être crémeuse et nappante.'
      },
      {
        title: 'Assaisonner et servir',
        text: 'Rectifiez le sel et ajoutez un filet de citron vert pour équilibrer la richesse du coco. Parsemez de coriandre fraîche ciselée. Servez avec du riz basmati ou des naans chauds. Ce curry est encore meilleur réchauffé le lendemain.'
      }
    ],
    nutrition: { glucides: 38, proteines: 12, lipides: 12, fibres: 9 }
  },

  {
    id: 12, slug: 'madeleines',
    title: 'Madeleines au citron',
    description: 'Beurre noisette, miel, citron, bosse garantie grâce au choc thermique. Moelleuses dedans, dorées dehors. La madeleine de Proust.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
    category: 'desserts',
    tags: ['beurre', 'classique', 'goûter', 'citron'],
    prepTime: 15, cookTime: 12, totalTime: 90,
    difficulty: 'facile', calories: 140, servings: 18,
    rating: 4.8, ratingCount: 1234, featured: false,
    status: 'published', createdAt: '2025-04-22T10:00:00Z',
    ingredients: [
      { qty: '150', unit: 'g', name: 'farine T55' },
      { qty: '130', unit: 'g', name: 'sucre en poudre' },
      { qty: '3', unit: '', name: 'œufs entiers' },
      { qty: '130', unit: 'g', name: 'beurre, pour le beurre noisette' },
      { qty: '1', unit: 'c. à s.', name: 'miel d\'acacia' },
      { qty: '1', unit: '', name: 'citron non traité, zeste et jus' },
      { qty: '1', unit: 'sachet', name: 'levure chimique (5 g)' },
      { qty: '1', unit: 'pincée', name: 'sel fin' }
    ],
    steps: [
      {
        title: 'Réaliser le beurre noisette',
        text: 'Faites chauffer le beurre dans une petite casserole sur feu moyen jusqu\'à ce qu\'il mousse, puis colore en brun doré avec un arôme de noisette. Filtrez aussitôt à travers un tamis fin et laissez tiédir. C\'est cet arôme qui distingue une vraie madeleine.'
      },
      {
        title: 'Préparer l\'appareil',
        text: 'Fouettez les œufs avec le sucre et le miel jusqu\'à mélange mousseux. Incorporez le zeste et le jus de citron. Tamisez la farine avec la levure et le sel, incorporez-les en deux fois sans trop travailler. Terminez par le beurre noisette tiède.'
      },
      {
        title: 'Choc thermique — la clé de la bosse',
        text: 'Filmez la pâte au contact et réfrigérez au minimum 1 heure (idéalement toute une nuit). Pendant ce temps, ne touchez pas la pâte. Ce choc thermique entre la pâte froide et le four très chaud est le secret de la bosse caractéristique des madeleines.'
      },
      {
        title: 'Cuire les madeleines',
        text: 'Préchauffez le four à 220 °C (très chaud). Beurrez et farinez généreusement le moule à madeleines. Remplissez chaque empreinte aux trois quarts avec la pâte froide. Enfournez immédiatement et baissez à 180 °C au bout de 4 minutes. Cuisez encore 8 minutes jusqu\'à coloration dorée et bosse bien formée.'
      }
    ],
    nutrition: { glucides: 18, proteines: 3, lipides: 6, fibres: 0 }
  },

  {
    id: 13, slug: 'pad-thai',
    title: 'Pad Thaï authentique',
    description: 'Nouilles de riz sautées avec crevettes, œufs, pousses de soja, cacahuètes, sauce tamarin et fish sauce. Street food de Bangkok.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
    category: 'plats',
    tags: ['thaïlandais', 'asiatique', 'wok', 'rapide'],
    prepTime: 15, cookTime: 15, totalTime: 30,
    difficulty: 'moyen', calories: 490, servings: 2,
    rating: 4.7, ratingCount: 634, featured: false,
    status: 'published', createdAt: '2025-09-12T10:00:00Z',
    ingredients: [
      { qty: '200', unit: 'g', name: 'nouilles de riz plates (sen lek), trempées 30 min' },
      { qty: '200', unit: 'g', name: 'crevettes crues décortiquées' },
      { qty: '2', unit: '', name: 'œufs entiers' },
      { qty: '100', unit: 'g', name: 'pousses de soja fraîches' },
      { qty: '3', unit: 'c. à s.', name: 'sauce tamarin (ou 2 c. à s. de vinaigre + 1 c. à s. de sucre)' },
      { qty: '2', unit: 'c. à s.', name: 'fish sauce (nuoc mâm)' },
      { qty: '1', unit: 'c. à s.', name: 'sauce soja claire' },
      { qty: '1', unit: 'c. à c.', name: 'sucre de palme ou cassonade' },
      { qty: '3', unit: 'c. à s.', name: 'huile de cacahuète' },
      { qty: '3', unit: '', name: 'ciboules, émincées' },
      { qty: '50', unit: 'g', name: 'cacahuètes grillées non salées, concassées' },
      { qty: '1', unit: '', name: 'citron vert, coupé en quartiers' }
    ],
    steps: [
      {
        title: 'Préparer la sauce et les ingrédients',
        text: 'Mélangez la sauce tamarin, la fish sauce, la sauce soja et le sucre dans un bol. Goûtez — la sauce doit être équilibrée entre acide, salée et sucrée. Égouttez les nouilles ramollies. Tout doit être à portée de main : le wok va vite.'
      },
      {
        title: 'Saisir les crevettes',
        text: 'Chauffez le wok à feu très vif jusqu\'à légère fumée. Versez 2 cuillères d\'huile, saisissez les crevettes 1 à 2 minutes de chaque côté jusqu\'à ce qu\'elles soient roses et légèrement colorées. Retirez et réservez.'
      },
      {
        title: 'Cuire les nouilles',
        text: 'Dans le même wok sur feu vif, ajoutez l\'huile restante et faites sauter les nouilles égouttées 2 à 3 minutes. Versez la sauce et mélangez rapidement pour que les nouilles l\'absorbent bien. Si elles collent, ajoutez quelques cuillères d\'eau.'
      },
      {
        title: 'Ajouter les œufs',
        text: 'Poussez les nouilles sur les bords du wok, cassez les œufs au centre et brouiller-les rapidement. Avant qu\'ils soient complètement cuits, mélangez-les aux nouilles. Remettez les crevettes, ajoutez les ciboules et la moitié des pousses de soja.'
      },
      {
        title: 'Dresser et servir',
        text: 'Dressez immédiatement dans des assiettes chaudes. Garnissez des pousses de soja restantes, de cacahuètes concassées et de ciboule. Servez avec des quartiers de citron vert, du piment en flocons et de la fish sauce pour ajuster à table.'
      }
    ],
    nutrition: { glucides: 62, proteines: 28, lipides: 14, fibres: 3 }
  },

  {
    id: 14, slug: 'hummus-libanais',
    title: 'Houmous libanais onctueux',
    description: 'Pois chiches mixés avec tahini, citron, ail et cumin. Recette libanaise traditionnelle avec l\'astuce de l\'eau glacée pour la texture.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1604909052434-1d2f5d6c3e09?w=600&q=80',
    category: 'apéro',
    tags: ['végétarien', 'vegan', 'libanais', 'sain'],
    prepTime: 15, cookTime: 0, totalTime: 15,
    difficulty: 'facile', calories: 180, servings: 6,
    rating: 4.8, ratingCount: 892, featured: false,
    status: 'published', createdAt: '2025-05-15T10:00:00Z',
    ingredients: [
      { qty: '400', unit: 'g', name: 'pois chiches cuits (boîte), épluchés de leur peau fine' },
      { qty: '80', unit: 'g', name: 'tahini (purée de sésame)' },
      { qty: '1', unit: 'gousse', name: 'ail, pressée' },
      { qty: '60', unit: 'ml', name: 'jus de citron frais' },
      { qty: '60', unit: 'ml', name: 'eau glacée' },
      { qty: '1/2', unit: 'c. à c.', name: 'cumin moulu' },
      { qty: '', unit: '', name: 'sel fin' },
      { qty: '2', unit: 'c. à s.', name: 'huile d\'olive extra-vierge, pour servir' },
      { qty: '1', unit: 'c. à c.', name: 'paprika doux, pour garnir' },
      { qty: '', unit: '', name: 'persil plat, pour garnir' }
    ],
    steps: [
      {
        title: 'Préparer les pois chiches',
        text: 'Pour un houmous ultra-soyeux, épluchez les pois chiches un par un en les pinçant entre vos doigts — la peau fine glisse facilement. Cette étape fastidieuse mais capitale élimine toute rugosité dans la texture finale.'
      },
      {
        title: 'Mixer le tahini et le citron',
        text: 'Dans le bol d\'un mixeur, versez d\'abord le tahini et le jus de citron sans rien d\'autre. Mixez 1 minute jusqu\'à ce que le mélange soit clair et crémeux — le tahini s\'émulsionne. Ajoutez l\'ail et le cumin, mixez 30 secondes de plus.'
      },
      {
        title: 'Incorporer les pois chiches',
        text: 'Ajoutez les pois chiches et mixez 3 à 4 minutes en versant l\'eau glacée en filet pour obtenir une texture très lisse. Assaisonnez de sel. L\'eau froide est l\'astuce libanaise pour un houmous aérien — ne la sautez pas.'
      },
      {
        title: 'Dresser et servir',
        text: 'Étalez le houmous dans un plat en faisant des sillons avec le dos d\'une cuillère. Versez un filet d\'huile d\'olive, parsemez de paprika et de persil. Servez à température ambiante avec des pains pita chauds, des crudités ou des falafels.'
      }
    ],
    nutrition: { glucides: 20, proteines: 8, lipides: 10, fibres: 5 }
  },

  {
    id: 15, slug: 'cassoulet',
    title: 'Cassoulet toulousain',
    description: 'Haricots lingots, confit de canard, saucisse de Toulouse et couenne. La recette authentique du Languedoc, mijotée 4 heures.',
    author: 'SEL & POIVRE', authorType: 'mijote', authorAvatar: null,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    category: 'plats',
    tags: ['français', 'terroir', 'hiver', 'languedoc'],
    prepTime: 30, cookTime: 240, totalTime: 300,
    difficulty: 'avancé', calories: 720, servings: 6,
    rating: 4.8, ratingCount: 412, featured: false,
    status: 'published', createdAt: '2025-01-20T10:00:00Z',
    ingredients: [
      { qty: '500', unit: 'g', name: 'haricots lingots secs (trempés une nuit)' },
      { qty: '4', unit: 'cuisses', name: 'confit de canard' },
      { qty: '4', unit: '', name: 'saucisses de Toulouse' },
      { qty: '200', unit: 'g', name: 'couenne de porc fraîche' },
      { qty: '200', unit: 'g', name: 'poitrine de porc demi-sel' },
      { qty: '2', unit: '', name: 'oignons, un piqué de clous de girofle' },
      { qty: '4', unit: 'gousses', name: 'ail' },
      { qty: '2', unit: '', name: 'tomates mûres, concassées' },
      { qty: '1', unit: '', name: 'bouquet garni (laurier, thym, persil)' },
      { qty: '1', unit: 'litre', name: 'bouillon de volaille' },
      { qty: '4', unit: 'c. à s.', name: 'chapelure fraîche' },
      { qty: '', unit: '', name: 'sel et poivre noir' }
    ],
    steps: [
      {
        title: 'Préparer et cuire les haricots',
        text: 'Égouttez les haricots trempés, couvrez-les d\'eau froide dans une grande casserole. Portez à ébullition, blanchissez 5 minutes, égouttez. Recommencez dans l\'eau fraîche avec la couenne, un oignon, l\'ail et le bouquet garni. Cuisez 45 minutes jusqu\'à mi-cuisson. Les haricots doivent rester légèrement fermes.'
      },
      {
        title: 'Préparer les viandes',
        text: 'Faites revenir les saucisses dans une poêle pour les dorer. Dans le même gras, faites colorer la poitrine de porc. Récupérez les cuisses de canard confites et faites-les légèrement rissoler à la poêle pour enlever l\'excès de graisse. Réservez toutes les viandes.'
      },
      {
        title: 'Assembler le cassoulet',
        text: 'Préchauffez le four à 160 °C. Tapissez le fond d\'une cassole (plat en terre cuite) de couenne. Ajoutez la moitié des haricots égouttés avec leur bouillon. Disposez toutes les viandes. Couvrez du reste des haricots. Ajoutez le bouillon de volaille jusqu\'à affleurer, les tomates et l\'ail écrasé.'
      },
      {
        title: 'Cuire longuement au four',
        text: 'Saupoudrez de chapelure. Enfournez à 160 °C pour 3 heures. Toutes les 30 à 40 minutes, cassez la croûte qui se forme à la surface et enfoncez-la dans le cassoulet — ce geste, répété 7 fois selon la tradition toulousaine, donne sa richesse au plat.'
      },
      {
        title: 'Servir directement dans la cassole',
        text: 'Le cassoulet est prêt quand la croûte est bien dorée et que le bouillon a épaissi. Laissez reposer 10 minutes avant de servir directement à table dans la cassole. Accompagnez d\'un vin rouge du Languedoc (Corbières ou Faugères).'
      }
    ],
    nutrition: { glucides: 52, proteines: 46, lipides: 38, fibres: 14 }
  },

  /* ========================================================
     RECETTES COMMUNAUTÉ PUBLIÉES  (ids 16–25)
     ======================================================== */

  {
    id: 16, slug: 'risotto-champignons',
    title: 'Risotto crémeux aux champignons sauvages',
    description: 'Un risotto onctueux aux champignons de saison, parmesan affiné et une touche de truffe noire. La recette authentique du nord de l\'Italie.',
    author: 'Marie L.', authorType: 'user', authorAvatar: 'Marie Lefèvre',
    image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&q=80',
    category: 'plats',
    tags: ['végétarien', 'italien', 'champignons', 'crémeux'],
    prepTime: 15, cookTime: 25, totalTime: 40,
    difficulty: 'facile', calories: 420, servings: 4,
    rating: 4.9, ratingCount: 234, featured: true,
    status: 'published', createdAt: '2026-04-28T10:00:00Z',
    ingredients: [
      { qty: '320', unit: 'g', name: 'riz arborio ou carnaroli' },
      { qty: '400', unit: 'g', name: 'champignons mélangés (cèpes, girolles, pleurotes)' },
      { qty: '1', unit: 'litre', name: 'bouillon de légumes ou de volaille, chaud' },
      { qty: '150', unit: 'ml', name: 'vin blanc sec' },
      { qty: '1', unit: '', name: 'oignon, finement ciselé' },
      { qty: '2', unit: 'gousses', name: 'ail, émincé' },
      { qty: '80', unit: 'g', name: 'parmesan finement râpé' },
      { qty: '50', unit: 'g', name: 'beurre froid en dés (mantecatura)' },
      { qty: '3', unit: 'c. à s.', name: 'huile d\'olive' },
      { qty: '1', unit: 'c. à c.', name: 'huile de truffe noire (facultatif)' },
      { qty: '', unit: '', name: 'sel, poivre, persil plat ciselé' }
    ],
    steps: [
      {
        title: 'Faire sauter les champignons',
        text: 'Faites revenir les champignons à feu vif dans 2 cuillères d\'huile en deux fois pour ne pas les faire bouillir. Ils doivent être bien dorés. Assaisonnez et réservez. Ne jetez pas leur eau de végétation — filtrez-la et ajoutez-la au bouillon.'
      },
      {
        title: 'Nacrer le riz',
        text: 'Dans une grande sauteuse, faites revenir l\'oignon dans l\'huile restante jusqu\'à translucidité. Ajoutez le riz et faites-le nacrer 2 minutes en remuant constamment jusqu\'à ce qu\'il soit translucide et légèrement grillé autour des bords. Versez le vin blanc et laissez-le absorber complètement.'
      },
      {
        title: 'Ajouter le bouillon louche par louche',
        text: 'Versez une louche de bouillon chaud sur le riz. Remuez constamment à feu moyen jusqu\'à absorption complète. Répétez pendant 18 à 20 minutes. Le riz doit être crémeux et al dente (légèrement ferme au cœur). N\'arrêtez jamais de remuer — c\'est ce qui libère l\'amidon.'
      },
      {
        title: 'Mantecatura — l\'émulsion finale',
        text: 'Retirez la sauteuse du feu. Incorporez le beurre froid en dés et le parmesan râpé en remuant vivement. Le risotto doit couler légèrement en vague quand on secoue la sauteuse — c\'est la bonne consistance. Ajoutez les champignons et l\'huile de truffe si désiré.'
      },
      {
        title: 'Reposer et dresser',
        text: 'Couvrez et laissez reposer 1 minute. Le risotto va légèrement épaissir. Dressez aussitôt dans des assiettes creuses chaudes. Parsemez de persil frais et de copeaux de parmesan. Le risotto ne supporte pas l\'attente — servez immédiatement.'
      }
    ],
    nutrition: { glucides: 58, proteines: 14, lipides: 14, fibres: 3 }
  },

  {
    id: 17, slug: 'pizza-napolitaine',
    title: 'Pizza napolitaine maison',
    description: 'Pâte fermentée 48 h, sauce tomate San Marzano, mozzarella di bufala. Four à 280 °C minimum. Léopardisation parfaite.',
    author: 'Lucas P.', authorType: 'user', authorAvatar: 'Lucas Perrier',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
    category: 'plats',
    tags: ['italien', 'pizza', 'fermentation', 'napolitain'],
    prepTime: 30, cookTime: 8, totalTime: 2918,
    difficulty: 'moyen', calories: 480, servings: 2,
    rating: 4.8, ratingCount: 512, featured: true,
    status: 'published', createdAt: '2026-03-28T10:00:00Z',
    ingredients: [
      { qty: '500', unit: 'g', name: 'farine 00 (ou T45)' },
      { qty: '325', unit: 'ml', name: 'eau tempérée' },
      { qty: '10', unit: 'g', name: 'sel fin' },
      { qty: '2', unit: 'g', name: 'levure sèche de boulanger' },
      { qty: '400', unit: 'g', name: 'tomates San Marzano entières pelées' },
      { qty: '250', unit: 'g', name: 'mozzarella di bufala, bien égouttée' },
      { qty: '1', unit: 'poignée', name: 'feuilles de basilic frais' },
      { qty: '2', unit: 'c. à s.', name: 'huile d\'olive extra-vierge' },
      { qty: '1', unit: 'c. à c.', name: 'sel pour la sauce' }
    ],
    steps: [
      {
        title: 'Préparer la pâte et fermentation longue',
        text: 'Dissoudre la levure dans l\'eau. Mélangez farine et sel, ajoutez l\'eau progressivement. Pétrissez 10 minutes jusqu\'à pâte lisse et élastique. Divisez en 2 pâtons, filmez individuellement et réfrigérez 48 heures minimum. La fermentation lente développe les arômes et la légèreté.'
      },
      {
        title: 'Préparer la sauce San Marzano',
        text: 'Écrasez grossièrement les tomates San Marzano à la main dans un bol. Assaisonnez d\'une bonne pincée de sel et d\'un filet d\'huile d\'olive. Pas de cuisson — la sauce tomate crue cuit directement sur la pizza au four. Égouttez bien la mozzarella sur du papier absorbant.'
      },
      {
        title: 'Étaler la pâte à la main',
        text: 'Sortez les pâtons du frigo 2 heures avant. Sur un plan légèrement fariné, aplatissez le pâton du centre vers les bords avec les paumes en tournant. Ne jamais utiliser de rouleau — il écrase les bulles de fermentation. Le bord (cornicione) doit être plus épais que le centre.'
      },
      {
        title: 'Garnir et cuire à très haute température',
        text: 'Préchauffez le four au maximum (280 °C ou plus avec une pierre à pizza préchauffée 1 heure). Étalez une fine couche de sauce tomate, déposez la mozzarella en morceaux. Enfournez sur la pierre ou la plaque chaude 6 à 8 minutes jusqu\'à bords levés et tachetés (léopardisation).'
      },
      {
        title: 'Finir et servir',
        text: 'Sortez la pizza et déposez immédiatement les feuilles de basilic frais. Un filet d\'huile d\'olive de qualité termine le tout. La pizza napolitaine se sert souple, pas croustillante comme une pizza romaine. Mangez dans les 3 minutes qui suivent la sortie du four.'
      }
    ],
    nutrition: { glucides: 72, proteines: 22, lipides: 14, fibres: 4 }
  },

  {
    id: 18, slug: 'tiramisu-classique',
    title: 'Tiramisu classique à l\'italienne',
    description: 'Mascarpone, jaunes d\'œufs, sucre, café espresso et savoiardi. Sans crème fraîche. La recette de la nonna.',
    author: 'Nina T.', authorType: 'user', authorAvatar: 'Nina Théodore',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80',
    category: 'desserts',
    tags: ['italien', 'café', 'classique', 'sans gluten possible'],
    prepTime: 25, cookTime: 0, totalTime: 265,
    difficulty: 'moyen', calories: 390, servings: 6,
    rating: 4.7, ratingCount: 189, featured: false,
    status: 'published', createdAt: '2026-03-20T10:00:00Z',
    ingredients: [
      { qty: '500', unit: 'g', name: 'mascarpone, à température ambiante' },
      { qty: '5', unit: '', name: 'œufs, séparés (jaunes + blancs)' },
      { qty: '120', unit: 'g', name: 'sucre en poudre' },
      { qty: '300', unit: 'ml', name: 'café espresso fort, refroidi' },
      { qty: '30', unit: 'savoiardi', name: '(boudoirs / biscuits à la cuillère)' },
      { qty: '2', unit: 'c. à s.', name: 'marsala ou rhum ambré (facultatif)' },
      { qty: '2', unit: 'c. à s.', name: 'cacao en poudre non sucré, pour saupoudrer' },
      { qty: '1', unit: 'pincée', name: 'sel fin' }
    ],
    steps: [
      {
        title: 'Blanchir les jaunes avec le sucre',
        text: 'Fouettez les jaunes d\'œufs avec le sucre jusqu\'à ce que le mélange soit pâle, épais et forme le ruban. Ajoutez le mascarpone en deux fois et mélangez délicatement jusqu\'à obtenir une crème lisse et homogène sans grumeaux.'
      },
      {
        title: 'Monter et incorporer les blancs',
        text: 'Montez les blancs avec une pincée de sel en neige ferme. Incorporez-les à la crème mascarpone en trois fois avec des gestes amples et enveloppants. La crème doit être légère et aérienne — c\'est ce qui donne la texture caractéristique du tiramisu authentique.'
      },
      {
        title: 'Préparer le café et tremper les biscuits',
        text: 'Mélangez le café refroidi avec le marsala si vous l\'utilisez. Trempez rapidement chaque savoiardo dans le café (1 à 2 secondes de chaque côté) — ils doivent être imbibés mais pas détrempés ni mous. Travaillez rapidement.'
      },
      {
        title: 'Monter le tiramisu et réfrigérer',
        text: 'Dans un plat rectangulaire, disposez une couche de biscuits imbibés. Couvrez généreusement de crème mascarpone. Répétez avec une deuxième couche de biscuits et terminez par la crème. Filmez et réfrigérez au minimum 4 heures, idéalement toute une nuit.'
      },
      {
        title: 'Finir et servir',
        text: 'Juste avant de servir, saupoudrez généreusement de cacao en poudre passé au tamis fin pour une couche uniforme. Servez à la cuillère directement dans le plat. Le tiramisu se conserve 2 jours au réfrigérateur.'
      }
    ],
    nutrition: { glucides: 36, proteines: 10, lipides: 22, fibres: 1 }
  },

  {
    id: 19, slug: 'tartiflette-savoyarde',
    title: 'Tartiflette savoyarde',
    description: 'Pommes de terre fondantes, lardons, oignons et reblochon entier fondu. Le plat emblématique des stations de ski savoyardes.',
    author: 'Marco V.', authorType: 'user', authorAvatar: 'Marco Vespa',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80',
    category: 'plats',
    tags: ['savoyard', 'fromage', 'hiver', 'réconfort'],
    prepTime: 20, cookTime: 40, totalTime: 60,
    difficulty: 'facile', calories: 640, servings: 4,
    rating: 4.8, ratingCount: 367, featured: false,
    status: 'published', createdAt: '2026-01-15T10:00:00Z',
    ingredients: [
      { qty: '1.2', unit: 'kg', name: 'pommes de terre à chair ferme (Charlotte ou Amandine)' },
      { qty: '1', unit: '', name: 'reblochon entier (environ 500 g)' },
      { qty: '200', unit: 'g', name: 'lardons fumés' },
      { qty: '2', unit: '', name: 'oignons, émincés' },
      { qty: '150', unit: 'ml', name: 'vin blanc de Savoie (Apremont ou Chignin)' },
      { qty: '150', unit: 'ml', name: 'crème fraîche épaisse' },
      { qty: '1', unit: 'gousse', name: 'ail, pour frotter le plat' },
      { qty: '1', unit: 'noix', name: 'beurre' },
      { qty: '', unit: '', name: 'sel, poivre noir du moulin' }
    ],
    steps: [
      {
        title: 'Cuire les pommes de terre',
        text: 'Faites cuire les pommes de terre entières dans l\'eau salée 20 minutes — elles doivent être juste tendres, pas éclatées. Égouttez, laissez refroidir légèrement puis pelez et coupez en rondelles épaisses de 5 mm.'
      },
      {
        title: 'Faire revenir lardons et oignons',
        text: 'Dans une grande poêle, faites rissoler les lardons jusqu\'à ce qu\'ils soient bien dorés. Ajoutez les oignons et faites-les fondre 10 minutes jusqu\'à légère caramélisation. Déglacez avec le vin blanc, laissez réduire 3 minutes. Retirez du feu.'
      },
      {
        title: 'Préparer le plat',
        text: 'Préchauffez le four à 190 °C. Frottez un plat à gratin avec la gousse d\'ail coupée, puis beurrez-le. Disposez la moitié des pommes de terre, couvrez avec le mélange lardons-oignons, puis terminez avec le reste des pommes de terre. Versez la crème fraîche, assaisonnez.'
      },
      {
        title: 'Couronner du reblochon et gratiner',
        text: 'Coupez le reblochon en deux dans l\'épaisseur pour obtenir deux disques. Posez-les croûte vers le haut sur les pommes de terre. Enfournez 25 minutes jusqu\'à ce que le fromage soit complètement fondu, bouillonnant et bien doré. Servez immédiatement avec une salade verte.'
      }
    ],
    nutrition: { glucides: 44, proteines: 26, lipides: 38, fibres: 4 }
  },

  {
    id: 20, slug: 'coq-au-vin-rouge',
    title: 'Coq au vin rouge',
    description: 'Poulet mijoté dans un vin rouge de Bourgogne avec lardons, champignons et petits oignons grelots. La version grand-mère.',
    author: 'Léa B.', authorType: 'user', authorAvatar: 'Léa Bernard',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
    category: 'plats',
    tags: ['français', 'classique', 'vin rouge', 'hiver'],
    prepTime: 25, cookTime: 75, totalTime: 100,
    difficulty: 'moyen', calories: 520, servings: 4,
    rating: 4.8, ratingCount: 298, featured: false,
    status: 'published', createdAt: '2026-02-10T10:00:00Z',
    ingredients: [
      { qty: '1', unit: '', name: 'poulet fermier découpé en 8 morceaux' },
      { qty: '750', unit: 'ml', name: 'vin rouge de Bourgogne (pinot noir)' },
      { qty: '150', unit: 'g', name: 'lardons fumés' },
      { qty: '200', unit: 'g', name: 'champignons de Paris, coupés en quartiers' },
      { qty: '16', unit: '', name: 'petits oignons grelots, pelés' },
      { qty: '2', unit: 'gousses', name: 'ail' },
      { qty: '1', unit: '', name: 'bouquet garni' },
      { qty: '2', unit: 'c. à s.', name: 'concentré de tomate' },
      { qty: '2', unit: 'c. à s.', name: 'farine' },
      { qty: '2', unit: 'c. à s.', name: 'cognac' },
      { qty: '30', unit: 'g', name: 'beurre' },
      { qty: '', unit: '', name: 'sel et poivre du moulin' }
    ],
    steps: [
      {
        title: 'Faire revenir les lardons et les légumes',
        text: 'Dans une grande cocotte, faites revenir les lardons sans matière grasse. Retirez-les. Dans le même gras, faites dorer les oignons grelots et les champignons 5 minutes. Réservez séparément. Faites fondre le beurre et faites dorer les morceaux de poulet bien séchés sur toutes leurs faces.'
      },
      {
        title: 'Flamber au cognac',
        text: 'Versez le cognac sur le poulet doré et flambez à l\'aide d\'une allumette (ou d\'un long briquet). Attendez que les flammes s\'éteignent d\'elles-mêmes. Le flambage brûle l\'alcool et apporte une nuance caramélisée au fond de sauce.'
      },
      {
        title: 'Construire la sauce',
        text: 'Saupoudrez les morceaux de farine, remuez 1 minute. Ajoutez le concentré de tomate, l\'ail écrasé et le bouquet garni. Versez le vin rouge et remuez pour décoller les sucs. Portez à frémissement. La sauce doit couvrir les trois quarts des morceaux.'
      },
      {
        title: 'Mijoter à couvert',
        text: 'Couvrez et laissez mijoter à feu très doux 45 minutes. Ajoutez les lardons, les oignons et les champignons réservés. Continuez la cuisson 20 minutes jusqu\'à ce que la viande soit tendre et se détache bien de l\'os. Rectifiez l\'assaisonnement et retirez le bouquet garni.'
      }
    ],
    nutrition: { glucides: 12, proteines: 44, lipides: 28, fibres: 2 }
  },

  {
    id: 21, slug: 'gateau-chocolat-fondant',
    title: 'Gâteau au chocolat fondant',
    description: 'Cœur coulant garanti si on respecte la cuisson de 11 minutes. Chocolat 70%, beurre de qualité. La recette inratable.',
    author: 'Sophie M.', authorType: 'user', authorAvatar: 'Sophie Martin',
    image: 'https://images.unsplash.com/photo-1511715282680-fbf93a50e721?w=600&q=80',
    category: 'desserts',
    tags: ['chocolat', 'rapide', 'restaurant', 'coulant'],
    prepTime: 10, cookTime: 11, totalTime: 25,
    difficulty: 'facile', calories: 450, servings: 8,
    rating: 4.9, ratingCount: 421, featured: false,
    status: 'published', createdAt: '2026-04-10T10:00:00Z',
    ingredients: [
      { qty: '200', unit: 'g', name: 'chocolat noir 70%' },
      { qty: '150', unit: 'g', name: 'beurre doux + un peu pour les moules' },
      { qty: '4', unit: '', name: 'œufs entiers' },
      { qty: '4', unit: '', name: 'jaunes d\'œufs' },
      { qty: '120', unit: 'g', name: 'sucre glace' },
      { qty: '60', unit: 'g', name: 'farine T55' },
      { qty: '1', unit: 'pincée', name: 'fleur de sel' },
      { qty: '', unit: '', name: 'cacao en poudre pour les moules' }
    ],
    steps: [
      {
        title: 'Préparer et tempérer le chocolat',
        text: 'Faites fondre le chocolat et le beurre au bain-marie en remuant. Le mélange doit être lisse et à 40 °C. Laissez tiédir. Si vous préparez à l\'avance, vous pouvez réfrigérer la pâte jusqu\'à 24 heures.'
      },
      {
        title: 'Fouetter les œufs',
        text: 'Fouettez vigoureusement les œufs entiers, les jaunes et le sucre glace jusqu\'à ce que le mélange blanchisse et triple de volume (environ 3 minutes). Cette étape est essentielle pour la légèreté du fondant.'
      },
      {
        title: 'Assembler la pâte',
        text: 'Versez le chocolat fondu tiède sur les œufs fouettés en mélangeant délicatement à la spatule. Incorporez la farine tamisée et la fleur de sel en deux fois. Ne travaillez pas trop la pâte.'
      },
      {
        title: 'Cuire 11 minutes précisément',
        text: 'Préchauffez le four à 200 °C. Beurrez et cacaotez des ramequins individuels. Remplissez aux trois quarts. Enfournez exactement 11 minutes — les bords doivent être pris et le centre encore légèrement tremblotant. Démoulez aussitôt sur l\'assiette et servez avec une glace vanille.'
      }
    ],
    nutrition: { glucides: 38, proteines: 7, lipides: 26, fibres: 2 }
  },

  {
    id: 22, slug: 'spaghetti-carbonara',
    title: 'Spaghetti à la carbonara authentique',
    description: 'La vraie carbonara romaine : guanciale, pecorino, œufs entiers et poivre noir. Absolument sans crème. Choc thermique maîtrisé.',
    author: 'David R.', authorType: 'user', authorAvatar: 'David Roux',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80',
    category: 'plats',
    tags: ['italien', 'pâtes', 'rapide', 'romain'],
    prepTime: 10, cookTime: 15, totalTime: 25,
    difficulty: 'facile', calories: 560, servings: 2,
    rating: 4.8, ratingCount: 389, featured: false,
    status: 'published', createdAt: '2026-04-15T10:00:00Z',
    ingredients: [
      { qty: '200', unit: 'g', name: 'spaghetti de bonne qualité (Rummo ou De Cecco)' },
      { qty: '120', unit: 'g', name: 'guanciale (joue de porc) ou pancetta' },
      { qty: '3', unit: '', name: 'jaunes d\'œufs + 1 œuf entier' },
      { qty: '80', unit: 'g', name: 'pecorino romano finement râpé' },
      { qty: '30', unit: 'g', name: 'parmesan râpé' },
      { qty: '1', unit: 'c. à c.', name: 'poivre noir concassé grossièrement' },
      { qty: '', unit: '', name: 'eau de cuisson des pâtes (généreusement salée)' }
    ],
    steps: [
      {
        title: 'Préparer la crème d\'œufs et fromage',
        text: 'Dans un bol, mélangez les jaunes, l\'œuf entier, le pecorino et le parmesan. Poivrez généreusement. Détendez avec 2 à 3 cuillères d\'eau de cuisson froide pour obtenir une crème fluide. Cette sauce ne cuit jamais directement sur le feu — la chaleur des pâtes suffit.'
      },
      {
        title: 'Rissoler le guanciale',
        text: 'Coupez le guanciale en lardons. Faites-les rissoler à feu moyen dans une grande poêle sans huile. Le guanciale doit être croustillant à l\'extérieur et fondant à l\'intérieur. Laissez son gras fondu dans la poêle, c\'est votre sauce. Éteignez le feu.'
      },
      {
        title: 'Cuire les pâtes al dente',
        text: 'Cuisez les spaghetti dans une grande quantité d\'eau généreusement salée (comme la mer). Égouttez 1 minute avant la fin indiquée sur le paquet — ils finissent de cuire dans la poêle. Réservez 200 ml d\'eau de cuisson amidonnée.'
      },
      {
        title: 'Manier le choc thermique',
        text: 'Versez les pâtes égouttées dans la poêle avec le guanciale. Mélangez hors du feu 30 secondes en ajoutant 3 à 4 cuillères d\'eau de cuisson. Laissez refroidir 30 secondes puis versez la crème d\'œufs. Remuez vivement et rapidement en ajoutant de l\'eau au besoin — la sauce doit être crémeuse, soyeuse, jamais brouillée.'
      }
    ],
    nutrition: { glucides: 68, proteines: 26, lipides: 24, fibres: 3 }
  },

  {
    id: 23, slug: 'tabbouleh-libanais',
    title: 'Taboulé libanais authentique',
    description: 'Persil plat ciselé fin, tomates, boulgour minimal, menthe fraîche et citron. Le taboulé libanais est une salade de persil, pas de semoule.',
    author: 'Yasmine K.', authorType: 'user', authorAvatar: 'Yasmine Khalil',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    category: 'entrées',
    tags: ['libanais', 'végétarien', 'vegan', 'fraîcheur'],
    prepTime: 25, cookTime: 0, totalTime: 55,
    difficulty: 'facile', calories: 180, servings: 4,
    rating: 4.7, ratingCount: 156, featured: false,
    status: 'published', createdAt: '2026-03-05T10:00:00Z',
    ingredients: [
      { qty: '3', unit: 'bouquets', name: 'persil plat, feuilles uniquement' },
      { qty: '1/2', unit: 'bouquet', name: 'menthe fraîche, feuilles uniquement' },
      { qty: '3', unit: '', name: 'tomates fermes, épépinées et en petits dés' },
      { qty: '3', unit: 'c. à s.', name: 'boulgour fin' },
      { qty: '4', unit: '', name: 'ciboules, émincées finement' },
      { qty: '80', unit: 'ml', name: 'jus de citron frais' },
      { qty: '60', unit: 'ml', name: 'huile d\'olive extra-vierge' },
      { qty: '1/4', unit: 'c. à c.', name: 'cannelle moulue' },
      { qty: '1/4', unit: 'c. à c.', name: 'poivre de la Jamaïque' },
      { qty: '', unit: '', name: 'sel fin' }
    ],
    steps: [
      {
        title: 'Hydrater le boulgour',
        text: 'Versez le boulgour fin dans un bol avec le jus de citron. Laissez-le s\'hydrater 30 minutes — il doit absorber le citron et gonfler légèrement. Dans un vrai taboulé libanais, le boulgour est un condiment, pas la base.'
      },
      {
        title: 'Préparer le persil',
        text: 'Lavez et séchez soigneusement le persil. Retirez toutes les tiges épaisses — ne conservez que les feuilles. Hachez très finement au couteau (jamais au mixeur) en petits dés réguliers. La finesse de la coupe est le secret d\'une bonne texture.'
      },
      {
        title: 'Préparer les tomates',
        text: 'Coupez les tomates en petits dés d\'environ 5 mm, épépinez-les soigneusement. Salez légèrement et laissez-les dégorger 15 minutes dans une passoire pour enlever l\'excès d\'eau qui diluerait la salade.'
      },
      {
        title: 'Assembler et assaisonner',
        text: 'Mélangez le boulgour citronné avec le persil, la menthe ciselée, les tomates égouttées et les ciboules. Ajoutez l\'huile d\'olive, la cannelle et le poivre de la Jamaïque. Goûtez et rectifiez l\'assaisonnement en sel et citron. Réfrigérez 20 minutes avant de servir avec du pain pita.'
      }
    ],
    nutrition: { glucides: 20, proteines: 4, lipides: 12, fibres: 5 }
  },

  {
    id: 24, slug: 'salmon-teriyaki',
    title: 'Saumon teriyaki',
    description: 'Filets de saumon laqués à la sauce teriyaki maison — soja, mirin et miel. Caramélisation parfaite à la poêle, servi avec riz japonais.',
    author: 'Emma C.', authorType: 'user', authorAvatar: 'Emma Collin',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80',
    category: 'plats',
    tags: ['japonais', 'saumon', 'rapide', 'sain'],
    prepTime: 10, cookTime: 15, totalTime: 40,
    difficulty: 'facile', calories: 380, servings: 2,
    rating: 4.7, ratingCount: 213, featured: false,
    status: 'published', createdAt: '2026-04-01T10:00:00Z',
    ingredients: [
      { qty: '2', unit: 'filets', name: 'saumon (150 g chacun), peau dessous' },
      { qty: '3', unit: 'c. à s.', name: 'sauce soja (tamari pour sans gluten)' },
      { qty: '2', unit: 'c. à s.', name: 'mirin (vin de riz japonais)' },
      { qty: '1', unit: 'c. à s.', name: 'miel' },
      { qty: '1', unit: 'c. à c.', name: 'huile de sésame toasté' },
      { qty: '1', unit: 'c. à c.', name: 'gingembre frais râpé' },
      { qty: '1', unit: 'gousse', name: 'ail râpé' },
      { qty: '1', unit: 'c. à s.', name: 'huile neutre' },
      { qty: '', unit: '', name: 'graines de sésame et ciboule, pour garnir' }
    ],
    steps: [
      {
        title: 'Préparer la marinade teriyaki',
        text: 'Mélangez la sauce soja, le mirin, le miel, l\'huile de sésame, le gingembre et l\'ail dans un bol. Cette sauce est à la fois la marinade et le glaçage — la magie du teriyaki vient de la caramélisation du sucre naturel du mirin et du miel.'
      },
      {
        title: 'Mariner le saumon',
        text: 'Versez la moitié de la marinade sur les filets de saumon dans un plat. Laissez mariner 20 à 30 minutes au réfrigérateur. Réservez l\'autre moitié pour le glaçage à la cuisson.'
      },
      {
        title: 'Cuire et laquer le saumon',
        text: 'Chauffez l\'huile dans une poêle antiadhésive à feu moyen-fort. Posez les filets côté peau, cuisez 4 minutes. Retournez, versez la marinade réservée. Faites cuire encore 3 à 4 minutes en arrosant sans cesse avec la sauce qui va épaissir et former un glaçage brillant et caramélisé.'
      },
      {
        title: 'Dresser et servir',
        text: 'Posez chaque filet sur un lit de riz japonais à grain court cuit à la vapeur. Nappez du reste de sauce de la poêle. Parsemez de graines de sésame et de ciboule ciselée. Accompagnez d\'épinards sautés ou de brocolis au sésame.'
      }
    ],
    nutrition: { glucides: 18, proteines: 34, lipides: 16, fibres: 1 }
  },

  {
    id: 25, slug: 'gateau-yaourt',
    title: 'Gâteau au yaourt de mamie',
    description: 'La recette emblématique du gâteau au yaourt mesurée avec le pot. Moelleux, simple et inratable. Le premier gâteau des enfants.',
    author: 'Camille D.', authorType: 'user', authorAvatar: 'Camille Dubois',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
    category: 'desserts',
    tags: ['simple', 'goûter', 'enfants', 'basique'],
    prepTime: 10, cookTime: 35, totalTime: 45,
    difficulty: 'facile', calories: 280, servings: 8,
    rating: 4.8, ratingCount: 892, featured: false,
    status: 'published', createdAt: '2026-04-22T10:00:00Z',
    ingredients: [
      { qty: '1', unit: 'pot', name: 'yaourt nature (125 g) — le pot sert de mesure' },
      { qty: '2', unit: 'pots', name: 'sucre en poudre' },
      { qty: '3', unit: 'pots', name: 'farine' },
      { qty: '1', unit: 'pot', name: 'huile neutre (tournesol)' },
      { qty: '1/2', unit: 'pot', name: 'lait' },
      { qty: '3', unit: '', name: 'œufs' },
      { qty: '1', unit: 'sachet', name: 'levure chimique' },
      { qty: '1', unit: 'c. à c.', name: 'extrait de vanille' },
      { qty: '1', unit: '', name: 'zeste de citron (facultatif)' }
    ],
    steps: [
      {
        title: 'Mélanger les ingrédients humides',
        text: 'Préchauffez le four à 180 °C. Dans un grand saladier, versez le yaourt. Utilisez le pot vide comme mesure pour tous les ingrédients suivants. Ajoutez les œufs, l\'huile, le sucre, la vanille et le zeste de citron. Fouettez jusqu\'à mélange homogène.'
      },
      {
        title: 'Incorporer les ingrédients secs',
        text: 'Tamisez la farine avec la levure et incorporez-les en deux fois dans la préparation en mélangeant. Ajoutez le lait pour assouplir la pâte si nécessaire. La pâte doit être lisse, fluide, sans grumeaux.'
      },
      {
        title: 'Cuire et vérifier',
        text: 'Versez dans un moule à manqué de 22 cm beurré et fariné. Enfournez 30 à 35 minutes. Le gâteau est cuit quand une pique en ressort propre et que le dessus est bien doré. Si le dessus dore trop vite, couvrez d\'aluminium en cours de cuisson.'
      },
      {
        title: 'Démouler et servir',
        text: 'Laissez refroidir 10 minutes avant de démouler sur une grille. Servez nature, saupoudré de sucre glace, ou garni de confiture. Ce gâteau se conserve 3 jours dans une boîte hermétique et reste très moelleux.'
      }
    ],
    nutrition: { glucides: 42, proteines: 6, lipides: 10, fibres: 1 }
  },

  /* ========================================================
     RECETTES EN ATTENTE DE MODÉRATION  (ids 26–28)
     ======================================================== */

  {
    id: 26, slug: 'crumble-pomme-noisette',
    title: 'Crumble pomme et noisette',
    description: 'Pommes fondantes sous un crumble croustillant aux noisettes torréfiées et beurre salé. Simple, réconfortant, parfait à toute saison.',
    author: 'Nina T.', authorType: 'user', authorAvatar: 'Nina Théodore',
    image: 'https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?w=600&q=80',
    category: 'desserts',
    tags: ['automne', 'pommes', 'noisettes', 'réconfort'],
    prepTime: 15, cookTime: 35, totalTime: 50,
    difficulty: 'facile', calories: 310, servings: 6,
    rating: 0, ratingCount: 0, featured: false,
    status: 'pending', createdAt: '2026-05-03T14:22:00Z',
    ingredients: [
      { qty: '1', unit: 'kg', name: 'pommes (Granny Smith ou Boskoop)' },
      { qty: '2', unit: 'c. à s.', name: 'sucre roux' },
      { qty: '1', unit: 'c. à c.', name: 'cannelle moulue' },
      { qty: '1', unit: 'c. à c.', name: 'extrait de vanille' },
      { qty: '120', unit: 'g', name: 'farine T55' },
      { qty: '100', unit: 'g', name: 'beurre demi-sel froid, en dés' },
      { qty: '80', unit: 'g', name: 'cassonade' },
      { qty: '80', unit: 'g', name: 'noisettes entières, torréfiées et concassées' },
      { qty: '30', unit: 'g', name: 'flocons d\'avoine' }
    ],
    steps: [
      {
        title: 'Préparer les pommes',
        text: 'Pelez, épépinez et coupez les pommes en cubes de 2 cm. Mélangez-les avec le sucre roux, la cannelle et la vanille. Disposez-les dans un plat à gratin beurré de 22 cm. Les pommes vont fondre et créer un jus parfumé sous le crumble.'
      },
      {
        title: 'Confectionner le crumble aux noisettes',
        text: 'Du bout des doigts, sablez rapidement la farine avec le beurre froid jusqu\'à texture de miettes grossières. Incorporez la cassonade, les noisettes concassées et les flocons d\'avoine. Ne travaillez pas trop pour garder des morceaux de taille variable — c\'est ce qui donne le croustillant caractéristique.'
      },
      {
        title: 'Assembler et cuire',
        text: 'Préchauffez le four à 180 °C. Répartissez le crumble uniformément sur les pommes sans tasser. Enfournez 30 à 35 minutes jusqu\'à ce que le crumble soit bien doré et croustillant et que les pommes bouillonnent sur les bords.'
      },
      {
        title: 'Servir tiède',
        text: 'Laissez reposer 5 minutes avant de servir directement dans le plat. Accompagnez d\'une boule de glace vanille, d\'un nuage de crème chantilly ou d\'une cuillère de crème fraîche épaisse. Le contraste chaud-froid est irrésistible.'
      }
    ],
    nutrition: { glucides: 44, proteines: 4, lipides: 14, fibres: 4 }
  },

  {
    id: 27, slug: 'brioche-maison',
    title: 'Brioche maison filante',
    description: 'Pâte enrichie au beurre et aux œufs, mie filante et dorée, parfumée à la fleur d\'oranger. Le week-end commence ici.',
    author: 'Pierre A.', authorType: 'user', authorAvatar: 'Pierre Arnaud',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
    category: 'boulangerie',
    tags: ['boulangerie', 'viennoiserie', 'beurre', 'week-end'],
    prepTime: 30, cookTime: 30, totalTime: 510,
    difficulty: 'moyen', calories: 320, servings: 10,
    rating: 0, ratingCount: 0, featured: false,
    status: 'pending', createdAt: '2026-05-04T09:15:00Z',
    ingredients: [
      { qty: '400', unit: 'g', name: 'farine de gruau T45' },
      { qty: '7', unit: 'g', name: 'levure sèche de boulanger' },
      { qty: '8', unit: 'g', name: 'sel fin' },
      { qty: '60', unit: 'g', name: 'sucre en poudre' },
      { qty: '4', unit: '', name: 'œufs entiers, à température ambiante' },
      { qty: '60', unit: 'ml', name: 'lait tiède' },
      { qty: '200', unit: 'g', name: 'beurre doux mou, en petits dés' },
      { qty: '1', unit: 'c. à s.', name: 'eau de fleur d\'oranger' },
      { qty: '1', unit: '', name: 'jaune d\'œuf + 1 c. à s. de crème (dorure)' }
    ],
    steps: [
      {
        title: 'Préparer et pétrir la pâte',
        text: 'Dissoudre la levure dans le lait tiède. Dans le bol du robot avec le crochet, mélangez farine, sel et sucre. Ajoutez les œufs et le lait-levure. Pétrissez 10 minutes à vitesse moyenne jusqu\'à pâte lisse et élastique qui se décolle des parois.'
      },
      {
        title: 'Incorporer le beurre progressivement',
        text: 'Ajoutez le beurre mou en 4 à 5 fois, en attendant que chaque ajout soit bien incorporé avant le suivant. Cette étape prend 10 à 15 minutes. La pâte finale doit être brillante, souple et légèrement collante. Ajoutez la fleur d\'oranger à la fin.'
      },
      {
        title: 'Première pousse et façonnage',
        text: 'Placez la pâte dans un bol fariné, couvrez et laissez pousser 1 h 30 à température ambiante jusqu\'à doublement du volume. Dégazez, façonnez en boules. Disposez dans un moule à cake beurré. Couvrez et laissez pousser à nouveau 1 h 30 jusqu\'à ce que la pâte déborde légèrement du moule.'
      },
      {
        title: 'Dorer et cuire',
        text: 'Préchauffez le four à 175 °C. Badigeonnez délicatement la brioche de la dorure (jaune + crème) avec un pinceau. Snipez la surface aux ciseaux pour le décor. Enfournez 25 à 30 minutes jusqu\'à beau brun doré. Démoulez et laissez refroidir sur grille avant de trancher.'
      }
    ],
    nutrition: { glucides: 38, proteines: 7, lipides: 14, fibres: 1 }
  },

  {
    id: 28, slug: 'shakshuka-israelien',
    title: 'Shakshuka aux épices du Moyen-Orient',
    description: 'Œufs pochés dans une sauce tomate épicée aux poivrons, cumin et paprika fumé. Le brunch du Maghreb et d\'Israël.',
    author: 'Sara B.', authorType: 'user', authorAvatar: 'Sara Benchikh',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&q=80',
    category: 'plats',
    tags: ['maghrébin', 'israélien', 'végétarien', 'brunch'],
    prepTime: 10, cookTime: 25, totalTime: 35,
    difficulty: 'facile', calories: 240, servings: 2,
    rating: 0, ratingCount: 0, featured: false,
    status: 'pending', createdAt: '2026-05-05T08:40:00Z',
    ingredients: [
      { qty: '4', unit: '', name: 'œufs frais' },
      { qty: '400', unit: 'g', name: 'tomates concassées en boîte (ou fraîches en saison)' },
      { qty: '2', unit: '', name: 'poivrons rouges, en dés' },
      { qty: '1', unit: '', name: 'oignon, émincé' },
      { qty: '3', unit: 'gousses', name: 'ail, émincées' },
      { qty: '1', unit: 'c. à c.', name: 'cumin moulu' },
      { qty: '1', unit: 'c. à c.', name: 'paprika fumé' },
      { qty: '1/2', unit: 'c. à c.', name: 'piment de Cayenne (selon tolérance)' },
      { qty: '2', unit: 'c. à s.', name: 'huile d\'olive' },
      { qty: '1', unit: 'bouquet', name: 'coriandre ou persil frais' },
      { qty: '', unit: '', name: 'sel et pain pita ou pain plat pour servir' }
    ],
    steps: [
      {
        title: 'Faire revenir les aromates',
        text: 'Chauffez l\'huile d\'olive dans une grande poêle ou sauteuse à fond épais. Faites fondre l\'oignon 5 minutes à feu moyen. Ajoutez les poivrons en dés et faites revenir encore 5 minutes. Incorporez l\'ail, le cumin, le paprika fumé et le piment. Faites sauter 1 minute en remuant — les épices doivent embaumer la cuisine.'
      },
      {
        title: 'Construire la sauce tomate',
        text: 'Versez les tomates concassées sur les légumes épicés. Salez, mélangez et portez à frémissement. Laissez mijoter 10 à 12 minutes à feu moyen-doux en remuant régulièrement jusqu\'à ce que la sauce épaississe légèrement. Elle doit être dense mais fluide.'
      },
      {
        title: 'Pocher les œufs dans la sauce',
        text: 'Creusez 4 petits nids dans la sauce avec le dos d\'une cuillère. Cassez délicatement un œuf dans chaque nid. Couvrez la poêle et laissez cuire 5 à 7 minutes selon la fermeté désirée — le blanc doit être pris mais le jaune encore coulant.'
      },
      {
        title: 'Garnir et servir directement',
        text: 'Parsemez généreusement de coriandre ou persil frais ciselé. Servez immédiatement à table dans la poêle de cuisson avec du pain pita chaud ou du pain plat pour saucer. Un filet d\'huile d\'olive en finition et quelques flocons de piment pour les amateurs.'
      }
    ],
    nutrition: { glucides: 22, proteines: 14, lipides: 12, fibres: 5 }
  }

];

/* ========== VUES FILTRÉES ========== */

const PUBLISHED_RECIPES = RECIPES_DB.filter(r => r.status === 'published');
const PENDING_RECIPES   = RECIPES_DB.filter(r => r.status === 'pending');

/* ========== HELPERS ========== */

/** Filtre par catégorie */
function getByCategory(cat) {
  return PUBLISHED_RECIPES.filter(r => r.category === cat);
}

/** Recettes en vedette */
const FEATURED_RECIPES = PUBLISHED_RECIPES.filter(r => r.featured);

/** Arrondi à la centaine */
function roundHundred(n) { return n < 100 ? n : Math.round(n / 100) * 100; }

/* Met à jour les data-stat sur la page courante */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-stat="recipeCount"]').forEach(el => {
    el.textContent = roundHundred(PUBLISHED_RECIPES.length).toLocaleString('fr-FR');
  });
  document.querySelectorAll('[data-stat="recipeCountLabel"]').forEach(el => {
    const n = PUBLISHED_RECIPES.length;
    el.textContent = `${roundHundred(n).toLocaleString('fr-FR')} recettes`;
  });
  const resultCount = document.getElementById('resultCount');
  if (resultCount) resultCount.textContent = PUBLISHED_RECIPES.length;
});
