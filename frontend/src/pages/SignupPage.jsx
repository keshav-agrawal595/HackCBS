// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';

// const SignupPage = () => {
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [message, setMessage] = useState('');
//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setMessage('');
//     if (password.length < 6) {
//       setError("Password must be at least 6 characters");
//       return;
//     }
//     try {
//       await signup(fullName, email, password);
//       setMessage("Success! Please log in.");
//       setTimeout(() => navigate('/login'), 2000);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div style={{ padding: '20px', maxWidth: '300px', margin: '50px auto' }}>
//       <h2>Sign Up</h2>
//       <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//         <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />
//         <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
//         <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
//         <button type="submit">Sign Up</button>
//       </form>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       {message && <p style={{ color: 'green' }}>{message}</p>}
//       <p>Have an account? <Link to="/login">Login</Link></p>
//     </div>
//   );
// };
// export default SignupPage;





// src/pages/SignupPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';

const SignupPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup, error, loading, user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // The signup function is defined in AuthContext and handles the API call
        await signup(fullName, email, password); 
    };

    // If the user is already logged in (e.g., successful signup), redirect to home
    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex items-center justify-center h-screen bg-[#28282B] text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-[#1e1e20] rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-pink-400">Sign Up</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Your Full Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-md font-semibold transition-colors ${
                            loading 
                                ? 'bg-gray-500 cursor-not-allowed' 
                                : 'bg-pink-500 hover:bg-pink-600'
                        }`}
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-pink-400 hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;