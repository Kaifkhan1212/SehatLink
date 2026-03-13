import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        
        // Setup real-time listener for user document
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeDoc = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserRole(doc.data().role);
            setUserData(doc.data());
          } else {
            setUserRole(null);
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user doc: ", error);
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
        if (unsubscribeDoc) unsubscribeDoc();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (name, email, password, role) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update Firebase Auth Profile
    await updateProfile(user, { displayName: name });
    
    // Create corresponding user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      role,
      createdAt: serverTimestamp()
    });

    // If registering as a doctor, also add to the 'doctors' collection
    if (role === 'doctor') {
      await setDoc(doc(db, 'doctors', user.uid), {
        id: user.uid,
        name,
        email,
        specialization: 'General Physician',
        available: true,
        createdAt: serverTimestamp()
      });
    } else if (role === 'patient') {
      // If registering as a patient, also add to the 'patients' collection
      await setDoc(doc(db, 'patients', user.uid), {
        id: user.uid,
        name,
        email,
        age: 'N/A',
        bloodGroup: 'N/A',
        allergies: 'None recorded',
        chronicDiseases: 'None recorded',
        createdAt: serverTimestamp()
      });
    }

    return user;
  };

  const loginWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, googleProvider);
    
    // Check if user document exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userDocRef, {
        name: user.displayName || 'Google User',
        email: user.email,
        role: 'patient', // Default role
        createdAt: serverTimestamp()
      });
      setUserRole('patient');
    } else {
      setUserRole(userDoc.data().role);
    }

    return user;
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userRole,
    userData,
    login,
    register,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
