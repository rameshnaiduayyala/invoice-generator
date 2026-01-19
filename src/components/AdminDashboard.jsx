import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from '../firebase';
import { Users, LogOut, Trash2, Eye, Plus, ArrowLeft, Loader2, Search, Edit } from 'lucide-react';

const AdminDashboard = ({ currentUser, onLogout, onEditInvoice }) => { // <--- Accept onEditInvoice prop
  const [users, setUsers] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);
  const [userInvoices, setUserInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Add User State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const q = await getDocs(collection(db, "users"));
      setUsers(q.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.id !== currentUser.uid));
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const handleViewContent = async (targetUser) => {
    setIsLoading(true);
    setViewingUser(targetUser);
    try {
      const snap = await getDocs(collection(db, "invoices", targetUser.id, "history"));
      const sorted = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUserInvoices(sorted);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if(!confirm("Creating a user will temporarily sign you out. Continue?")) return;
    try {
      const userCred = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPass);
      await setDoc(doc(db, "users", userCred.user.uid), { email: newUserEmail, role: 'user', nurseryName: 'New Nursery' });
      alert("User Created! Please sign back in.");
    } catch (err) { alert(err.message); }
  };

  const handleDeleteUser = async (uid) => {
     if(confirm("Remove user?")) { await deleteDoc(doc(db, "users", uid)); fetchUsers(); }
  };

  // --- RENDER: INVOICE LIST ---
  if (viewingUser) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 font-sans">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => setViewingUser(null)} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-black font-bold text-sm">
            <ArrowLeft size={16}/> Back to Users
          </button>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-gray-800">{viewingUser.nurseryName || 'Unnamed Nursery'}</h2>
              <p className="text-gray-500 font-mono text-sm">{viewingUser.email}</p>
            </div>
            <div className="text-right">
              <span className="block text-xs font-bold text-gray-400 uppercase">Total Invoices</span>
              <span className="text-2xl font-bold text-blue-600">{userInvoices.length}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Invoice History</h3>
             </div>
             
             {userInvoices.length === 0 ? (
                <div className="p-10 text-center text-gray-400 italic">No invoices found.</div>
             ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Invoice No</th>
                      <th className="px-6 py-3">Client</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                      <th className="px-6 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-blue-50 transition group">
                        <td className="px-6 py-4 text-sm text-gray-600">{inv.date}</td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-800">{inv.invoiceNo}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">{inv.clientName}</td>
                        <td className="px-6 py-4 text-right font-mono text-green-700 font-bold">₹{inv.totalAmount?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                           {/* EDIT BUTTON: Calls the parent onEdit function with the invoice AND the user ID */}
                           <button 
                             onClick={() => onEditInvoice(inv, viewingUser.id)} 
                             className="flex items-center justify-center gap-1 bg-blue-100 text-blue-600 px-3 py-1.5 rounded font-bold text-xs hover:bg-blue-600 hover:text-white transition w-full"
                           >
                             <Edit size={14}/> EDIT
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><Users size={20} className="text-white"/></div>
          <div><h1 className="font-bold text-lg leading-none">Super Admin</h1><p className="text-xs text-gray-400">Manager</p></div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-bold"><LogOut size={16}/> Sign Out</button>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 font-bold text-sm">
            <Plus size={16}/> Add New User
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nursery Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-gray-800">{u.nurseryName || 'Untitled'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{u.email}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleViewContent(u)} className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition"><Eye size={18}/></button>
                    <button onClick={() => handleDeleteUser(u.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
       {/* Add User Modal Code (Same as before) */}
       {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1">Email</label><input type="email" required value={newUserEmail} onChange={e=>setNewUserEmail(e.target.value)} className="w-full border p-2 rounded"/></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1">Password</label><input type="password" required value={newUserPass} onChange={e=>setNewUserPass(e.target.value)} className="w-full border p-2 rounded"/></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Create & Logout</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;