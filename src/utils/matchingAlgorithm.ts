export const calculateMatchScore = (currentUser: any, candidate: any) => {
  let score = 35; // Base score
  const reasons: string[] = [];

  // 1. Tags / Tech Stack
  const userTags = currentUser?.tags || [];
  const candidateTags = candidate?.tags || [];
  const sharedTags = userTags.filter((t: string) => candidateTags.includes(t));
  
  if (sharedTags.length > 0) {
    score += Math.min(sharedTags.length * 12, 36);
    if (sharedTags.length >= 2) {
      reasons.push(`Both use ${sharedTags.slice(0, 2).join(' & ')}`);
    } else {
      reasons.push(`Both use ${sharedTags[0]}`);
    }
  }

  // 2. Location
  if (currentUser?.city && candidate?.city && currentUser.city.toLowerCase() === candidate.city.toLowerCase()) {
    score += 15;
    reasons.push(`Both in ${candidate.city}`);
  }

  // 3. Experience Level
  const levels = ['Beginner', 'Junior', 'Intermediate', 'Senior', 'Staff/Principal'];
  const userLevelIdx = levels.indexOf(currentUser?.level);
  const candLevelIdx = levels.indexOf(candidate?.level);
  
  if (userLevelIdx !== -1 && candLevelIdx !== -1) {
    const diff = Math.abs(userLevelIdx - candLevelIdx);
    if (diff === 0) {
      score += 10;
      reasons.push(`Both ${candidate.level} level`);
    } else if (diff === 1) {
      score += 5;
    }
  }

  // 4. Bio Keywords (Common interests)
  const getKeywords = (text: string) => {
    if (!text) return [];
    const words = text.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
    const stopWords = ['about', 'looking', 'would', 'really', 'things', 'their', 'there', 'which', 'these', 'could', 'someone', 'partner', 'project'];
    return words.filter(w => !stopWords.includes(w));
  };

  const userWords = getKeywords(currentUser?.bio);
  const candWords = getKeywords(candidate?.bio);
  const sharedWords = userWords.filter(w => candWords.includes(w));
  const uniqueSharedWords = [...new Set(sharedWords)];

  if (uniqueSharedWords.length > 0) {
    score += Math.min(uniqueSharedWords.length * 5, 15);
    const word = uniqueSharedWords[0];
    const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
    reasons.push(`Both interested in ${capitalizedWord}`);
  }

  // 5. GitHub Activity
  if (currentUser?.github && candidate?.github) {
    score += 8;
    reasons.push('Both active on GitHub');
  }

  // Cap score at 99
  score = Math.min(score, 99);

  // Ensure at least one reason
  if (reasons.length === 0) {
    reasons.push('Great potential coding partner');
  }

  return { score, reasons: reasons.slice(0, 3) };
};
