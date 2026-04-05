import { useState, useEffect, useCallback } from "react";

const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
];

const DEFAULT_COLUMNS = [
  { id: "description", label: "Description", type: "text", required: true, deletable: false },
  { id: "qty", label: "Qty", type: "number", required: true, deletable: false },
  { id: "size", label: "Size", type: "text", required: false, deletable: true },
  { id: "rate", label: "Rate", type: "number", required: true, deletable: false },
  { id: "discount", label: "Disc %", type: "number", required: false, deletable: true },
  { id: "tax", label: "Tax %", type: "number", required: false, deletable: true },
  { id: "amount", label: "Amount", type: "computed", required: true, deletable: false },
];

const SIZE_SUGGESTIONS = [
  "7*8",
  "8*10",
  "10*12",
  "13*13",
  "18*18",
  "21*21",
  "Small Bag",
  "Medium Bag",
  "Big Bag",
];

function makeRow(columns) {
  const row = { id: Date.now() + Math.random(), rowType: "item" };
  columns.forEach((c) => { row[c.id] = ""; });
  return row;
}

function makeHeadingRow(columns) {
  const row = { id: Date.now() + Math.random(), rowType: "heading" };
  columns.forEach((c) => { row[c.id] = ""; });
  return row;
}

function computeAmount(row) {
  if (row.rowType === "heading") return 0;
  const qty = parseFloat(row.qty) || 0;
  const rate = parseFloat(row.rate) || 0;
  const discount = parseFloat(row.discount) || 0;
  const tax = parseFloat(row.tax) || 0;
  const base = qty * rate;
  const discounted = base - (base * discount) / 100;
  return discounted + (discounted * tax) / 100;
}

const INITIAL_STATE = {
  docType: "INVOICE",
  invoiceNo: "INV-2026-001",
  invoiceDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  poNumber: "",
  currency: CURRENCY_OPTIONS[0],
  company: {
    name: "Gangadhara Nursery",
    address: "Nh-5,Venkayammapeta",
    city: "Rajahmundry, Andhra Pradesh 533126",
    phone: "+91 79894 19864",
    email: "techrammy@gmail.com",
    gstin: "36AABCU9603R1ZP",
    pan: "AABCU9603R",
    logo: null,
    bankName: "HDFC Bank Ltd.",
    accountNo: "50200012345678",
    ifsc: "HDFC0001234",
    branch: "Banjara Hills Branch",
  },
  client: { name: "", address: "", city: "", gstin: "", email: "", phone: "" },
  columns: DEFAULT_COLUMNS,
  rows: [makeRow(DEFAULT_COLUMNS), makeRow(DEFAULT_COLUMNS)],
  extraCharges: [],
  taxOnCharges: false,
  discount: { type: "percent", value: "" },
  showSignature: true,
  termsTitle: "Terms & Conditions",
  terms: "1. Payment due within 30 days of invoice date.\n2. Goods once sold are non-returnable.\n3. Subject to Hyderabad jurisdiction.",
  notes: "",
  showBankDetails: true,
  showStamp: true,
  theme: "navy",
};

const THEMES = {
  navy:    { primary: "#1a2e4a", accent: "#2563eb", light: "#eff6ff", border: "#bfdbfe", text: "#1e3a5f" },
  emerald: { primary: "#064e3b", accent: "#059669", light: "#ecfdf5", border: "#a7f3d0", text: "#065f46" },
  crimson: { primary: "#7f1d1d", accent: "#dc2626", light: "#fef2f2", border: "#fecaca", text: "#991b1b" },
  slate:   { primary: "#1e293b", accent: "#475569", light: "#f1f5f9", border: "#cbd5e1", text: "#334155" },
  violet:  { primary: "#2e1065", accent: "#7c3aed", light: "#f5f3ff", border: "#ddd6fe", text: "#4c1d95" },
};

function fmt(n, sym) {
  return sym + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toWords(amount) {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10?" "+ones[n%10]:"");
    if (n < 1000) return ones[Math.floor(n/100)]+" Hundred"+(n%100?" "+convert(n%100):"");
    if (n < 100000) return convert(Math.floor(n/1000))+" Thousand"+(n%1000?" "+convert(n%1000):"");
    if (n < 10000000) return convert(Math.floor(n/100000))+" Lakh"+(n%100000?" "+convert(n%100000):"");
    return convert(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+convert(n%10000000):"");
  }
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let result = convert(rupees) || "Zero";
  result += " Rupees";
  if (paise > 0) result += " and " + convert(paise) + " Paise";
  return result + " Only";
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function InvoiceApp() {
  const [inv, setInv] = useState(() => {
    try { const s = localStorage.getItem("invoice_app_v4"); return s ? JSON.parse(s) : INITIAL_STATE; }
    catch { return INITIAL_STATE; }
  });
  const [view, setView] = useState("edit");
  const [activeTab, setActiveTab] = useState("details");
  const [editingCol, setEditingCol] = useState(false);
  const [newColLabel, setNewColLabel] = useState("New Column");
  const [newColType, setNewColType] = useState("text");
  const [toast, setToast] = useState(null);

  const theme = THEMES[inv.theme] || THEMES.navy;

  useEffect(() => {
    try { localStorage.setItem("invoice_app_v4", JSON.stringify(inv)); } catch {}
  }, [inv]);

  const upd = useCallback((patch) => setInv((p) => ({ ...p, ...patch })), []);
  const updCompany = (patch) => setInv((p) => ({ ...p, company: { ...p.company, ...patch } }));
  const updClient  = (patch) => setInv((p) => ({ ...p, client:  { ...p.client,  ...patch } }));
  const showToast  = (msg)   => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // Rows
  const addRow  = () => setInv((p) => ({ ...p, rows: [...p.rows, makeRow(p.columns)] }));
  const addHeadingRow = () => setInv((p) => ({ ...p, rows: [...p.rows, makeHeadingRow(p.columns)] }));
  const delRow  = (id) => setInv((p) => ({ ...p, rows: p.rows.filter((r) => r.id !== id) }));
  const updRow  = (id, field, val) => setInv((p) => ({ ...p, rows: p.rows.map((r) => r.id === id ? { ...r, [field]: val } : r) }));
  const moveRow = (idx, dir) => setInv((p) => {
    const rows = [...p.rows]; const target = idx + dir;
    if (target < 0 || target >= rows.length) return p;
    [rows[idx], rows[target]] = [rows[target], rows[idx]];
    return { ...p, rows };
  });

  // Columns
  const addColumn = () => {
    const id = "col_" + Date.now();
    const newCol = { id, label: newColLabel || "Column", type: newColType, required: false, deletable: true };
    setInv((p) => ({
      ...p,
      columns: [...p.columns.slice(0, -1), newCol, p.columns[p.columns.length - 1]],
      rows: p.rows.map((r) => ({ ...r, [id]: "" })),
    }));
    setEditingCol(false);
    setNewColLabel("New Column");
    showToast("Column added");
  };
  const delColumn    = (id) => setInv((p) => ({ ...p, columns: p.columns.filter((c) => c.id !== id), rows: p.rows.map((r) => { const nr={...r}; delete nr[id]; return nr; }) }));
  const renameColumn = (id, label) => setInv((p) => ({ ...p, columns: p.columns.map((c) => c.id === id ? { ...c, label } : c) }));

  // Extra charges
  const addCharge = () => setInv((p) => ({ ...p, extraCharges: [...p.extraCharges, { id: Date.now(), label: "Loading Charges", amount: "" }] }));
  const updCharge = (id, patch) => setInv((p) => ({ ...p, extraCharges: p.extraCharges.map((c) => c.id === id ? { ...c, ...patch } : c) }));
  const delCharge = (id) => setInv((p) => ({ ...p, extraCharges: p.extraCharges.filter((c) => c.id !== id) }));

  // Totals
  const subtotal    = inv.rows.reduce((s, r) => s + computeAmount(r), 0);
  const extraTotal  = inv.extraCharges.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const discountAmt = inv.discount.type === "percent"
    ? (subtotal * (parseFloat(inv.discount.value) || 0)) / 100
    : parseFloat(inv.discount.value) || 0;
  const grandTotal  = subtotal - discountAmt + extraTotal;
  const sym         = inv.currency.symbol;

  const handleLogo = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updCompany({ logo: ev.target.result });
    reader.readAsDataURL(file);
  };

  const resetAll = () => { setInv(INITIAL_STATE); showToast("Reset to defaults"); };
  const newDoc   = () => { setInv({ ...INITIAL_STATE, invoiceNo: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`, invoiceDate: new Date().toISOString().split("T")[0] }); showToast("New document created"); };
  const handlePrint = () => { setView("preview"); setTimeout(() => window.print(), 400); };

  const tabs = [
    { id: "details",  icon: "📋", label: "Details"  },
    { id: "client",   icon: "👤", label: "Client"   },
    { id: "items",    icon: "📦", label: "Items"    },
    { id: "charges",  icon: "➕", label: "Charges"  },
    { id: "settings", icon: "⚙",  label: "Settings" },
  ];

  const docTypes = ["INVOICE","QUOTATION","PROFORMA INVOICE","PURCHASE ORDER","DELIVERY CHALLAN","CREDIT NOTE"];

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Print CSS */}
      <style>{`
        .print-color-exact {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          @page { size: A4; margin: 12mm; }
          .print-color-exact {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        .print-only { display: none; }
      `}</style>

      {/* Print-only invoice */}
      <div className="print-only">
        <InvoiceDocument inv={inv} theme={theme} sym={sym} subtotal={subtotal}
          extraTotal={extraTotal} discountAmt={discountAmt} grandTotal={grandTotal} editMode={false} />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-5 py-2.5 rounded-lg text-white text-sm font-semibold shadow-2xl no-print"
          style={{ background: theme.primary }}>{toast}</div>
      )}

      {/* ── TOPBAR ── */}
      <div className="no-print sticky top-0 z-40 flex items-center gap-3 px-6 h-14 shadow-md"
        style={{ background: theme.primary }}>
        <span className="text-white text-lg font-extrabold tracking-wider">⚡Gangadhara Nursery Invoice</span>
        <div className="flex-1" />

        <select value={inv.docType} onChange={(e) => upd({ docType: e.target.value })}
          className="text-sm font-semibold rounded-md px-3 py-1 cursor-pointer focus:outline-none"
          style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)" }}>
          {docTypes.map(t => <option key={t} value={t} className="text-black bg-white">{t}</option>)}
        </select>

        <select value={inv.theme} onChange={(e) => upd({ theme: e.target.value })}
          className="text-sm rounded-md px-3 py-1 cursor-pointer focus:outline-none"
          style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)" }}>
          {Object.keys(THEMES).map(t => <option key={t} value={t} className="text-black bg-white">{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
        </select>

        <div className="flex gap-1.5">
          {["edit","preview"].map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-3.5 py-1 rounded-md text-sm font-semibold transition-all cursor-pointer"
              style={{ background: view===v ? "#fff" : "transparent", color: view===v ? theme.primary : "#fff", border: "1px solid rgba(255,255,255,0.4)" }}>
              {v === "edit" ? "✏ Edit" : "👁 Preview"}
            </button>
          ))}
          <button onClick={handlePrint}
            className="px-3.5 py-1 rounded-md text-sm font-semibold text-white cursor-pointer border-0"
            style={{ background: theme.accent }}>🖨 Print</button>
          <button onClick={newDoc}
            className="px-3.5 py-1 rounded-md text-sm text-white cursor-pointer"
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.4)" }}>+ New</button>
          <button onClick={resetAll}
            className="px-3.5 py-1 rounded-md text-sm text-white cursor-pointer"
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.4)" }}>↺ Reset</button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="no-print flex" style={{ height: "calc(100vh - 56px)" }}>

        {/* SIDEBAR */}
        <div className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-slate-200 flex-shrink-0">
            {tabs.map(({ id, icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className="flex-1 flex flex-col items-center py-2.5 gap-0.5 border-b-2 transition-colors cursor-pointer"
                style={{ borderBottomColor: activeTab===id ? theme.accent : "transparent", color: activeTab===id ? theme.accent : "#94a3b8" }}>
                <span className="text-lg leading-none">{icon}</span>
                <span className="font-bold uppercase" style={{ fontSize: 9 }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Scrollable tab content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* DETAILS */}
            {activeTab === "details" && <>
              <Sec title="Document Info">
                <Field label="Number"      value={inv.invoiceNo}   onChange={v => upd({ invoiceNo: v })} />
                <Field label="Date"        type="date" value={inv.invoiceDate} onChange={v => upd({ invoiceDate: v })} />
                <Field label="Due Date"    type="date" value={inv.dueDate}     onChange={v => upd({ dueDate: v })} />
                <Field label="PO / Ref No." value={inv.poNumber}  onChange={v => upd({ poNumber: v })} />
                <div>
                  <SideLabel>Currency</SideLabel>
                  <select value={inv.currency.code} onChange={e => upd({ currency: CURRENCY_OPTIONS.find(c => c.code===e.target.value) })}
                    className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400">
                    {CURRENCY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.label}</option>)}
                  </select>
                </div>
              </Sec>

              <Sec title="Your Company">
                <div>
                  <SideLabel>Logo</SideLabel>
                  <div className="flex items-center gap-2 flex-wrap">
                    {inv.company.logo && (
                      <img src={inv.company.logo} alt="" className="h-9 max-w-[72px] object-contain border border-slate-200 rounded" />
                    )}
                    <label className="cursor-pointer px-2.5 py-1 text-xs rounded-md border font-medium"
                      style={{ background: theme.light, color: theme.text, borderColor: theme.border }}>
                      {inv.company.logo ? "Change" : "Upload Logo"}
                      <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                    </label>
                    {inv.company.logo && (
                      <button onClick={() => updCompany({ logo: null })}
                        className="px-2 py-0.5 text-xs rounded border border-red-200 bg-red-50 text-red-600 cursor-pointer">×</button>
                    )}
                  </div>
                </div>
                <Field label="Company Name" value={inv.company.name}    onChange={v => updCompany({ name: v })} />
                <Field label="Address"      value={inv.company.address} onChange={v => updCompany({ address: v })} />
                <Field label="City / State" value={inv.company.city}    onChange={v => updCompany({ city: v })} />
                <Field label="Phone"        value={inv.company.phone}   onChange={v => updCompany({ phone: v })} />
                <Field label="Email"        value={inv.company.email}   onChange={v => updCompany({ email: v })} />
                <Field label="GSTIN"        value={inv.company.gstin}   onChange={v => updCompany({ gstin: v })} />
                <Field label="PAN"          value={inv.company.pan}     onChange={v => updCompany({ pan: v })} />
              </Sec>

              <Sec title="Bank Details">
                <Toggle label="Show Bank Details" checked={inv.showBankDetails} onChange={v => upd({ showBankDetails: v })} theme={theme} />
                {inv.showBankDetails && <>
                  <Field label="Bank Name"   value={inv.company.bankName}  onChange={v => updCompany({ bankName: v })} />
                  <Field label="Account No." value={inv.company.accountNo} onChange={v => updCompany({ accountNo: v })} />
                  <Field label="IFSC Code"   value={inv.company.ifsc}      onChange={v => updCompany({ ifsc: v })} />
                  <Field label="Branch"      value={inv.company.branch}    onChange={v => updCompany({ branch: v })} />
                </>}
              </Sec>
            </>}

            {/* CLIENT */}
            {activeTab === "client" && (
              <Sec title="Bill To">
                <Field label="Client Name *" value={inv.client.name}    onChange={v => updClient({ name: v })} />
                <Field label="Address"        value={inv.client.address} onChange={v => updClient({ address: v })} />
                <Field label="City, State"    value={inv.client.city}    onChange={v => updClient({ city: v })} />
                <Field label="GSTIN"          value={inv.client.gstin}   onChange={v => updClient({ gstin: v })} />
                <Field label="Email"          value={inv.client.email}   onChange={v => updClient({ email: v })} />
                <Field label="Phone"          value={inv.client.phone}   onChange={v => updClient({ phone: v })} />
              </Sec>
            )}

            {/* ITEMS */}
            {activeTab === "items" && <>
              <Sec title="Manage Columns">
                <div className="space-y-1.5">
                  {inv.columns.map(col => (
                    <div key={col.id} className="flex items-center gap-1.5">
                      <input value={col.label} onChange={e => renameColumn(col.id, e.target.value)}
                        className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400 bg-white" />
                      {col.deletable && (
                        <button onClick={() => delColumn(col.id)}
                          className="px-2 py-0.5 text-xs rounded border border-red-200 bg-red-50 text-red-600 cursor-pointer hover:bg-red-100">×</button>
                      )}
                    </div>
                  ))}
                </div>

                {editingCol ? (
                  <div className="mt-2 p-3 rounded-lg border space-y-2" style={{ background: theme.light, borderColor: theme.border }}>
                    <Field label="Column Name" value={newColLabel} onChange={setNewColLabel} />
                    <div>
                      <SideLabel>Type</SideLabel>
                      <select value={newColType} onChange={e => setNewColType(e.target.value)}
                        className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none">
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addColumn}
                        className="flex-1 py-1.5 rounded-md text-white text-sm font-semibold cursor-pointer border-0"
                        style={{ background: theme.accent }}>Add</button>
                      <button onClick={() => setEditingCol(false)}
                        className="flex-1 py-1.5 rounded-md bg-slate-100 text-slate-600 text-sm cursor-pointer border border-slate-200 hover:bg-slate-200">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setEditingCol(true)}
                    className="w-full mt-1 py-1.5 rounded-md text-sm font-medium cursor-pointer border border-dashed"
                    style={{ background: theme.light, color: theme.text, borderColor: theme.border }}>
                    + Add Column
                  </button>
                )}
              </Sec>

              <Sec title="Overall Discount">
                <div className="flex gap-2">
                  <select value={inv.discount.type} onChange={e => upd({ discount: { ...inv.discount, type: e.target.value } })}
                    className="w-20 border border-slate-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none">
                    <option value="percent">%</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  <input type="number" placeholder="0" value={inv.discount.value}
                    onChange={e => upd({ discount: { ...inv.discount, value: e.target.value } })}
                    className="flex-1 border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-white" />
                </div>
              </Sec>
            </>}

            {/* CHARGES */}
            {activeTab === "charges" && (
              <Sec title="Extra Charges">
                <div className="space-y-3">
                  {inv.extraCharges.map(c => (
                    <div key={c.id} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <input value={c.label} onChange={e => updCharge(c.id, { label: e.target.value })}
                          placeholder="Charge name"
                          className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400 bg-white" />
                        <input type="number" value={c.amount} onChange={e => updCharge(c.id, { amount: e.target.value })}
                          placeholder="Amount"
                          className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400 bg-white" />
                      </div>
                      <button onClick={() => delCharge(c.id)}
                        className="mt-1 px-2 py-0.5 text-xs rounded border border-red-200 bg-red-50 text-red-600 cursor-pointer hover:bg-red-100">×</button>
                    </div>
                  ))}
                </div>
                <button onClick={addCharge}
                  className="w-full py-1.5 rounded-md text-sm font-medium cursor-pointer border border-dashed mt-1"
                  style={{ background: theme.light, color: theme.text, borderColor: theme.border }}>
                  + Add Charge
                </button>
                {inv.extraCharges.length > 0 && (
                  <Toggle label="Apply tax on extra charges" checked={inv.taxOnCharges} onChange={v => upd({ taxOnCharges: v })} theme={theme} />
                )}
              </Sec>
            )}

            {/* SETTINGS */}
            {activeTab === "settings" && <>
              <Sec title="Invoice Options">
                <Toggle label="Show Signature Block" checked={inv.showSignature}  onChange={v => upd({ showSignature: v })}  theme={theme} />
                <Toggle label="Show Stamp"           checked={inv.showStamp}      onChange={v => upd({ showStamp: v })}      theme={theme} />
                <Toggle label="Show Bank Details"    checked={inv.showBankDetails} onChange={v => upd({ showBankDetails: v })} theme={theme} />
              </Sec>
              <Sec title="Terms & Notes">
                <Field label="Terms Title" value={inv.termsTitle} onChange={v => upd({ termsTitle: v })} />
                <div>
                  <SideLabel>Terms & Conditions</SideLabel>
                  <textarea value={inv.terms} onChange={e => upd({ terms: e.target.value })} rows={5}
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs font-sans resize-y focus:outline-none focus:border-blue-400 bg-white" />
                </div>
                <div>
                  <SideLabel>Notes / Remarks</SideLabel>
                  <textarea value={inv.notes} onChange={e => upd({ notes: e.target.value })} rows={3}
                    placeholder="Notes for client..."
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs font-sans resize-y focus:outline-none focus:border-blue-400 bg-white" />
                </div>
              </Sec>
            </>}

          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
            <InvoiceDocument
              inv={inv} theme={theme} sym={sym}
              subtotal={subtotal} extraTotal={extraTotal} discountAmt={discountAmt} grandTotal={grandTotal}
              editMode={view === "edit"}
              onUpdRow={updRow} onDelRow={delRow} onMoveRow={moveRow} onAddRow={addRow} onAddHeadingRow={addHeadingRow}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INVOICE DOCUMENT ────────────────────────────────────────────────────────
function InvoiceDocument({ inv, theme, sym, subtotal, extraTotal, discountAmt, grandTotal, editMode, onUpdRow, onDelRow, onMoveRow, onAddRow, onAddHeadingRow }) {
  const f = (n) => fmt(n, sym);

  return (
    <div className="font-sans text-slate-800 print-color-exact">

      {/* HEADER BAND */}
      <div className="flex justify-between items-start px-8 py-6 text-white" style={{ background: theme.primary }}>
        <div>
          {inv.company.logo
            ? <img src={inv.company.logo} alt="logo" className="h-14 max-w-[160px] object-contain mb-2" style={{ filter: "brightness(0) invert(1)" }} />
            : <div className="text-2xl font-extrabold tracking-wide mb-1">{inv.company.name}</div>
          }
          {inv.company.logo && <div className="text-base font-bold mb-1">{inv.company.name}</div>}
          <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            <div>{inv.company.address}</div>
            <div>{inv.company.city}</div>
            <div>{inv.company.phone} | {inv.company.email}</div>
            {inv.company.gstin && <div>GSTIN: {inv.company.gstin} | PAN: {inv.company.pan}</div>}
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-3xl font-extrabold tracking-widest mb-3">{inv.docType}</div>
          <table className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.9)", borderCollapse: "collapse" }}>
            <tbody>
              <InfoRow label="Number"   value={inv.invoiceNo} />
              <InfoRow label="Date"     value={inv.invoiceDate} />
              {inv.dueDate   && <InfoRow label="Due Date" value={inv.dueDate} />}
              {inv.poNumber  && <InfoRow label="Ref. No." value={inv.poNumber} />}
              <InfoRow label="Currency" value={`${inv.currency.code} (${inv.currency.symbol})`} />
            </tbody>
          </table>
        </div>
      </div>

      {/* BILL TO + TOTAL PILL */}
      <div className="flex justify-between items-start px-8 py-4 border-b-2" style={{ background: theme.light, borderColor: theme.border }}>
        <div className="flex-1">
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: theme.accent }}>Bill To</div>
          <div className="text-base font-bold mb-1" style={{ color: theme.primary }}>{inv.client.name || "— Client Name —"}</div>
          <div className="text-xs text-slate-500 leading-relaxed">
            {inv.client.address && <div>{inv.client.address}</div>}
            {inv.client.city    && <div>{inv.client.city}</div>}
            {inv.client.gstin   && <div>GSTIN: {inv.client.gstin}</div>}
            {inv.client.phone   && <div>{inv.client.phone}</div>}
            {inv.client.email   && <div>{inv.client.email}</div>}
          </div>
        </div>
        {/* <div className="text-white rounded-xl px-6 py-3 text-right flex-shrink-0 ml-4" style={{ background: theme.primary }}>
          <div className="text-[11px] opacity-75 mb-0.5">Grand Total</div>
          <div className="text-2xl font-extrabold">{f(grandTotal)}</div>
        </div> */}
      </div>

      {/* ITEMS TABLE */}
      <div className="px-8 py-5">
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: theme.border }}>
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="print-color-exact" style={{ backgroundColor: theme.primary }}>
                <th className="px-3 py-2.5 text-center text-white text-[11px] font-semibold w-8">#</th>
                {inv.columns.map(col => (
                  <th key={col.id}
                    className={`px-3 py-2.5 text-white text-[11px] font-semibold whitespace-nowrap ${col.type === "number" || col.type === "computed" ? "text-right" : "text-left"}`}>
                    {col.label.toUpperCase()}
                  </th>
                ))}
                {editMode && <th className="px-2 py-2.5 text-white text-[11px] text-center w-24">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {inv.rows.map((row, idx) => {
                const isHeading = row.rowType === "heading";
                const amt = computeAmount(row);
                const rowBg = isHeading ? theme.light : idx % 2 === 0 ? "#ffffff" : theme.light;
                const rowStyle = isHeading
                  ? {
                      backgroundColor: theme.light,
                      borderBottom: `1px solid ${theme.border}`,
                      borderTop: `2px solid ${theme.accent}`,
                    }
                  : {
                      backgroundColor: rowBg,
                      borderBottom: `1px solid ${theme.border}`,
                    };
                return (
                  <tr key={row.id} className="print-color-exact" style={rowStyle}>
                    <td className={`px-3 py-2 text-center text-xs ${isHeading ? "font-bold" : "text-slate-400"}`} style={isHeading ? { color: theme.accent } : undefined}>
                      {isHeading ? "" : idx + 1}
                    </td>
                    {inv.columns.map(col => (
                      <td key={col.id} className={`px-3 ${isHeading ? "py-2.5" : "py-1.5"} ${col.type === "number" || col.type === "computed" ? "text-right" : "text-left"}`}>
                        {isHeading
                          ? (col.id === "description"
                              ? editMode
                                ? <textarea
                                    value={row[col.id] || ""}
                                    onChange={e => onUpdRow(row.id, col.id, e.target.value)}
                                    placeholder="Section heading"
                                    rows={2}
                                    className="w-full min-w-0 bg-transparent border-0 outline-none text-sm font-bold uppercase tracking-[0.2em] placeholder-slate-400 resize-y leading-relaxed"
                                    style={{ color: theme.primary, fontFamily: "inherit" }}
                                  />
                                : <div className="text-sm font-bold uppercase tracking-[0.2em] leading-relaxed" style={{ color: theme.primary }}>
                                    {row[col.id] || "Section"}
                                  </div>
                              : <span className="block h-5" />)
                          : col.type === "computed"
                          ? <span className="font-semibold text-sm" style={{ color: theme.primary }}>{f(amt)}</span>
                          : editMode
                            ? col.id === "size"
                              ? <>
                                  <input
                                    type="text"
                                    list="invoice-size-options"
                                    value={row[col.id] || ""}
                                    onChange={e => onUpdRow(row.id, col.id, e.target.value)}
                                    placeholder="Bag size"
                                    className="w-full min-w-0 bg-transparent border-0 outline-none text-sm text-left text-slate-800 placeholder-slate-300"
                                    style={{ fontFamily: "inherit" }}
                                  />
                                  <datalist id="invoice-size-options">
                                    {SIZE_SUGGESTIONS.map((size) => (
                                      <option key={size} value={size} />
                                    ))}
                                  </datalist>
                                </>
                              : <input
                                  type={col.type === "number" ? "number" : "text"}
                                  value={row[col.id] || ""}
                                  onChange={e => onUpdRow(row.id, col.id, e.target.value)}
                                  placeholder={col.label}
                                  className={`w-full min-w-0 bg-transparent border-0 outline-none text-sm text-slate-800 placeholder-slate-300 ${col.type === "number" ? "text-right" : "text-left"}`}
                                  style={{ fontFamily: "inherit" }}
                                />
                            : <span className="text-sm">{row[col.id]}</span>
                        }
                      </td>
                    ))}
                    {editMode && (
                      <td className="px-2 py-1 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => onMoveRow(idx, -1)}
                            className="px-1.5 py-0.5 text-xs border border-slate-200 rounded bg-slate-50 text-slate-500 hover:bg-slate-100 cursor-pointer">↑</button>
                          <button onClick={() => onMoveRow(idx, 1)}
                            className="px-1.5 py-0.5 text-xs border border-slate-200 rounded bg-slate-50 text-slate-500 hover:bg-slate-100 cursor-pointer">↓</button>
                          <button onClick={() => onDelRow(row.id)}
                            className="px-1.5 py-0.5 text-xs border border-red-200 rounded bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer">×</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {editMode && (
                <tr style={{ background: theme.light }}>
                  <td colSpan={inv.columns.length + 2} className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={onAddRow}
                        className="px-4 py-1.5 text-sm font-medium rounded-md border border-dashed cursor-pointer transition-colors"
                        style={{ background: "#fff", color: theme.text, borderColor: theme.border }}>
                        + Add Row
                      </button>
                      <button onClick={onAddHeadingRow}
                        className="px-4 py-1.5 text-sm font-medium rounded-md border cursor-pointer transition-colors"
                        style={{ background: theme.light, color: theme.primary, borderColor: theme.border }}>
                        + Add Heading
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="flex justify-end mt-6">
          <div className="w-80 space-y-0.5">
            <TotalRow label="Subtotal" value={f(subtotal)} />
            {(parseFloat(inv.discount.value) || 0) > 0 && (
              <TotalRow label={`Discount${inv.discount.type==="percent" ? ` (${inv.discount.value}%)` : ""}`} value={`− ${f(discountAmt)}`} red />
            )}
            {inv.extraCharges.map(c => (
              <TotalRow key={c.id} label={c.label || "Extra Charge"} value={f(parseFloat(c.amount)||0)} />
            ))}
            <div className="h-px my-2" style={{ background: theme.border }} />
            <div className="flex justify-between items-center rounded-xl px-4 py-3 text-white"
              style={{ background: theme.primary }}>
              <span className="font-bold text-sm">GRAND TOTAL</span>
              <span className="font-extrabold text-xl">{f(grandTotal)}</span>
            </div>
            <div className="mt-2 px-3 py-2 rounded-lg border text-xs" style={{ background: theme.light, borderColor: theme.border }}>
              <div className="text-slate-400 mb-0.5 text-[10px] uppercase tracking-wide">Amount in Words</div>
              <div className="font-semibold italic leading-snug" style={{ color: theme.primary }}>{toWords(grandTotal)}</div>
            </div>
          </div>
        </div>

        {/* NOTES */}
        {inv.notes && (
          <div className="mt-5 px-4 py-3 rounded-lg border border-amber-200 bg-amber-50">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 mb-1">Notes / Remarks</div>
            <div className="text-xs text-amber-900 whitespace-pre-wrap leading-relaxed">{inv.notes}</div>
          </div>
        )}
      </div>

      {/* BANK + TERMS + SIGNATURE */}
      <div className="px-8 pb-6 flex gap-6">
        <div className="flex-[2] space-y-4">
          {inv.showBankDetails && (
            <div className="p-4 rounded-lg border" style={{ background: theme.light, borderColor: theme.border }}>
              <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: theme.accent }}>Bank Details</div>
              <table className="text-xs" style={{ borderCollapse: "collapse" }}>
                <tbody>
                  {[["Bank", inv.company.bankName], ["Account No.", inv.company.accountNo], ["IFSC", inv.company.ifsc], ["Branch", inv.company.branch]].map(([l, v]) => v && (
                    <tr key={l}>
                      <td className="text-slate-500 pr-5 pb-1 align-top">{l}</td>
                      <td className="font-semibold pb-1" style={{ color: theme.primary }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {inv.terms && (
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">{inv.termsTitle}</div>
              <div className="text-[11px] text-slate-500 whitespace-pre-wrap leading-relaxed">{inv.terms}</div>
            </div>
          )}
        </div>

        {inv.showSignature && (
          <div className="flex-1 flex flex-col items-center justify-end">
            {inv.showStamp && (
              <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mb-3 opacity-20"
                style={{ borderColor: theme.accent }}>
                <span className="text-[9px] font-extrabold uppercase text-center" style={{ color: theme.accent }}>STAMP</span>
              </div>
            )}
            <div className="w-full border-t-2 pt-2 text-center" style={{ borderColor: theme.primary }}>
              <div className="text-xs font-bold" style={{ color: theme.primary }}>{inv.company.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Authorised Signatory</div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center px-8 py-2.5" style={{ background: theme.primary }}>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>Thank you for your business!</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>Developed By Ramesh Ayyala • {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}

// ─── SMALL SHARED COMPONENTS ─────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <tr>
      <td className="pr-3 pb-1 align-top" style={{ color: "rgba(255,255,255,0.65)" }}>{label}:</td>
      <td className="font-semibold pb-1 align-top">{value}</td>
    </tr>
  );
}

function TotalRow({ label, value, red }) {
  return (
    <div className="flex justify-between items-center px-2 py-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${red ? "text-red-600" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}

function Sec({ title, children }) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pt-1">{title}</div>
      {children}
    </div>
  );
}

function SideLabel({ children }) {
  return <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">{children}</label>;
}

function Field({ label, type = "text", value, onChange }) {
  return (
    <div>
      <SideLabel>{label}</SideLabel>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-white" />
    </div>
  );
}

function Toggle({ label, checked, onChange, theme }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <button
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer border-0 p-0"
        style={{ background: checked ? theme.accent : "#cbd5e1" }}>
        <span
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 block"
          style={{ left: checked ? "18px" : "2px" }} />
      </button>
      <span className="text-xs text-slate-500 select-none">{label}</span>
    </div>
  );
}
