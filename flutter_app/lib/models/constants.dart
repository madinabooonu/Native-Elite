// ignore: unused_import
// (types.dart kept for potential future use)

// ─── Native Elite Brand Colors ───
const kNavy = 0xFF0353A4;
const kNavyDeep = 0xFF050A24;
const kNavyCard = 0xFF0E173C;
const kBlueAccent = 0xFF0466C8;
const kBlueMid = 0xFF0353A4;
const kBlueLight = 0xFF7BB8F5;
const kGreen = 0xFF2DC653;
const kRed = 0xFFE63946;
const kOrange = 0xFFFB8500;

// ─── Demo users (Admin tarafidan yaratiladi) ───
final List<Map<String, dynamic>> kDefaultUsers = [
  {
    'uid': 'super_admin_001',
    'username': 'superadmin',
    'password': 'Admin@123',
    'displayName': 'Super Admin',
    'role': 'super-admin',
    'stage': null,
    'avatarUrl': null,
    'phone': '+998901234567',
    'bio': 'Native Elite Super Administrator',
  },
  {
    'uid': 'admin_001',
    'username': 'admin',
    'password': 'Admin@123',
    'displayName': 'Admin User',
    'role': 'admin',
    'stage': null,
    'avatarUrl': null,
    'phone': '+998901234568',
    'bio': 'Native Elite Admin',
  },
  {
    'uid': 'teacher_001',
    'username': 'teacher1',
    'password': 'Teacher@123',
    'displayName': 'Miss Osiyo',
    'role': 'teacher',
    'stage': null,
    'avatarUrl': null,
    'phone': '+998901234569',
    'bio': 'IELTS Teacher | 5+ years experience',
  },
  {
    'uid': 'teacher_002',
    'username': 'teacher2',
    'password': 'Teacher@123',
    'displayName': 'Mr Sarvar',
    'role': 'teacher',
    'stage': null,
    'avatarUrl': null,
    'phone': '+998901234570',
    'bio': 'IELTS Teacher | Speaking specialist',
  },
  {
    'uid': 'student_001',
    'username': 'student1',
    'password': 'Student@123',
    'displayName': 'Alibek Karimov',
    'role': 'student',
    'stage': 'Stage 3',
    'avatarUrl': null,
    'phone': '+998901234571',
    'bio': 'IELTS student, target 7.0',
  },
  {
    'uid': 'student_002',
    'username': 'Student@123',
    'password': 'Student@123',
    'displayName': 'Malika Yusupova',
    'role': 'student',
    'stage': 'Stage 2',
    'avatarUrl': null,
    'phone': '+998901234572',
    'bio': 'IELTS student, target 6.5',
  },
  {
    'uid': 'student_003',
    'username': 'student3',
    'password': 'Student@123',
    'displayName': 'Jasur Toshmatov',
    'role': 'student',
    'stage': 'Stage 4',
    'avatarUrl': null,
    'phone': '+998901234573',
    'bio': 'Working towards IELTS 7.5',
  },
];

// ─── Vocabulary Data ───
final Map<String, List<Map<String, dynamic>>> kVocabTopics = {
  '1': [
    {
      'id': 'greetings',
      'name': 'Greetings & Introductions',
      'emoji': '👋',
      'count': 15,
      'words': [
        {'word': 'Hello', 'definition': 'A greeting used when meeting someone', 'example': 'Hello, how are you today?'},
        {'word': 'Introduce', 'definition': 'To present someone to another person', 'example': 'Let me introduce myself.'},
        {'word': 'Pleased', 'definition': 'Happy or satisfied', 'example': 'Pleased to meet you.'},
        {'word': 'Acquaintance', 'definition': 'A person you know slightly', 'example': 'She is an acquaintance of mine.'},
        {'word': 'Farewell', 'definition': 'A goodbye', 'example': 'They said their farewells.'},
      ]
    },
    {
      'id': 'family',
      'name': 'Family & Relationships',
      'emoji': '👨‍👩‍👧',
      'count': 20,
      'words': [
        {'word': 'Sibling', 'definition': 'A brother or sister', 'example': 'I have two siblings.'},
        {'word': 'Relative', 'definition': 'A family member', 'example': 'My relatives live abroad.'},
        {'word': 'Ancestor', 'definition': 'A person from whom one is descended', 'example': 'My ancestors were farmers.'},
        {'word': 'Descendant', 'definition': 'A person who is descended from a particular ancestor', 'example': 'She is a descendant of royalty.'},
      ]
    },
    {
      'id': 'numbers',
      'name': 'Numbers & Time',
      'emoji': '🔢',
      'count': 12,
      'words': [
        {'word': 'Decade', 'definition': 'A period of ten years', 'example': 'A decade ago, I was in school.'},
        {'word': 'Century', 'definition': 'A period of 100 years', 'example': 'The 21st century is digital.'},
        {'word': 'Duration', 'definition': 'The length of time something lasts', 'example': 'The duration of the test is 3 hours.'},
      ]
    },
  ],
  '2': [
    {
      'id': 'daily-routine',
      'name': 'Daily Routine',
      'emoji': '📅',
      'count': 20,
      'words': [
        {'word': 'Commute', 'definition': 'To travel regularly between home and work', 'example': 'I commute by bus every day.'},
        {'word': 'Schedule', 'definition': 'A plan of activities at a set time', 'example': 'My schedule is very busy.'},
        {'word': 'Routine', 'definition': 'A sequence of actions regularly followed', 'example': 'Exercise is part of my routine.'},
        {'word': 'Habit', 'definition': 'A settled practice', 'example': 'Reading is a good habit.'},
      ]
    },
    {
      'id': 'food',
      'name': 'Food & Nutrition',
      'emoji': '🍎',
      'count': 18,
      'words': [
        {'word': 'Nutritious', 'definition': 'Providing nourishment', 'example': 'Vegetables are nutritious.'},
        {'word': 'Calorie', 'definition': 'A unit of energy in food', 'example': 'This snack is low in calories.'},
        {'word': 'Organic', 'definition': 'Produced without chemicals', 'example': 'I prefer organic food.'},
        {'word': 'Cuisine', 'definition': 'A style of cooking', 'example': 'Italian cuisine is popular worldwide.'},
      ]
    },
    {
      'id': 'shopping',
      'name': 'Shopping & Money',
      'emoji': '🛍️',
      'count': 15,
      'words': [
        {'word': 'Discount', 'definition': 'A reduction in price', 'example': 'There is a 20% discount today.'},
        {'word': 'Budget', 'definition': 'A plan for income and spending', 'example': 'I have a tight budget.'},
        {'word': 'Purchase', 'definition': 'To buy something', 'example': 'I made a big purchase yesterday.'},
      ]
    },
  ],
  '3': [
    {
      'id': 'school',
      'name': 'School Life',
      'emoji': '🏫',
      'count': 25,
      'words': [
        {'word': 'Curriculum', 'definition': 'The subjects studied in school', 'example': 'The curriculum includes sciences.'},
        {'word': 'Academic', 'definition': 'Relating to education', 'example': 'Academic performance is important.'},
        {'word': 'Scholarship', 'definition': 'A grant for education', 'example': 'She received a full scholarship.'},
        {'word': 'Tutor', 'definition': 'A private teacher', 'example': 'I have a math tutor.'},
        {'word': 'Assignment', 'definition': 'A task given to a student', 'example': 'The assignment is due Friday.'},
      ]
    },
    {
      'id': 'career',
      'name': 'Career & Work',
      'emoji': '💼',
      'count': 22,
      'words': [
        {'word': 'Profession', 'definition': 'A paid occupation', 'example': 'Teaching is my profession.'},
        {'word': 'Resume', 'definition': 'A document with work experience', 'example': 'I updated my resume.'},
        {'word': 'Interview', 'definition': 'A formal meeting for a job', 'example': 'I have a job interview tomorrow.'},
        {'word': 'Promotion', 'definition': 'Advancement in job rank', 'example': 'She got a promotion last month.'},
      ]
    },
  ],
  '4': [
    {
      'id': 'internet',
      'name': 'Internet & Social Media',
      'emoji': '🌐',
      'count': 30,
      'words': [
        {'word': 'Algorithm', 'definition': 'A process used by computers', 'example': 'Social media uses algorithms.'},
        {'word': 'Platform', 'definition': 'A digital environment for content', 'example': 'Instagram is a popular platform.'},
        {'word': 'Viral', 'definition': 'Spreading rapidly online', 'example': 'The video went viral overnight.'},
        {'word': 'Streaming', 'definition': 'Watching/listening online', 'example': 'Streaming music is convenient.'},
        {'word': 'Cybersecurity', 'definition': 'Protection of digital systems', 'example': 'Cybersecurity is vital today.'},
      ]
    },
    {
      'id': 'gadgets',
      'name': 'Gadgets & Devices',
      'emoji': '📱',
      'count': 20,
      'words': [
        {'word': 'Device', 'definition': 'An electronic tool', 'example': 'My device needs charging.'},
        {'word': 'Processor', 'definition': 'The brain of a computer', 'example': 'A fast processor improves speed.'},
        {'word': 'Bandwidth', 'definition': 'Data transfer capacity', 'example': 'We need more bandwidth.'},
        {'word': 'Interface', 'definition': 'A system for interaction', 'example': 'The interface is user-friendly.'},
      ]
    },
  ],
  '5': [
    {
      'id': 'environment',
      'name': 'Environment & Climate',
      'emoji': '🌍',
      'count': 35,
      'words': [
        {'word': 'Sustainability', 'definition': 'Using resources responsibly', 'example': 'Sustainability is a global goal.'},
        {'word': 'Biodiversity', 'definition': 'Variety of life on Earth', 'example': 'Biodiversity is under threat.'},
        {'word': 'Emissions', 'definition': 'Gases released into air', 'example': 'Carbon emissions cause climate change.'},
        {'word': 'Renewable', 'definition': 'Can be naturally replenished', 'example': 'Solar is a renewable energy.'},
        {'word': 'Conservation', 'definition': 'Protection of nature', 'example': 'Conservation efforts are increasing.'},
      ]
    },
    {
      'id': 'globalization',
      'name': 'Globalization & Society',
      'emoji': '🌏',
      'count': 28,
      'words': [
        {'word': 'Globalization', 'definition': 'Integration of world economies', 'example': 'Globalization affects trade.'},
        {'word': 'Migration', 'definition': 'Moving to another place', 'example': 'Migration increased this decade.'},
        {'word': 'Diversity', 'definition': 'A range of different things', 'example': 'Cultural diversity is valuable.'},
        {'word': 'Inequality', 'definition': 'Unequal distribution', 'example': 'Income inequality is rising.'},
      ]
    },
    {
      'id': 'health',
      'name': 'Health & Medicine',
      'emoji': '🏥',
      'count': 30,
      'words': [
        {'word': 'Chronic', 'definition': 'Persisting for a long time', 'example': 'He has a chronic illness.'},
        {'word': 'Epidemic', 'definition': 'Widespread disease outbreak', 'example': 'The epidemic spread rapidly.'},
        {'word': 'Diagnosis', 'definition': 'Identification of a disease', 'example': 'Early diagnosis is important.'},
        {'word': 'Immunity', 'definition': 'Resistance to disease', 'example': 'Vaccines build immunity.'},
      ]
    },
  ],
  '6': [
    {
      'id': 'philosophy',
      'name': 'Philosophy & Abstract',
      'emoji': '🧠',
      'count': 40,
      'words': [
        {'word': 'Paradox', 'definition': 'A seemingly contradictory statement', 'example': "It's a paradox of modern life."},
        {'word': 'Ambiguous', 'definition': 'Open to more than one interpretation', 'example': 'The instructions were ambiguous.'},
        {'word': 'Ephemeral', 'definition': 'Lasting for a very short time', 'example': 'Fame can be ephemeral.'},
        {'word': 'Pragmatic', 'definition': 'Dealing with things sensibly', 'example': 'Take a pragmatic approach.'},
        {'word': 'Subjective', 'definition': 'Based on personal feelings', 'example': 'Beauty is subjective.'},
      ]
    },
    {
      'id': 'idioms',
      'name': 'Advanced Idioms & Phrases',
      'emoji': '🗣️',
      'count': 30,
      'words': [
        {'word': 'Bite the bullet', 'definition': 'Endure painful situation', 'example': 'Just bite the bullet and do it.'},
        {'word': 'Break the ice', 'definition': 'Start a conversation awkward', 'example': 'He told a joke to break the ice.'},
        {'word': 'Hit the nail on the head', 'definition': 'Exactly right', 'example': 'You hit the nail on the head.'},
        {'word': 'Under the weather', 'definition': 'Feeling ill', 'example': "I'm feeling under the weather today."},
      ]
    },
    {
      'id': 'collocations',
      'name': 'Academic Collocations',
      'emoji': '📚',
      'count': 35,
      'words': [
        {'word': 'Conduct research', 'definition': 'To carry out research', 'example': 'Scientists conduct research daily.'},
        {'word': 'Draw conclusions', 'definition': 'To reach a decision', 'example': 'We can draw conclusions from data.'},
        {'word': 'Address issues', 'definition': 'To deal with problems', 'example': 'We must address these issues.'},
        {'word': 'Raise awareness', 'definition': 'To make people more informed', 'example': 'Campaigns raise awareness.'},
      ]
    },
  ],
};

// ─── IELTS Speaking Question Bank ───
final Map<String, List<Map<String, dynamic>>> kSpeakingQuestions = {
  'part1': [
    {
      'topic': 'Hometown',
      'icon': '🏡',
      'questions': [
        'Where are you from originally?',
        'What is your hometown like?',
        'What do you like most about your hometown?',
        'Has your hometown changed much in recent years?',
        'Would you like to continue living in your hometown?',
      ]
    },
    {
      'topic': 'Work & Study',
      'icon': '💼',
      'questions': [
        'Do you work or study?',
        'What do you study? Why did you choose it?',
        'Do you enjoy your work/studies?',
        'What are your plans for the future?',
        'What skills have you developed in your work?',
      ]
    },
    {
      'topic': 'Family',
      'icon': '👨‍👩‍👧',
      'questions': [
        'Tell me about your family.',
        'Do you spend a lot of time with your family?',
        'What do you do together as a family?',
        'Has family life changed over the years in your country?',
        'How important is family to you?',
      ]
    },
    {
      'topic': 'Friends',
      'icon': '👫',
      'questions': [
        'How important are friends to you?',
        'Do you prefer to have many friends or a few close ones?',
        'How do you maintain friendships?',
        'Have you made any friends online?',
        'Are your friends mostly from school or work?',
      ]
    },
    {
      'topic': 'Hobbies',
      'icon': '🎨',
      'questions': [
        'What do you do in your spare time?',
        'Have you always had this hobby?',
        'Is it expensive to pursue this hobby?',
        'Do you share this hobby with others?',
        'Would you like to try any new hobbies?',
      ]
    },
  ],
  'part2': [
    {
      'topic': 'Describe a person',
      'icon': '👤',
      'questions': [
        'Describe a person you admire.\nYou should say:\n- who this person is\n- how you know this person\n- what they do\n- and explain why you admire them.',
        'Describe a famous person you would like to meet.\nYou should say:\n- who this person is\n- why they are famous\n- what you would talk about\n- and explain why you want to meet them.',
      ]
    },
    {
      'topic': 'Describe a place',
      'icon': '📍',
      'questions': [
        'Describe a place you have visited recently.\nYou should say:\n- where it is\n- when you went there\n- what you did there\n- and explain why you liked/disliked it.',
        'Describe a place in your country that you would recommend.\nYou should say:\n- where it is\n- what it looks like\n- what visitors can do there\n- and explain why you would recommend it.',
      ]
    },
    {
      'topic': 'Describe an event',
      'icon': '🎉',
      'questions': [
        'Describe a special event you attended.\nYou should say:\n- what the event was\n- when and where it took place\n- who attended with you\n- and explain why it was special.',
        'Describe a celebration you remember.\nYou should say:\n- what was being celebrated\n- who you celebrated with\n- what you did\n- and explain why you remember it.',
      ]
    },
  ],
  'part3': [
    {
      'topic': 'Society & Culture',
      'icon': '🌐',
      'questions': [
        'How do you think society has changed in the last 20 years?',
        'What role does culture play in shaping people\'s values?',
        'Do you think globalization has a positive or negative effect on culture?',
        'How important is it to preserve traditional customs?',
        'Should governments fund cultural programs?',
      ]
    },
    {
      'topic': 'Technology & Future',
      'icon': '🤖',
      'questions': [
        'How has technology changed the way people communicate?',
        'Do you think artificial intelligence will replace human jobs?',
        'What are the advantages and disadvantages of social media?',
        'How might cities change in the future?',
        'Should children have unlimited access to technology?',
      ]
    },
    {
      'topic': 'Environment',
      'icon': '🌿',
      'questions': [
        'Who is responsible for protecting the environment?',
        'How can individuals reduce their environmental impact?',
        'Do you think economic development and environmental protection can coexist?',
        'Should governments impose stricter environmental laws?',
        'How has climate change affected your country?',
      ]
    },
  ],
};
