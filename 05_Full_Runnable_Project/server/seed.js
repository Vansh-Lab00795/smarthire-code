import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from './db.js';

export async function seedDemoData() {
  const users = readData('users.json');
  if (users.length > 0) {
    return; // Already seeded or has users
  }

  console.log('Seeding initial SmartHire demo presentation data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Candidate User: Vansh Kumar Jha (Slide 05 & 06)
  const candidateUserId = uuidv4();
  const candidateUser = {
    id: candidateUserId,
    name: 'Vansh Kumar Jha',
    email: 'candidate@smarthire.ai',
    password: passwordHash,
    role: 'candidate',
    created_at: new Date().toISOString(),
  };

  const candidateProfileId = uuidv4();
  const candidateProfile = {
    id: candidateProfileId,
    userId: candidateUserId,
    name: 'Vansh Kumar Jha',
    title: 'Full Stack Developer',
    education: 'B.Tech Graduate, F.E.T Agra College',
    skills: [
      'Full Stack Developer',
      'Communication',
      'React',
      'Node.js',
      'Express',
      'MySQL',
      'Python',
      'Flask',
    ],
    experience: '1 Year',
    location: 'Agra',
    expectedSalary: '60000',
    jobType: 'Full-time',
    preferredLocations: ['Agra', 'Delhi'],
    availability: 'Immediate',
    bio: 'B.Tech student at F.E.T Agra College. Passionate about building full-stack web applications, APIs, and modern user experiences.',
    projects: [
      {
        name: 'E-Commerce Website',
        duration: '3 months',
        role: 'Full Stack Developer',
        techStack: 'React • Node.js • Express • MySQL',
        description: 'Built product pages, user login, shopping cart and order-management features.',
        outcome: 'Working online-shopping prototype with end-to-end user flow.',
        link: 'https://github.com/smarthire/ecommerce-fullstack',
      },
      {
        name: 'Student Management System',
        duration: '2 months',
        role: 'Backend Developer',
        techStack: 'Python • Flask • MySQL • HTML/CSS',
        description: 'Developed student records, attendance tracking and database integration.',
        outcome: 'Centralized prototype for managing student information.',
        link: 'https://github.com/smarthire/student-management-system',
      },
    ],
    created_at: new Date().toISOString(),
  };

  // 2. Company User: ABC Pvt. Ltd. (Slide 07)
  const companyUserId = uuidv4();
  const companyUser = {
    id: companyUserId,
    name: 'ABC Pvt. Ltd.',
    email: 'company@abc.com',
    password: passwordHash,
    role: 'company',
    created_at: new Date().toISOString(),
  };

  const companyProfileId = uuidv4();
  const companyProfile = {
    id: companyProfileId,
    userId: companyUserId,
    companyName: 'ABC Pvt. Ltd.',
    industry: 'Software & Cloud Services',
    location: 'Agra',
    website: 'https://abcpvtltd.example.com',
    description: 'Premier technology and enterprise software solutions provider based in Agra.',
    size: '11-50',
    founded: '2020',
    created_at: new Date().toISOString(),
  };

  // 3. Company Job: Web-Developer (Slide 07)
  const jobId = uuidv4();
  const job = {
    id: jobId,
    companyUserId: companyUserId,
    companyId: companyProfileId,
    companyName: 'ABC Pvt. Ltd.',
    title: 'Web-Developer',
    description: 'ABC Pvt. Ltd. is looking for an energetic Web-Developer to maintain and build modern web applications. The role focuses on full stack development with React and Node.js, working alongside agile engineering teams.',
    educationReq: 'Graduate',
    experienceReq: '0–2 Years',
    skillsReq: ['Communication', 'MS Excel', 'Full Stack Developer', 'React'],
    location: 'Agra',
    salaryMin: 40000,
    salaryMax: 60000,
    jobType: 'Full-time',
    joiningPeriod: 'Within 30 days',
    created_at: new Date().toISOString(),
  };

  // Additional Job for variety: Mobile App Developer
  const job2Id = uuidv4();
  const job2 = {
    id: job2Id,
    companyUserId: companyUserId,
    companyId: companyProfileId,
    companyName: 'ABC Pvt. Ltd.',
    title: 'Frontend React Specialist',
    description: 'Lead client-facing dashboard UI development using Tailwind CSS and React component ecosystems.',
    educationReq: 'B.Tech / Graduate',
    experienceReq: '1 Year',
    skillsReq: ['React', 'Communication', 'Full Stack Developer', 'CSS'],
    location: 'Agra',
    salaryMin: 45000,
    salaryMax: 65000,
    jobType: 'Full-time',
    joiningPeriod: 'Immediate',
    created_at: new Date().toISOString(),
  };

  // 4. Slide 08 Match: 94% Match between Candidate A and ABC Pvt. Ltd. Web-Developer
  const matchId = uuidv4();
  const match = {
    id: matchId,
    candidateUserId: candidateUserId,
    candidateId: candidateProfileId,
    jobId: jobId,
    companyUserId: companyUserId,
    matchScore: 94,
    candidateStatus: 'pending',
    companyStatus: 'pending',
    created_at: new Date().toISOString(),
  };

  // 5. Slide 09 Two-Way Notifications
  const notifications = [
    {
      id: uuidv4(),
      userId: candidateUserId,
      type: 'match_found',
      matchId: matchId,
      message: 'You may be suitable for a Web-developer position at ABC Pvt. Ltd. (94% Compatibility)',
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: companyUserId,
      type: 'candidate_matched',
      matchId: matchId,
      message: 'A candidate matching your Web-developer requirements has been found: Vansh Kumar Jha (94% Match)',
      read: false,
      created_at: new Date().toISOString(),
    },
  ];

  // Write all data
  writeData('users.json', [candidateUser, companyUser]);
  writeData('candidates.json', [candidateProfile]);
  writeData('companies.json', [companyProfile]);
  writeData('jobs.json', [job, job2]);
  writeData('matches.json', [match]);
  writeData('notifications.json', notifications);

  console.log('✅ Demo presentation data successfully seeded!');
}
