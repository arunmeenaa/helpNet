import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from '../api'; 
import toast from 'react-hot-toast';
import { Mail, ShieldCheck, RefreshCcw } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({ 
    fullName: "", 
    email: "", 
    location: "", 
    password: "" 
  });
  
  const [step, setStep] = useState(1); 
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const registerToast = toast.loading('Sending verification code...');
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      toast.success("Verification code sent to your email! 📧", { id: registerToast });
      setStep(2); 
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { id: registerToast });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const verifyToast = toast.loading('Verifying code...');
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid or expired code");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`Welcome to HelpNet, ${data.user.fullName}! 🎉`, { id: verifyToast });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message, { id: verifyToast });
    } finally {
      setLoading(false);
    }
  };

  // Reusable input style to fix your dark mode issue
  const inputStyle = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <Navbar />

      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-teal-500/10 dark:bg-teal-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md">
          
          {step === 1 ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Join HelpNet</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Create an account to start helping your community</p>
              </div>

              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl dark:bg-red-500/10 text-center">{error}</div>}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <input type="text" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className={inputStyle} required />
                <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputStyle} required />
                <input type="text" placeholder="City or Neighborhood" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputStyle} />
                <input type="password" placeholder="Password (Min 6 chars)" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputStyle} required minLength={6} />
                <button type="submit" disabled={loading} className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg shadow-lg hover:-translate-y-0.5 transition-all">
                  {loading ? "Sending Code..." : "Create Account"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <ShieldCheck size={40} />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Verify Your Email</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Check your inbox for a 6-digit code sent to <br/>
                  <span className="font-semibold text-blue-600 dark:text-cyan-400">{formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input 
                  type="text" 
                  maxLength="6"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center text-3xl font-black tracking-[8px] p-4 rounded-xl bg-gray-50 dark:bg-gray-950/50 border-2 border-dashed border-gray-200 dark:border-gray-800 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                  required
                />
                
                <button 
                  type="submit" 
                  disabled={loading || otp.length < 6}
                  className="w-full py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg shadow-lg transition-all"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>

                <button 
                  type="button"
                  onClick={() => setStep(1)} 
                  className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-blue-600 mx-auto transition-colors"
                >
                  <RefreshCcw size={14} /> Back to edit details
                </button>
              </form>
            </div>
          )}

          {step === 1 && (
            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account? <Link to="/login" className="text-blue-600 dark:text-cyan-400 font-bold hover:underline">Sign in here</Link>
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}