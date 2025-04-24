import { getFirestore, collection, addDoc, query, getDocs } from 'firebase/firestore';

const initialTrainings = [
  {
    title: "Basic Combat Training",
    description: "Learn the fundamentals of military strategy and resource management. Master troop deployment, resource allocation, and basic battle tactics.",
    iconName: "FaBook",
    active: true,
    order: 0,
    content: [
      "Understanding troop types and their strengths",
      "Resource management fundamentals",
      "Basic battle formations",
      "Supply chain management"
    ]
  },
  {
    title: "Market Analysis",
    description: "Master the art of reading market trends and making profitable investments. Learn to analyze market patterns and make strategic investment decisions.",
    iconName: "FaChartLine",
    active: true,
    order: 1,
    content: [
      "Market trend analysis",
      "Investment risk assessment",
      "Portfolio diversification",
      "Market timing strategies"
    ]
  },
  {
    title: "Defense Tactics",
    description: "Advanced techniques for protecting your assets and soldiers. Learn sophisticated defense strategies and counterattack methods.",
    iconName: "FaShieldAlt",
    active: true,
    order: 2,
    content: [
      "Base fortification techniques",
      "Resource protection strategies",
      "Counter-attack planning",
      "Advanced defense formations"
    ]
  },
  {
    title: "Alliance Building",
    description: "Strategies for forming and maintaining powerful alliances. Master diplomatic relations and strategic partnerships.",
    iconName: "FaUsers",
    active: true,
    order: 3,
    content: [
      "Alliance negotiation tactics",
      "Resource sharing strategies",
      "Joint operation planning",
      "Diplomatic conflict resolution"
    ]
  }
];

export const initializeTrainings = async () => {
  const db = getFirestore();
  const trainingsRef = collection(db, 'trainings');
  
  try {
    // Check if trainings already exist
    const existingTrainings = await getDocs(query(trainingsRef));
    if (!existingTrainings.empty) {
      console.log('Trainings already initialized');
      return false;
    }

    // Add trainings in sequence to establish prerequisites
    let previousId = null;
    
    for (const training of initialTrainings) {
      // Set the prerequisite to the previous training
      if (previousId) {
        training.prerequisiteId = previousId;
      }
      
      // Add the training to Firestore
      const docRef = await addDoc(trainingsRef, {
        ...training,
        createdAt: new Date().toISOString()
      });
      previousId = docRef.id;
      
      console.log(`Added training: ${training.title}`);
    }
    
    console.log('Training modules initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing training modules:', error);
    return false;
  }
};
