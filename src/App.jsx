import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore"; 
import { auth, db } from './firebase'; 
import InvoiceGenerator from './InvoiceGenerator';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import { Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null); 
  const [adminEditingSession, setAdminEditingSession] = useState(null); 

  // --- 1. AUTH & ROLE LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      
      if (currentUser) {
        try {
          // Fetch User Profile
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            console.log("Logged in as:", data.email, " | Role:", data.role); // DEBUG LOG
            setUserData(data);
            
            // If NOT admin, load draft invoice
            if (data.role !== 'admin') {
              const invoiceRef = doc(db, "invoices", currentUser.uid);
              const invoiceSnap = await getDoc(invoiceRef);
              if (invoiceSnap.exists()) setInitialData(invoiceSnap.data());
            }
          } else {
            // NEW USER DEFAULT: FORCE ROLE TO 'user'
            console.log("New user detected. Creating default 'user' profile.");
            const newProfile = { email: currentUser.email, role: 'user', nurseryName: 'New Nursery' };
            await setDoc(userRef, newProfile);
            setUserData(newProfile);
          }
          setUser(currentUser);
        } catch (err) {
          console.error("Auth Error:", err);
          setUser(null);
        }
      } else {
        // Logged Out
        setUser(null);
        setUserData(null);
        setInitialData(null);
        setAdminEditingSession(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- HANDLERS (Keep existing handlers) ---
  const saveDraftToCloud = async (data) => {
    if (!user) return;
    await setDoc(doc(db, "invoices", user.uid), data);
    const company = JSON.parse(data.company || '{}');
    if (company.name) await updateDoc(doc(db, "users", user.uid), { nurseryName: company.name });
  };

  const saveFinalInvoice = async (invoiceData) => {
    if (!user) return;
    await addDoc(collection(db, "invoices", user.uid, "history"), {
      ...invoiceData,
      createdAt: new Date().toISOString(),
      searchKey: invoiceData.clientName?.toLowerCase() || ''
    });
    alert("Saved to History!");
  };

  const fetchSavedInvoices = async () => {
    if (!user) return [];
    const q = await getDocs(collection(db, "invoices", user.uid, "history"));
    return q.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const deleteInvoice = async (id) => {
    if (confirm("Delete permanently?")) {
      await deleteDoc(doc(db, "invoices", user.uid, "history", id));
      return true;
    }
    return false;
  };

  // --- ADMIN EDITING HANDLERS ---
  const startAdminEdit = (invoice, userId) => {
    const fullState = JSON.parse(invoice.fullState);
    setAdminEditingSession({ invoiceId: invoice.id, userId: userId, data: fullState });
  };

  const saveAdminEdit = async (invoiceData) => {
    if (!adminEditingSession) return;
    const { userId, invoiceId } = adminEditingSession;
    try {
      const invoiceRef = doc(db, "invoices", userId, "history", invoiceId);
      await updateDoc(invoiceRef, { ...invoiceData });
      alert("User invoice updated!");
      setAdminEditingSession(null);
    } catch (e) { alert("Error: " + e.message); }
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-green-700">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold text-sm uppercase tracking-widest">Checking Permissions...</p>
      </div>
    );
  }

  // LOGIN SCREEN (If no user)
  if (!user) {
    return <LoginPage onLogin={() => {}} />;
  }

  // --- ROUTING LOGIC (THE FIX) ---

  // 1. ADMIN MODE
  if (userData?.role === 'admin') {
    
    // A. Admin is Editing a User Invoice
    if (adminEditingSession) {
      return (
        <div className="relative">
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 font-bold cursor-pointer hover:bg-red-700 transition" onClick={() => setAdminEditingSession(null)}>
             <ArrowLeft size={18}/> EXIT ADMIN EDIT MODE
          </div>
          <InvoiceGenerator 
             onLogout={() => setAdminEditingSession(null)}
             initialData={adminEditingSession.data} 
             saveFinal={saveAdminEdit} 
             saveDraft={async () => {}} 
             fetchHistory={async () => []} 
             deleteHistory={async () => {}}
          />
        </div>
      );
    }

    // B. Admin Dashboard (Default Admin View)
    return (
      <AdminDashboard 
        currentUser={user}
        onLogout={() => signOut(auth)}
        onEditInvoice={startAdminEdit}
      />
    );
  }

  // 2. REGULAR USER MODE (Explicit 'user' check is safer)
  // If role is missing, we default to User for safety.
  return (
    <InvoiceGenerator 
      onLogout={() => signOut(auth)} 
      saveDraft={saveDraftToCloud}
      saveFinal={saveFinalInvoice}
      fetchHistory={fetchSavedInvoices}
      deleteHistory={deleteInvoice}
      initialData={initialData} 
    />
  );
}

export default App;