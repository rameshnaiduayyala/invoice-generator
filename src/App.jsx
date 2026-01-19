import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore"; 
import { auth, db } from './firebase'; 
import InvoiceGenerator from './InvoiceGenerator';
import LoginPage from './components/LoginPage';
import { Loader2 } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null); 

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        // Load "Draft" state (current settings/theme)
        const docRef = doc(db, "invoices", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInitialData(docSnap.data());
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setInitialData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Auto-Save Draft (Keeps your current screen settings)
  const saveDraftToCloud = async (data) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "invoices", user.uid), data);
    } catch (e) {
      console.error("Draft save failed:", e);
    }
  };

  // 3. NEW: Save Final Invoice to History
  const saveFinalInvoice = async (invoiceData) => {
    if (!user) return;
    try {
      // Create a sub-collection 'history' inside the user's document
      // This creates a permanent record separate from the draft
      await addDoc(collection(db, "invoices", user.uid, "history"), {
        ...invoiceData,
        createdAt: new Date().toISOString(), // Timestamp for sorting
        searchKey: invoiceData.clientName?.toLowerCase() || '' // Helper for searching later
      });
      alert("Invoice Saved to History Successfully!");
    } catch (e) {
      console.error("Error saving invoice:", e);
      alert("Failed to save.");
    }
  };

  // 4. NEW: Fetch All Saved Invoices
  const fetchSavedInvoices = async () => {
    if (!user) return [];
    try {
      const querySnapshot = await getDocs(collection(db, "invoices", user.uid, "history"));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Error fetching history:", e);
      return [];
    }
  };

  // 5. NEW: Delete Invoice
  const deleteInvoice = async (id) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this invoice permanently?")) {
      await deleteDoc(doc(db, "invoices", user.uid, "history", id));
      return true; // Return success
    }
    return false;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-green-700">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold text-sm uppercase tracking-widest">Loading ...</p>
      </div>
    );
  }

  return (
    <div>
      {user ? (
        <InvoiceGenerator 
          onLogout={() => signOut(auth)} 
          saveDraft={saveDraftToCloud}      // Auto-save draft
          saveFinal={saveFinalInvoice}      // Save button
          fetchHistory={fetchSavedInvoices} // List button
          deleteHistory={deleteInvoice}     // Delete button
          initialData={initialData} 
        />
      ) : (
        <LoginPage onLogin={() => {}} />
      )}
    </div>
  );
}

export default App;