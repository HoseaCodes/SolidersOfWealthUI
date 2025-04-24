// In useAdmin.js
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth(); 

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // 1. Check if current user is an admin
        const adminRef = doc(db, 'admins', currentUser.email);
        const adminDoc = await getDoc(adminRef);
        setIsAdmin(adminDoc.exists());

        // 2. Fetch all admins
        const adminsCollectionRef = collection(db, 'admins');
        const adminsSnapshot = await getDocs(adminsCollectionRef);
        
        const adminsList = [];
        adminsSnapshot.forEach((doc) => {
          const email = doc.data().email;
          console.log(email);
          if (doc.id === currentUser.email) setIsAdmin(true);
          adminsList.push({
            id: doc.id,
            ...doc.data()
          });
        });

        if(adminsList.length > 0) {
          setIsAdmin(true);
        }
        
        setAllAdmins(adminsList);
        setError(null);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError(error.message);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser]);

  return { isAdmin, allAdmins, loading, error };
}