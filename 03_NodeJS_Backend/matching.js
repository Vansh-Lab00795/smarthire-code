import { readData, writeData } from './db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Calculate match percentage between a candidate profile and a job requirement.
 * Returns a score from 0 to 100.
 */
export function calculateMatch(candidateProfile, jobRequirement) {
  let skillsScore = 0;
  let educationScore = 0;
  let experienceScore = 0;
  let locationScore = 0;
  let salaryScore = 0;

  // --- Skills Match (40% weight) ---
  if (
    jobRequirement.skillsReq &&
    jobRequirement.skillsReq.length > 0 &&
    candidateProfile.skills &&
    candidateProfile.skills.length > 0
  ) {
    const candidateSkills = candidateProfile.skills.map((s) => s.toLowerCase().trim());
    const requiredSkills = jobRequirement.skillsReq.map((s) => s.toLowerCase().trim());
    const matchedCount = requiredSkills.filter((rs) =>
      candidateSkills.some((cs) => cs.includes(rs) || rs.includes(cs))
    ).length;
    skillsScore = (matchedCount / requiredSkills.length) * 100;
  } else if (!jobRequirement.skillsReq || jobRequirement.skillsReq.length === 0) {
    // Penalize jobs that don't specify any skills — don't give a free 100%
    skillsScore = 50;
  }

  // --- Education Match (15% weight) ---
  const educationLevels = [
    'high school',
    'diploma',
    'associate',
    'bachelor',
    'bachelors',
    "bachelor's",
    'master',
    'masters',
    "master's",
    'mba',
    'phd',
    'doctorate',
  ];

  function getEducationLevel(edu) {
    if (!edu) return -1;
    const lower = edu.toLowerCase();
    for (let i = educationLevels.length - 1; i >= 0; i--) {
      if (lower.includes(educationLevels[i])) return i;
    }
    return 0;
  }

  if (jobRequirement.educationReq) {
    const reqLevel = getEducationLevel(jobRequirement.educationReq);
    const candLevel = getEducationLevel(candidateProfile.education);
    if (candLevel >= reqLevel) {
      educationScore = 100;
    } else if (reqLevel - candLevel === 1) {
      educationScore = 60;
    } else {
      educationScore = 20;
    }
  } else {
    educationScore = 100;
  }

  // --- Experience Match (15% weight) ---
  function parseExperienceYears(exp) {
    if (!exp) return 0;
    const str = String(exp).toLowerCase();
    const match = str.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  if (jobRequirement.experienceReq) {
    const reqYears = parseExperienceYears(jobRequirement.experienceReq);
    const candYears = parseExperienceYears(candidateProfile.experience);
    if (candYears >= reqYears) {
      experienceScore = 100;
    } else if (reqYears > 0) {
      experienceScore = Math.min(100, (candYears / reqYears) * 100);
    } else {
      experienceScore = 100;
    }
  } else {
    experienceScore = 100;
  }

  // --- Location Match (15% weight) ---
  if (jobRequirement.location) {
    const jobLoc = jobRequirement.location.toLowerCase().trim();
    const candLoc = (candidateProfile.location || '').toLowerCase().trim();
    const prefLocs = (candidateProfile.preferredLocations || []).map((l) =>
      l.toLowerCase().trim()
    );

    if (
      candLoc === jobLoc ||
      candLoc.includes(jobLoc) ||
      jobLoc.includes(candLoc)
    ) {
      locationScore = 100;
    } else if (
      prefLocs.some((pl) => pl === jobLoc || pl.includes(jobLoc) || jobLoc.includes(pl))
    ) {
      locationScore = 80;
    } else if (jobLoc === 'remote' || candLoc === 'remote') {
      locationScore = 90;
    } else {
      locationScore = 0;
    }
  } else {
    locationScore = 100;
  }

  // --- Salary Match (15% weight) ---
  if (jobRequirement.salaryMin != null || jobRequirement.salaryMax != null) {
    const expectedSalary = parseFloat(candidateProfile.expectedSalary) || 0;
    const salaryMin = parseFloat(jobRequirement.salaryMin) || 0;
    const salaryMax = parseFloat(jobRequirement.salaryMax) || Infinity;

    if (expectedSalary === 0) {
      salaryScore = 80;
    } else if (expectedSalary >= salaryMin && expectedSalary <= salaryMax) {
      salaryScore = 100;
    } else if (expectedSalary < salaryMin) {
      salaryScore = 90; // Candidate asks less — still good for employer
    } else {
      // Candidate asks more than max — steep penalty
      // If candidate expects 2x the budget, score = 0
      const ratio = expectedSalary / (salaryMax || 1);
      if (ratio >= 2) {
        salaryScore = 0;
      } else {
        salaryScore = Math.max(0, Math.round(100 - (ratio - 1) * 100));
      }
    }
  } else {
    salaryScore = 100;
  }

  // --- Job Type Match (bonus consideration, folded into location) ---
  if (jobRequirement.jobType && candidateProfile.jobType) {
    if (
      jobRequirement.jobType.toLowerCase() !== candidateProfile.jobType.toLowerCase()
    ) {
      locationScore = Math.max(0, locationScore - 20);
    }
  }

  // --- Job Title Relevance Penalty ---
  // If candidate has skills but none relate to the job title, apply a penalty
  if (
    jobRequirement.title &&
    candidateProfile.skills &&
    candidateProfile.skills.length > 0
  ) {
    const titleWords = jobRequirement.title
      .toLowerCase()
      .split(/[\s\-\/,]+/)
      .filter((w) => w.length > 2 && !['and', 'the', 'for', 'with'].includes(w));
    const candidateSkills = candidateProfile.skills.map((s) => s.toLowerCase().trim());
    const titleRelevant = titleWords.some(
      (tw) =>
        candidateSkills.some((cs) => cs.includes(tw) || tw.includes(cs))
    );
    // If job title has no relevance to candidate skills, apply a penalty
    if (!titleRelevant && titleWords.length > 0) {
      // Reduce skills score by 30% for irrelevant titles
      skillsScore = Math.max(0, skillsScore * 0.7);
    }
  }

  // Weighted total
  const total =
    skillsScore * 0.4 +
    educationScore * 0.15 +
    experienceScore * 0.15 +
    locationScore * 0.15 +
    salaryScore * 0.15;

  return Math.round(total);
}

/**
 * Match a candidate against all jobs.
 */
export function runMatching(candidateId) {
  const candidates = readData('candidates.json');
  const jobs = readData('jobs.json');
  const matches = readData('matches.json');
  const notifications = readData('notifications.json');

  const candidate = candidates.find((c) => c.userId === candidateId || c.id === candidateId);
  if (!candidate) return;

  for (const job of jobs) {
    // Skip if match already exists
    const existingMatch = matches.find(
      (m) => m.candidateId === candidate.id && m.jobId === job.id
    );
    if (existingMatch) continue;

    const score = calculateMatch(candidate, job);

    if (score >= 50) {
      const matchRecord = {
        id: uuidv4(),
        candidateId: candidate.id,
        candidateUserId: candidate.userId,
        jobId: job.id,
        companyUserId: job.companyUserId,
        matchScore: score,
        status: 'pending',
        candidateStatus: 'pending',
        companyStatus: 'pending',
        created_at: new Date().toISOString(),
      };

      matches.push(matchRecord);

      // Create notifications for high matches (≥ 70%)
      if (score >= 70) {
        notifications.push({
          id: uuidv4(),
          userId: candidate.userId,
          type: 'match',
          title: 'New Job Match!',
          message: `You have a ${score}% match with the position "${job.title}".`,
          matchId: matchRecord.id,
          jobId: job.id,
          read: false,
          created_at: new Date().toISOString(),
        });

        notifications.push({
          id: uuidv4(),
          userId: job.companyUserId,
          type: 'match',
          title: 'New Candidate Match!',
          message: `A candidate matched ${score}% with your position "${job.title}".`,
          matchId: matchRecord.id,
          jobId: job.id,
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  writeData('matches.json', matches);
  writeData('notifications.json', notifications);
}

/**
 * Match a job against all candidates.
 */
export function runJobMatching(jobId) {
  const candidates = readData('candidates.json');
  const jobs = readData('jobs.json');
  const matches = readData('matches.json');
  const notifications = readData('notifications.json');

  const job = jobs.find((j) => j.id === jobId);
  if (!job) return;

  for (const candidate of candidates) {
    // Skip if match already exists
    const existingMatch = matches.find(
      (m) => m.candidateId === candidate.id && m.jobId === job.id
    );
    if (existingMatch) continue;

    const score = calculateMatch(candidate, job);

    if (score >= 50) {
      const matchRecord = {
        id: uuidv4(),
        candidateId: candidate.id,
        candidateUserId: candidate.userId,
        jobId: job.id,
        companyUserId: job.companyUserId,
        matchScore: score,
        status: 'pending',
        candidateStatus: 'pending',
        companyStatus: 'pending',
        created_at: new Date().toISOString(),
      };

      matches.push(matchRecord);

      if (score >= 70) {
        notifications.push({
          id: uuidv4(),
          userId: candidate.userId,
          type: 'match',
          title: 'New Job Match!',
          message: `You have a ${score}% match with the position "${job.title}".`,
          matchId: matchRecord.id,
          jobId: job.id,
          read: false,
          created_at: new Date().toISOString(),
        });

        notifications.push({
          id: uuidv4(),
          userId: job.companyUserId,
          type: 'match',
          title: 'New Candidate Match!',
          message: `A candidate matched ${score}% with your position "${job.title}".`,
          matchId: matchRecord.id,
          jobId: job.id,
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  writeData('matches.json', matches);
  writeData('notifications.json', notifications);
}
