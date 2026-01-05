import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import Container from '../components/Container';
import conf from '../conf/conf';
import { login as authLogin } from '../store/authSlice';

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit } = useForm();

    const handleLogin = async (data: any) => {
        setError("");
        setLoading(true);
        try {
            // We can treat the input as either email or username based on your backend logic
            // Assuming your backend expects "email" or "username" field. 
            // Often backends have a unified field or check both.
            // Let's send it exactly as your backend expects. 
            // If your backend login controller looks for req.body.email or req.body.username:
            
            const response = await axios.post(
                `${conf.backendUrl}/users/login`, 
                data,
                { withCredentials: true } // IMPORTANT: This allows cookies to be set/read
            );
            
            if (response.data?.data?.user) {
                // Save the user to the Redux Store (The Brain)
                dispatch(authLogin(response.data.data.user));
                navigate("/"); // Go to Home
            }
            
        } catch (error: any) {
            console.error("Login Error:", error);
            setError(error.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0F0F0F] text-white p-4">
            <Container>
                <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
                    
                    <div className="mb-6 flex flex-col items-center gap-2">
                        <Logo className="text-2xl" />
                        <h2 className="text-xl font-semibold text-gray-200">Welcome Back</h2>
                        <p className="text-gray-400 text-sm">Login to manage your channel</p>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-500/10 p-2 rounded-lg">{error}</p>}

                    <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
                        
                        <Input 
                            label="Email" 
                            type="email" 
                            placeholder="you@example.com" 
                            {...register("email", { required: true })} 
                        />
                        
                        <Input 
                            label="Password" 
                            type="password" 
                            placeholder="••••••••" 
                            {...register("password", { required: true })} 
                        />

                        <Button type="submit" className="w-full mt-4" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={20} /> Logging in...
                                </div>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-purple-500 hover:text-purple-400 font-medium transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </Container>
        </div>
    );
}